/* eslint-disable */
import CircuitBreakerJobEntity from '@/views/Flatten/Job/CircuitBreaker'
import CircuitBreakerJobDto from '@/views/Dto/Job/CircuitBreaker'
import WorkTask from '@/views/Cim/WorkTask'
import TestDataSet from '@/views/Cim/TestDataSet'
import Attachment from '@/views/Flatten/Attachment'
import TestingEquipment from '@/views/Flatten/TestingEquipment'
import CircuitBreakerTestingEquipmentTestType from '@/views/Flatten/CircuitBreakerTestingEquipmentTestType'
import StringMeaurementValue from '@/views/Cim/StringMeasurementValue'
import AnalogValue from '@/views/Cim/AnalogValue'
import DiscreteValue from '@/views/Cim/DiscreteValue'
import ProcedureAsset from '@/views/Cim/ProcedureAsset'
import ProcedureDataSetMeasurementValue from '@/views/Cim/ProcedureDataSetMeasurementValue'
import circuitBreakerConditionMap from '@/config/testing-condition/CircuitBreaker'
import circuitBreakerTestMap from '@/config/testing-condition/CircuitBreaker'
import * as commonFunc from '@/views/JobView/Common/index.js'

export const jobDtoToEntity = (dto) => {
    const entity = new CircuitBreakerJobEntity()

    //job properties
    entity.oldWork.mrid = dto.properties.mrid || null
    entity.oldWork.name = dto.properties.name || null
    entity.oldWork.type = dto.properties.type || null
    entity.oldWork.created_date_time = dto.properties.creation_date || null
    entity.oldWork.execution_date = dto.properties.execution_date || null
    entity.oldWork.tested_by = dto.properties.tested_by || null
    entity.oldWork.approver = dto.properties.approved_by || null
    entity.oldWork.approval_date = dto.properties.approval_date || null
    entity.oldWork.test_method = dto.properties.test_method || null
    entity.oldWork.ref_standard = dto.properties.ref_standard || null
    entity.oldWork.description = dto.properties.summary || null
    entity.oldWork.asset_id = dto.properties.asset_id || null

    //attachment
    entity.attachment.id = dto.attachmentId || null
    entity.attachment = dto.attachment || null

    //testing equipment
    for (const equipment of dto.testingEquipmentData) {
        const data = new TestingEquipment()
        data.mrid = equipment.mrid || null
        data.model = equipment.model || null
        data.serial_number = equipment.serial_number || null
        data.work_id = equipment.work_id || null
        data.calibration_date = equipment.calibration_date || null
        entity.testingEquipment.push(data)
    }

    //circuitBreakerTestingEquipmentTestType
    for (const circuitBreakerTestingEquipmentTestType of dto.circuitBreakerTestingEquipmentTestType) {
        const data = new CircuitBreakerTestingEquipmentTestType()
        data.mrid = circuitBreakerTestingEquipmentTestType.mrid || null
        data.testing_equipment_id = circuitBreakerTestingEquipmentTestType.testing_equipment_id || null
        data.test_type_id = circuitBreakerTestingEquipmentTestType.test_type_id || null
        entity.circuitBreakerTestingEquipmentTestType.push(data)
    }

    for (const procedureAsset of dto.procedureAsset) {
        const procedureAssetEntity = new ProcedureAsset()
        procedureAssetEntity.mrid = procedureAsset.mrid || null
        procedureAssetEntity.procedure_id = procedureAsset.procedure_id || null
        procedureAssetEntity.asset_id = procedureAsset.asset_id || null
        entity.procedureAsset.push(procedureAssetEntity)
    }

    //test list
    for (const item of dto.testList) {
        const workTask = new WorkTask()

        workTask.mrid = item.mrid || null
        workTask.name = item.name || null
        workTask.type = item.testTypeCode || null
        workTask.kind = 'test'
        workTask.comment = item.testCondition.comment || null
        workTask.work = entity.oldWork.mrid || null
        workTask.title = item.testTypeName || null
        entity.workTasks.push(workTask)

        //attachment
        entity.attachmentTest.push(item.testCondition.attachment)

        for (const key in item.data.table) {
            for (const data of item.data.table[key]) {
                const testData = new TestDataSet()
                testData.mrid = data.mrid || null
                testData.work_task = item.mrid || null
                testData.procedure = item.testTypeId || null
                testData.type = 'test'
                testData.title = key || null
                entity.testDataSet.push(testData)

                for (const [key, value] of Object.entries(data)) {
                    if (typeof value === 'object') {
                        if (value.type === 'analog') {
                            const analogValue = new AnalogValue()
                            analogValue.mrid = value.mrid || null
                            analogValue.value = value.value || null
                            analogValue.alias_name = key || null
                            analogValue.analog = value['measurement_id'] ? value['measurement_id'] : null
                            analogValue.procedure_dataset_id = data.mrid
                            entity.analogValues.push(analogValue)
                            const procedureDataSetMeasurementValue = new ProcedureDataSetMeasurementValue()
                            procedureDataSetMeasurementValue.procedure_dataset_id = data.mrid || null
                            procedureDataSetMeasurementValue.measurement_value_id = value.mrid || null
                            entity.procedureDataSetMeasurementValue.push(procedureDataSetMeasurementValue)
                        } else if (value.type === 'string') {
                            const stringValue = new StringMeaurementValue()
                            stringValue.mrid = value.mrid || null
                            stringValue.value = value.value || null
                            stringValue.alias_name = key || null
                            stringValue.procedure_dataset_id = data.mrid
                            stringValue.string_measurement = value['measurement_id'] ? value['measurement_id'] : null
                            entity.stringMeasurementValues.push(stringValue)
                            const procedureDataSetMeasurementValue = new ProcedureDataSetMeasurementValue()
                            procedureDataSetMeasurementValue.procedure_dataset_id = data.mrid || null
                            procedureDataSetMeasurementValue.measurement_value_id = value.mrid || null
                            entity.procedureDataSetMeasurementValue.push(procedureDataSetMeasurementValue)
                        } else if (value.type === 'discrete') {
                            const discreteValue = new DiscreteValue()
                            discreteValue.mrid = value.mrid || null
                            if (key == 'assessment') {
                                discreteValue.value = commonFunc.assessmentToValue(value.value) ?? null
                            } else if (key == 'condition_indicator') {
                                discreteValue.value = commonFunc.conditionIndicatorToValue(value.value) ?? null
                            } else {
                                // For other discrete values, store value as-is
                                discreteValue.value = value.value || null
                            }
                            discreteValue.vta_alias_name = value.value || ''
                            discreteValue.alias_name = key || null
                            discreteValue.procedure_dataset_id = data.mrid
                            discreteValue.discrete = value['measurement_id'] ? value['measurement_id'] : null
                            entity.discreteValues.push(discreteValue)
                            const procedureDataSetMeasurementValue = new ProcedureDataSetMeasurementValue()
                            procedureDataSetMeasurementValue.procedure_dataset_id = data.mrid || null
                            procedureDataSetMeasurementValue.measurement_value_id = value.mrid || null
                            entity.procedureDataSetMeasurementValue.push(procedureDataSetMeasurementValue)
                        }
                    }
                }
            }
        }

        const testDataCondition = new TestDataSet()
        testDataCondition.mrid = item.testCondition.mrid || null
        testDataCondition.work_task = item.mrid || null
        testDataCondition.procedure = item.testTypeId || null
        testDataCondition.type = 'condition'
        entity.testDataSet.push(testDataCondition)
        for (const [key, value] of Object.entries(item.testCondition.condition)) {
            if (typeof value === 'object') {
                if (value.type === 'analog') {
                    const analogValue = new AnalogValue()
                    analogValue.mrid = value.mrid || null
                    analogValue.value = value.value || null
                    analogValue.alias_name = key || null
                    analogValue.analog = value['measurement_id'] ? value['measurement_id'] : null
                    analogValue.procedure_dataset_id = testDataCondition.mrid
                    entity.analogValues.push(analogValue)
                    const procedureDataSetMeasurementValue = new ProcedureDataSetMeasurementValue()
                    procedureDataSetMeasurementValue.procedure_dataset_id = testDataCondition.mrid || null
                    procedureDataSetMeasurementValue.measurement_value_id = value.mrid || null
                    entity.procedureDataSetMeasurementValue.push(procedureDataSetMeasurementValue)
                } else if (value.type === 'string') {
                    const stringValue = new StringMeaurementValue()
                    stringValue.mrid = value.mrid || null
                    stringValue.value = value.value || null
                    stringValue.alias_name = key || null
                    stringValue.procedure_dataset_id = testDataCondition.mrid
                    stringValue.string_measurement = value['measurement_id'] ? value['measurement_id'] : null
                    entity.stringMeasurementValues.push(stringValue)
                    const procedureDataSetMeasurementValue = new ProcedureDataSetMeasurementValue()
                    procedureDataSetMeasurementValue.procedure_dataset_id = testDataCondition.mrid || null
                    procedureDataSetMeasurementValue.measurement_value_id = value.mrid || null
                    entity.procedureDataSetMeasurementValue.push(procedureDataSetMeasurementValue)
                } else if (value.type === 'discrete') {
                    const discreteValue = new DiscreteValue()
                    discreteValue.mrid = value.mrid || null
                    discreteValue.value = value.value || null
                    discreteValue.vta_alias_name = value.value || null
                    discreteValue.alias_name = key || null
                    discreteValue.procedure_dataset_id = testDataCondition.mrid
                    discreteValue.discrete = value['measurement_id'] ? value['measurement_id'] : null
                    entity.discreteValues.push(discreteValue)
                    const procedureDataSetMeasurementValue = new ProcedureDataSetMeasurementValue()
                    procedureDataSetMeasurementValue.procedure_dataset_id = testDataCondition.mrid || null
                    procedureDataSetMeasurementValue.measurement_value_id = value.mrid || null
                    entity.procedureDataSetMeasurementValue.push(procedureDataSetMeasurementValue)
                }
            }
        }
    }

    return entity
}

