/* eslint-disable */
import uuid from '@/utils/uuid'
import Attachment from '@/views/Flatten/Attachment'
import TestStandard from '@/views/Cim/TestStandard'
import CircuitBreakerJobDto from '@/views/Dto/Job/CircuitBreaker'
import CircuitBreakerTestMap from '@/config/test-definitions/CircuitBreaker'
import CircuitBreakerConditionMap from '@/config/testing-condition/CircuitBreaker'
import circuitBreakerAssessmentMap from '@/config/testing-assessment/CircuitBreaker'
import * as common from '@/views/JobView/Common/index'
import { findTestConfig } from '@/config/ptm-import'

const str = value => (value === null || value === undefined) ? '' : String(value)

const toDate = value => {
    const match = str(value).trim().match(/^(\d{4}-\d{2}-\d{2})/)
    return match ? match[1] : ''
}

const scaled = (source, factor) => {
    const raw = source && source.value
    if (raw === '' || raw === null || raw === undefined) return ''
    const numeric = Number(raw)
    if (!Number.isFinite(numeric)) return ''
    const multiplier = factor === undefined || factor === null ? 1 : Number(factor)
    return multiplier === 1 ? str(raw) : str(numeric * multiplier)
}

const ensureCellMrids = holder => {
    Object.keys(holder || {}).forEach(key => {
        const cell = holder[key]
        if (!cell || typeof cell !== 'object' || !cell.type || !Object.prototype.hasOwnProperty.call(cell, 'value')) return
        if (!cell.mrid) cell.mrid = uuid.newUuid()
    })
}

const buildRow = (template, measurement, config) => {
    const row = JSON.parse(JSON.stringify(template))
    row.mrid = uuid.newUuid()

    Object.keys(config.columns || {}).forEach(code => {
        const spec = config.columns[code]
        if (!row[code]) return
        row[code].value = spec.kind === 'scalar'
            ? str(measurement[spec.from])
            : scaled(measurement[spec.from], spec.factor)
    })

    if (config.assessment && row[config.assessment.to || 'assessment']) {
        const raw = str(measurement[config.assessment.from])
        const aliases = config.assessment.map || {}
        row[config.assessment.to || 'assessment'].value = Object.prototype.hasOwnProperty.call(aliases, raw)
            ? aliases[raw]
            : ''
    }

    ensureCellMrids(row)
    return row
}

const applyJobConditions = (condition, jobConditions) => {
    const put = (code, value) => {
        if (!condition[code] || value === '' || value === null || value === undefined) return
        if (str(value).trim().toLowerCase() === 'empty') return
        condition[code].value = str(value)
    }
    const conditions = jobConditions || {}
    put('weather', conditions.weather)
    put('ambient_temp', conditions.ambientTemperature && conditions.ambientTemperature.value)
    put('reference_temp', conditions.ambientTemperature && conditions.ambientTemperature.value)
    put('humidity', conditions.humidity && conditions.humidity.value)
}

const buildTest = (ptmTest, testCode, config, jobConditions) => {
    const definition = CircuitBreakerTestMap[testCode]
    const rowTemplate = common.buildEmptyTestRow(definition.columns)
    const conditionDefinition = CircuitBreakerConditionMap[testCode]
    const condition = conditionDefinition
        ? common.buildEmptyTestCondition(conditionDefinition.columns)
        : {}
    const assessmentDefinition = circuitBreakerAssessmentMap[testCode]
    const assessment = assessmentDefinition
        ? common.buildEmptyTestAssessment(assessmentDefinition.testStandard || [])
        : []

    applyJobConditions(condition, jobConditions)
    ensureCellMrids(condition)

    const testMrid = uuid.newUuid()
    const testStandard = new TestStandard()
    testStandard.mrid = uuid.newUuid()
    testStandard.work_task_id = testMrid

    return {
        mrid: testMrid,
        name: definition.testName || testCode,
        testTypeId: definition.testId,
        testTypeCode: testCode,
        testTypeName: definition.testName || testCode,
        created_on: toDate(ptmTest.executionDate),
        testCondition: {
            mrid: uuid.newUuid(),
            condition,
            comment: '',
            attachment: new Attachment(),
            attachmentData: [],
        },
        testAssessment: { testStandard, assessment },
        data: {
            table: {
                table1: (ptmTest.measurements || []).map(measurement => buildRow(rowTemplate, measurement, config)),
            },
        },
    }
}

