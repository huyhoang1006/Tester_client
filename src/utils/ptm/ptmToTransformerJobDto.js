/* eslint-disable */
import uuid from '@/utils/uuid'
import Attachment from '@/views/Flatten/Attachment'
import TestStandard from '@/views/Cim/TestStandard'
import TransformerJobDto from '@/views/Dto/Job/Transformer'
import TransformerTestMap from '@/config/test-definitions/Transformer'
import TransformerConditionMap from '@/config/testing-condition/Transformer'
import TransformerAssessmentMap from '@/config/testing-assessment/Transformer'
import * as common from '@/views/JobView/Common/index'
import { findTestConfig } from '@/config/ptm-import'

const str = value => value === null || value === undefined ? '' : String(value)

const DF_CAP_SWEEP_TEST_CODES = new Set([
    'WindingDfCap',
    'BushingPrimC1', 'BushingPrimC2',
    'BushingSecC1', 'BushingSecC2',
    'BushingTertC1', 'BushingTertC2',
])

const PTM_TAN_DELTA_MODE_MAP = {
    gst: 'GST',
    gstga: 'GSTg-A',
    gstgb: 'GSTg-B',
    gstgab: 'GSTg-A+B',
    gstgagb: 'GSTg-A+B',
    usta: 'UST-A',
    ustb: 'UST-B',
    ustab: 'UST-A+B',
    undefined: '',
    none: '',
}

const normalizeTanDeltaTestMode = value => {
    const raw = str(value).trim()
    const key = raw.toLowerCase().replace(/[^a-z]/g, '')
    return Object.prototype.hasOwnProperty.call(PTM_TAN_DELTA_MODE_MAP, key)
        ? PTM_TAN_DELTA_MODE_MAP[key]
        : raw
}

const toDate = value => {
    const match = str(value).trim().match(/^(\d{4}-\d{2}-\d{2})/)
    return match ? match[1] : ''
}

const scaled = (measurement, factor) => {
    const raw = measurement && typeof measurement === 'object' && 'value' in measurement
        ? measurement.value
        : measurement
    if (raw === '' || raw === null || raw === undefined) return ''
    const number = Number(raw)
    if (!Number.isFinite(number)) return ''
    const multiplier = factor === undefined || factor === null ? 1 : Number(factor)
    return multiplier === 1 ? str(raw) : str(number * multiplier)
}

const ensureCellMrids = holder => {
    if (!holder || typeof holder !== 'object') return
    Object.keys(holder).forEach(key => {
        const cell = holder[key]
        if (!cell || typeof cell !== 'object' || !('value' in cell) || !cell.type) return
        if (!cell.mrid) cell.mrid = uuid.newUuid()
    })
}

const buildRow = (emptyRow, measurement, config) => {
    const row = JSON.parse(JSON.stringify(emptyRow))
    row.mrid = uuid.newUuid()

    if (row.name && config.rowName) {
        row.name.value = (config.rowName.from || [])
            .map(key => str(measurement[key]).trim())
            .filter(Boolean)
            .join(config.rowName.join || ' ')
    }

    Object.keys(config.columns || {}).forEach(code => {
        if (!row[code]) return
        const spec = config.columns[code]
        row[code].value = scaled(measurement[spec.from], spec.factor)
    })
    Object.keys(config.plainColumns || {}).forEach(code => {
        if (!row[code]) return
        const spec = config.plainColumns[code]
        row[code].value = spec.serialize === 'json'
            ? JSON.stringify(measurement[spec.from] || [])
            : code === 'test_mode'
            ? normalizeTanDeltaTestMode(measurement[spec.from])
            : str(measurement[spec.from])
    })

    if (config.assessment && row[config.assessment.to || 'assessment']) {
        const cell = row[config.assessment.to || 'assessment']
        const raw = str(measurement[config.assessment.from])
        const mapped = config.assessment.map || {}
        cell.value = Object.prototype.hasOwnProperty.call(mapped, raw) ? mapped[raw] : ''
    }

    ensureCellMrids(row)
    return row
}

const fillCondition = (condition, code, source) => {
    if (!condition[code]) return
    const value = source && typeof source === 'object' && 'value' in source ? source.value : source
    if (value === '' || value === null || value === undefined) return
    condition[code].value = str(value)
}