export const JobEntityToDto = (entity) => {
    const dto = new CircuitBreakerJobDto()
    //job properties
    dto.properties.mrid = entity.oldWork.mrid || ''
    dto.properties.name = entity.oldWork.name || ''
    dto.properties.type = entity.oldWork.type || ''
    dto.properties.creation_date = entity.oldWork.created_date_time || ''
    dto.properties.execution_date = entity.oldWork.execution_date || ''
    dto.properties.tested_by = entity.oldWork.tested_by || ''
    dto.properties.approved_by = entity.oldWork.approver || ''
    dto.properties.approval_date = entity.oldWork.approval_date || ''
    dto.properties.test_method = entity.oldWork.test_method || ''
    dto.properties.ref_standard = entity.oldWork.ref_standard || ''
    dto.properties.summary = entity.oldWork.description || ''
    dto.properties.asset_id = entity.oldWork.asset_id || ''

    //attachment
    dto.attachmentId = entity.attachment.id || ''
    dto.attachment = entity.attachment
    if (dto.attachment && dto.attachment.path) {
        dto.attachmentData = JSON.parse(dto.attachment.path)
    } else {
        dto.attachmentData = []
    }

    //testing equipment
    for (const testingEquipment of entity.testingEquipment) {
        const data = new TestingEquipment()
        data.mrid = testingEquipment.mrid || ''
        data.model = testingEquipment.model || ''
        data.serial_number = testingEquipment.serial_number || ''
        data.work_id = testingEquipment.work_id || ''
        data.calibration_date = testingEquipment.calibration_date || ''
        data.test_type_circuit_breaker_id = []
        for (const circuitBreakerTestingEquipmentTestType of entity.circuitBreakerTestingEquipmentTestType) {
            if (circuitBreakerTestingEquipmentTestType.testing_equipment_id === data.mrid) {
                data.test_type_circuit_breaker_id.push(circuitBreakerTestingEquipmentTestType.test_type_id)
            }
        }
        dto.testingEquipmentData.push(data)
    }
    dto.circuitBreakerTestingEquipmentTestType = entity.circuitBreakerTestingEquipmentTestType || []

    //test list
    for (const item of entity.workTasks) {
        let condition = commonFunc.buildEmptyTestCondition(circuitBreakerConditionMap[item.type]?.columns || [])
        let testTemplate = {
            mrid: item.mrid || '',
            name: item.name || '',
            testTypeCode: item.type || '',
            testTypeName: item.title || '',
            testTypeId: '',
            average_score: null,
            average_score_c: null,
            average_score_df: null,
            total_average_score: null,
            total_worst_score: null,
            weighting_factor: null,
            worst_score: null,
            worst_score_c: null,
            worst_score_df: null,
            created_on: '',
            testCondition: {
                mrid: '',
                condition: condition,
                comment: '',
                attachment: new Attachment(),
                attachmentData: []
            },
            data: {
                table: {}
            }
        }
        testTemplate.testCondition.comment = item.comment || ''
        testTemplate.testTypeId = circuitBreakerTestMap[item.type].testId || ''

        for (const attachment of entity.attachmentTest) {
            if (attachment.id_foreign === item.mrid) {
                testTemplate.testCondition.attachment = attachment
                if (attachment && attachment.path) {
                    testTemplate.testCondition.attachmentData = JSON.parse(attachment.path)
                } else {
                    testTemplate.testCondition.attachmentData = []
                }
                break
            }
        }

        const testData = entity.testDataSet.filter((x) => x.work_task === item.mrid && x.type === 'test')
        const grouped = {}
        testData.forEach((item) => {
            if (!grouped[item.title]) {
                grouped[item.title] = []
            }
            grouped[item.title].push(item)
        })
        for (const key in grouped) {
            testTemplate.data.table[key] = []
            for (const test of grouped[key]) {
                const rowData = {}
                rowData.mrid = test.mrid || ''
                const stringMeasutementValueData = entity.stringMeasurementValues.filter((x) => x.procedure_dataset_id == test.mrid)
                for (const smv of stringMeasutementValueData) {
                    const key = smv.alias_name // vd: "assessment"

                    rowData[key] = {
                        mrid: smv.mrid,
                        type: 'string',
                        unit: '',
                        value: smv.value || '',
                        measurement_id: smv.string_measurement || ''
                    }
                }

                const analogValueData = entity.analogValues.filter((x) => x.procedure_dataset_id === test.mrid)
                for (const av of analogValueData) {
                    const key = av.alias_name // vd: "assessment"

                    rowData[key] = {
                        mrid: av.mrid,
                        type: 'analog',
                        unit: '',
                        value: av.value || '',
                        measurement_id: av.analog || ''
                    }
                }

                const discreteValueData = entity.discreteValues.filter((x) => x.procedure_dataset_id === test.mrid)
                for (const dv of discreteValueData) {
                    const key = dv.alias_name // vd: "assessment", "condition_indicator"
                    
                    let displayValue = dv.vta_alias_name || ''
                    
                    // If vta_alias_name is empty, convert from numeric value
                    if (!displayValue && dv.value !== null && dv.value !== undefined) {
                        if (key == 'assessment') {
                            displayValue = dv.value == 1 ? 'Pass' : dv.value == 0 ? 'Fail' : ''
                        } else if (key == 'condition_indicator') {
                            if (dv.value == 3) displayValue = 'Good'
                            else if (dv.value == 2) displayValue = 'Fair'
                            else if (dv.value == 1) displayValue = 'Poor'
                            else if (dv.value == 0) displayValue = 'Bad'
                        }
                    }
                    
                    if (key == 'assessment' || key == 'condition_indicator') {
                        rowData[key] = {
                            mrid: dv.mrid,
                            type: 'discrete',
                            unit: '',
                            value: displayValue,
                            measurement_id: dv.discrete || ''
                        }
                    } else {
                        // For other discrete values
                        rowData[key] = {
                            mrid: dv.mrid,
                            type: 'discrete',
                            unit: '',
                            value: displayValue || dv.value || '',
                            measurement_id: dv.discrete || ''
                        }
                    }
                }

                testTemplate.data.table[key].push(rowData)
            }
        }

        // Convert object structure back to array for tests like OTiming
        // Check if all keys follow pattern "tableX" (table1, table2, table3...)
        const tableKeys = Object.keys(testTemplate.data.table)
        const isTablePattern = tableKeys.every(key => /^table\d+$/.test(key))
        if (isTablePattern && tableKeys.length > 0) {
            // Sort keys by table number
            const sortedKeys = tableKeys.sort((a, b) => {
                const numA = parseInt(a.replace('table', ''))
                const numB = parseInt(b.replace('table', ''))
                return numA - numB
            })
            // Convert to array
            const tableArray = sortedKeys.map(key => testTemplate.data.table[key])
            testTemplate.data.table = tableArray
        }

        const testDataCondition = entity.testDataSet.find((x) => x.work_task === item.mrid && x.type === 'condition')
        if (testDataCondition) {
            const rowData = {}
            const stringMeasutementValueData = entity.stringMeasurementValues.filter((x) => x.procedure_dataset_id === testDataCondition.mrid)
            testTemplate.testCondition.mrid = testDataCondition.mrid || ''
            for (const smv of stringMeasutementValueData) {
                const key = smv.alias_name // vd: "assessment"

                rowData[key] = {
                    mrid: smv.mrid,
                    type: 'string',
                    unit: '',
                    value: smv.value || '',
                    measurement_id: smv.string_measurement || ''
                }
            }

            const analogValueData = entity.analogValues.filter((x) => x.procedure_dataset_id === testDataCondition.mrid)
            for (const av of analogValueData) {
                const key = av.alias_name // vd: "assessment"

                rowData[key] = {
                    mrid: av.mrid,
                    type: 'analog',
                    unit: '',
                    value: av.value || '',
                    measurement_id: av.analog || ''
                }
            }

            const discreteValueData = entity.discreteValues.filter((x) => x.procedure_dataset_id === testDataCondition.mrid)
            for (const dv of discreteValueData) {
                const key = dv.alias_name // vd: "assessment"

                rowData[key] = {
                    mrid: dv.mrid,
                    type: 'discrete',
                    unit: '',
                    value: dv.value || '',
                    measurement_id: dv.discrete || ''
                }
            }
            testTemplate.testCondition.condition = rowData
        }

        dto.testList.push(testTemplate)
    }
    return dto
}