export const ptmToCircuitBreakerJobDto = (ptm, assetMrid) => {
    const dto = new CircuitBreakerJobDto()
    const skipped = []
    const motorCurrentPoints = {}
    const timingTraces = {}
    const timingAssessmentImports = []

    dto.properties.mrid = uuid.newUuid()
    dto.properties.name = ptm.job.name || 'Imported job'
    dto.properties.creation_date = toDate(ptm.job.creationDate)
    dto.properties.execution_date = toDate(ptm.job.executionDate)
    dto.properties.approval_date = toDate(ptm.job.approvalDate)
    dto.properties.tested_by = ptm.job.tester || ''
    dto.properties.approved_by = ptm.job.approvedBy || ''
    dto.properties.summary = ptm.job.comment || ''
    dto.properties.asset_id = assetMrid || ''

    ;(ptm.tests || []).forEach(ptmTest => {
        const found = findTestConfig('CircuitBreaker', ptmTest.type, ptmTest.name)
        if (!found) {
            skipped.push({
                name: ptmTest.name || ptmTest.type,
                type: ptmTest.type,
                reason: 'This test type is not supported yet',
            })
            return
        }
        if (!CircuitBreakerTestMap[found.testCode]) {
            skipped.push({
                name: ptmTest.name || ptmTest.type,
                type: ptmTest.type,
                reason: `Config maps to "${found.testCode}" but no such test definition exists`,
            })
            return
        }
        const test = buildTest(ptmTest, found.testCode, found.config, ptm.job.conditions)
        dto.testList.push(test)

        if (ptmTest.type === 'TimingTest' && ptmTest.automaticAssessment) {
            timingAssessmentImports.push({
                workTaskMrid: test.mrid,
                testCode: found.testCode,
                assessment: JSON.parse(JSON.stringify(ptmTest.automaticAssessment)),
            })
        }

        // Motor Current waveform belongs to a measurement row, not to the whole
        // work_task. Keep the row mrid as the key so multiple measurements in one
        // Motor Current test can carry independent time/current/voltage series.
        if (found.config.waveform) {
            const rows = (((test.data || {}).table || {}).table1) || []
            ;(ptmTest.measurements || []).forEach((measurement, index) => {
                const row = rows[index]
                const points = measurement[found.config.waveform.from]
                if (!row || !Array.isArray(points) || points.length === 0) return
                motorCurrentPoints[row.mrid] = points.map(point => ({
                    mrid: uuid.newUuid(),
                    time: str(point.time),
                    current: str(point.current),
                    voltage: str(point.voltage),
                }))
            })
        }

        if (found.config.timingTraces) {
            const traces = ptmTest[found.config.timingTraces.from]
            if (Array.isArray(traces) && traces.length > 0) {
                timingTraces[test.mrid] = traces.map(trace => ({
                    mrid: uuid.newUuid(),
                    measurement_index: trace.measurementIndex,
                    sequence_number: trace.sequenceNumber,
                    column_index: trace.columnIndex,
                    name: str(trace.name),
                    signal_type: str(trace.signalType),
                    phase: str(trace.phase),
                    interrupter: str(trace.interrupter),
                    source_type: str(trace.sourceType),
                    source_serial: str(trace.sourceSerial),
                    source_channel_index: str(trace.sourceChannelIndex),
                    channel_group: str(trace.channelGroup),
                    channel_group_index: str(trace.channelGroupIndex),
                    data_type: str(trace.dataType),
                    unit: str(trace.unit),
                    points: (trace.points || []).map((point, index) => ({
                        mrid: uuid.newUuid(),
                        sequence_number: index,
                        time: str(point.time),
                        value: str(point.value),
                    })),
                }))
            }
        }
    })

    ;(ptm.unsupportedTests || []).forEach(test => {
        skipped.push({
            name: test.name || test.type,
            type: test.type,
            reason: 'This test type is not supported yet',
        })
    })

    return {
        jobDto: dto,
        curvePoints: {},
        kneePoints: {},
        motorCurrentPoints,
        timingTraces,
        timingAssessmentImports,
        skipped,
    }
}

export default { ptmToCircuitBreakerJobDto }