const applyConditions = (condition, ptmTest, jobConditions) => {
    const testConditions = ptmTest.conditions || {}
    const fromTestOrJob = (key) => {
        const testValue = testConditions[key]
        const raw = testValue && typeof testValue === 'object' && 'value' in testValue
            ? testValue.value
            : testValue
        return raw === '' || raw === null || raw === undefined
            ? jobConditions && jobConditions[key]
            : testValue
    }
    fillCondition(condition, 'winding_temp', testConditions.windingTemperature)
    fillCondition(condition, 'reference_temp', testConditions.referenceTemperature)
    fillCondition(condition, 'top_oil_temp', fromTestOrJob('topOilTemperature'))
    fillCondition(condition, 'bottom_oil_temp', fromTestOrJob('bottomOilTemperature'))
    fillCondition(condition, 'ambient_temp', fromTestOrJob('ambientTemperature'))
    fillCondition(condition, 'humidity', fromTestOrJob('humidity'))
    const weather = fromTestOrJob('weather')
    if (str(weather).trim().toLowerCase() !== 'empty') fillCondition(condition, 'weather', weather)
}

const calculateWindingDeviation = rows => {
    const byTap = {}
    rows.forEach(row => {
        const tap = str(row.tap && row.tap.value)
        if (!byTap[tap]) byTap[tap] = []
        byTap[tap].push(row)
    })

    Object.keys(byTap).forEach(tap => {
        const group = byTap[tap]
        const values = group
            .map(row => Number(row.r_meas && row.r_meas.value))
            .filter(Number.isFinite)
        const min = values.length ? Math.min(...values) : NaN
        const max = values.length ? Math.max(...values) : NaN
        const deviation = Number.isFinite(min) && min !== 0
            ? Math.abs((max - min) / min) * 100
            : NaN
        group.forEach(row => {
            if (row.dev_phase) row.dev_phase.value = Number.isFinite(deviation) ? str(deviation) : ''
        })
    })
}

const buildTest = (ptmTest, testCode, config, jobConditions) => {
    const definition = TransformerTestMap[testCode]
    const emptyRow = common.buildEmptyTestRow(definition.columns)
    const conditionDefinition = TransformerConditionMap[testCode]
    const condition = conditionDefinition
        ? common.buildEmptyTestCondition(conditionDefinition.columns)
        : {}
    const assessmentDefinition = TransformerAssessmentMap[testCode]
    const assessment = assessmentDefinition
        ? common.buildEmptyTestAssessment(assessmentDefinition.testStandard)
        : []
    const tables = {}
    const rows = (ptmTest.measurements || []).map(measurement => {
        const row = buildRow(emptyRow, measurement, config)
        const windingDfCapTable = measurement.sweepType === 'frequency'
            ? 'table2'
            : measurement.sweepType === 'voltage' ? 'table3' : 'table1'
        const tableKey = DF_CAP_SWEEP_TEST_CODES.has(testCode)
            ? windingDfCapTable
            : (measurement.tableKey || 'table1')
        if (!tables[tableKey]) tables[tableKey] = []
        tables[tableKey].push(row)
        return row
    })

    if (testCode.indexOf('DCWinding') === 0) calculateWindingDeviation(rows)
    applyConditions(condition, ptmTest, jobConditions)
    ensureCellMrids(condition)

    const testMrid = uuid.newUuid()
    const testStandard = new TestStandard()
    testStandard.mrid = uuid.newUuid()
    testStandard.work_task_id = testMrid

    return {
        mrid: testMrid,
        name: ptmTest.name || definition.testName || testCode,
        testTypeId: definition.testId,
        testTypeCode: testCode,
        testTypeName: definition.testName,
        created_on: toDate(ptmTest.executionDate),
        testCondition: {
            mrid: uuid.newUuid(),
            condition,
            comment: '',
            attachment: new Attachment(),
        },
        testAssessment: { testStandard, assessment },
        data: { table: Object.keys(tables).length > 0 ? tables : { table1: [] } },
    }
}

export const ptmToTransformerJobDto = (ptm, assetMrid) => {
    const dto = new TransformerJobDto()
    const skipped = []

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
        if (ptmTest.type === 'FRATest' && !(ptmTest.measurements || []).some(item => (item.points || []).length)) {
            skipped.push({
                name: ptmTest.name || ptmTest.type,
                type: ptmTest.type,
                reason: 'This SFRA test contains no curve data',
            })
            return
        }
        const found = findTestConfig('Transformer', ptmTest.type, ptmTest.name)
        if (!found || !TransformerTestMap[found.testCode]) {
            skipped.push({
                name: ptmTest.name || ptmTest.type,
                type: ptmTest.type,
                reason: 'This test type is not supported yet',
            })
            return
        }
        dto.testList.push(buildTest(ptmTest, found.testCode, found.config, ptm.job.conditions))
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
        skipped,
    }
}

export default { ptmToTransformerJobDto }
