/* eslint-disable */
import SurgeArresterJobEntity from "@/views/Flatten/Job/SurgeArrester"
import SurgeArresterJobDto from "@/views/Dto/Job/SurgeArrester";
import WorkTask from "@/views/Cim/WorkTask";
import TestDataSet from "@/views/Cim/TestDataSet";
import Attachment from '@/views/Flatten/Attachment'
import TestingEquipment from "@/views/Flatten/TestingEquipment";
import SurgeArresterTestingEquipmentTestType from "@/views/Flatten/SurgeArresterTestingEquipmentTestType";
import StringMeaurementValue from "@/views/Cim/StringMeasurementValue";
import AnalogValue from "@/views/Cim/AnalogValue";
import DiscreteValue from "@/views/Cim/DiscreteValue";
import ProcedureAsset from "@/views/Cim/ProcedureAsset";
import ProcedureDataSetMeasurementValue from "@/views/Cim/ProcedureDataSetMeasurementValue";
import surgeArresterConditionMap from '@/config/testing-condition/SurgeArrester'
import * as commonFunc from '@/views/JobView/Common/index.js'

export const jobDtoToEntity = (dto) => {
    const entity = new SurgeArresterJobEntity();

    //job properties
    entity.oldWork.mrid = dto.properties.mrid || null;
    entity.oldWork.name = dto.properties.name || null;
    entity.oldWork.type = dto.properties.type || null;
    entity.oldWork.created_date_time = dto.properties.creation_date || null;
    entity.oldWork.execution_date = dto.properties.execution_date || null;
    entity.oldWork.tested_by = dto.properties.tested_by || null;
    entity.oldWork.approver = dto.properties.approved_by || null;
    entity.oldWork.approval_date = dto.properties.approval_date || null;
    entity.oldWork.test_method = dto.properties.test_method || null;
    entity.oldWork.ref_standard = dto.properties.ref_standard || null;
    entity.oldWork.description = dto.properties.summary || null;
    entity.oldWork.asset_id = dto.properties.asset_id || null;

    //attachment
    entity.attachment.id = dto.attachmentId || null;
    entity.attachment = dto.attachment || null;

    //testing equipment
    for(const equipment of dto.testingEquipmentData) {
        const data = new TestingEquipment();
        data.mrid = equipment.mrid || null;
        data.model = equipment.model || null;
        data.serial_number = equipment.serial_number || null;
        data.work_id = equipment.work_id || null;
        data.calibration_date = equipment.calibration_date || null;
        entity.testingEquipment.push(data);
    }

    //surgeArresterTestingEquipmentTestType
    for(const surgeArresterTestingEquipmentTestType of dto.surgeArresterTestingEquipmentTestType) {
        const data = new SurgeArresterTestingEquipmentTestType();
        data.mrid = surgeArresterTestingEquipmentTestType.mrid || null;
        data.testing_equipment_id = surgeArresterTestingEquipmentTestType.testing_equipment_id || null;
        data.test_type_id = surgeArresterTestingEquipmentTestType.test_type_id || null;
        entity.surgeArresterTestingEquipmentTestType.push(data);
    }

    for(const procedureAsset of dto.procedureAsset) {
        const procedureAssetEntity = new ProcedureAsset();
        procedureAssetEntity.mrid = procedureAsset.mrid || null;
        procedureAssetEntity.procedure_id = procedureAsset.procedure_id || null;
        procedureAssetEntity.asset_id = procedureAsset.asset_id || null;
        entity.procedureAsset.push(procedureAssetEntity);
    }

    //test list
    for (const item of dto.testList) {

        const workTask = new WorkTask();

        workTask.mrid = item.mrid || null;
        workTask.name = item.name || null;
        workTask.type = item.testTypeCode || null;
        workTask.kind = 'test';
        workTask.comment = item.testCondition.comment || null;
        workTask.work = entity.oldWork.mrid || null;
        workTask.title = item.testTypeName || null;
        entity.workTasks.push(workTask);

        //attachment
        entity.attachmentTest.push(item.testCondition.attachment);

        for (const data of item.data.table) {
            const testData = new TestDataSet();
            testData.mrid = data.mrid || null;
            testData.work_task = item.mrid || null;
            testData.procedure = item.testTypeId || null;
            testData.type = 'test'
            entity.testDataSet.push(testData);

            for (const [key, value] of Object.entries(data)) {
                if (typeof value === 'object') {
                    if (value.type === 'analog') {
                        const analogValue = new AnalogValue();
                        analogValue.mrid = value.mrid || null;
                        analogValue.value = value.value || null;
                        analogValue.alias_name = key || null;
                        analogValue.analog = value['measurement_id'] ? value['measurement_id'] : null;
                        analogValue.procedure_dataset_id = data.mrid
                        entity.analogValues.push(analogValue);
                        const procedureDataSetMeasurementValue = new ProcedureDataSetMeasurementValue();
                        procedureDataSetMeasurementValue.procedure_dataset_id = data.mrid || null;
                        procedureDataSetMeasurementValue.measurement_value_id = value.mrid || null;
                        entity.procedureDataSetMeasurementValue.push(procedureDataSetMeasurementValue);
                    } else if (value.type === 'string') {
                        const stringValue = new StringMeaurementValue();
                        stringValue.mrid = value.mrid || null;
                        stringValue.value = value.value || null;
                        stringValue.alias_name = key || null;
                        stringValue.procedure_dataset_id = data.mrid
                        stringValue.string_measurement = value['measurement_id'] ? value['measurement_id'] : null;
                        entity.stringMeasurementValues.push(stringValue);
                        const procedureDataSetMeasurementValue = new ProcedureDataSetMeasurementValue();
                        procedureDataSetMeasurementValue.procedure_dataset_id = data.mrid || null;
                        procedureDataSetMeasurementValue.measurement_value_id = value.mrid || null;
                        entity.procedureDataSetMeasurementValue.push(procedureDataSetMeasurementValue);
                    } else if (value.type === 'discrete') {
                        const discreteValue = new DiscreteValue();
                        discreteValue.mrid = value.mrid || null;
                        discreteValue.value = value.value || null;
                        discreteValue.alias_name = key || null;
                        discreteValue.procedure_dataset_id = data.mrid
                        discreteValue.discrete = value['measurement_id'] ? value['measurement_id'] : null;
                        entity.discreteValues.push(discreteValue);
                        const procedureDataSetMeasurementValue = new ProcedureDataSetMeasurementValue();
                        procedureDataSetMeasurementValue.procedure_dataset_id = data.mrid || null;
                        procedureDataSetMeasurementValue.measurement_value_id = value.mrid || null;
                        entity.procedureDataSetMeasurementValue.push(procedureDataSetMeasurementValue);
                    }
                }
            }
        }

        const testDataCondition = new TestDataSet();
        testDataCondition.mrid = item.testCondition.mrid || null;
        testDataCondition.work_task = item.mrid || null;
        testDataCondition.procedure = item.testTypeId || null;
        testDataCondition.type = 'condition'
        entity.testDataSet.push(testDataCondition);
        for (const [key, value] of Object.entries(item.testCondition.condition)) {
            if (typeof value === 'object') {
                if (value.type === 'analog') {
                    const analogValue = new AnalogValue();
                    analogValue.mrid = value.mrid || null;
                    analogValue.value = value.value || null;
                    analogValue.alias_name = key || null;
                    analogValue.analog = value['measurement_id'] ? value['measurement_id'] : null;
                    analogValue.procedure_dataset_id = testDataCondition.mrid
                    entity.analogValues.push(analogValue);
                    const procedureDataSetMeasurementValue = new ProcedureDataSetMeasurementValue();
                    procedureDataSetMeasurementValue.procedure_dataset_id = testDataCondition.mrid || null;
                    procedureDataSetMeasurementValue.measurement_value_id = value.mrid || null;
                    entity.procedureDataSetMeasurementValue.push(procedureDataSetMeasurementValue);
                } else if (value.type === 'string') {
                    const stringValue = new StringMeaurementValue();
                    stringValue.mrid = value.mrid || null;
                    stringValue.value = value.value || null;
                    stringValue.alias_name = key || null;
                    stringValue.procedure_dataset_id = testDataCondition.mrid
                    stringValue.string_measurement = value['measurement_id'] ? value['measurement_id'] : null;
                    entity.stringMeasurementValues.push(stringValue);
                    const procedureDataSetMeasurementValue = new ProcedureDataSetMeasurementValue();
                    procedureDataSetMeasurementValue.procedure_dataset_id = testDataCondition.mrid || null;
                    procedureDataSetMeasurementValue.measurement_value_id = value.mrid || null;
                    entity.procedureDataSetMeasurementValue.push(procedureDataSetMeasurementValue);
                } else if (value.type === 'discrete') {
                    const discreteValue = new DiscreteValue();
                    discreteValue.mrid = value.mrid || null;
                    discreteValue.value = value.value || null;
                    discreteValue.alias_name = key || null;
                    discreteValue.procedure_dataset_id = testDataCondition.mrid
                    discreteValue.discrete = value['measurement_id'] ? value['measurement_id'] : null;
                    entity.discreteValues.push(discreteValue);
                    const procedureDataSetMeasurementValue = new ProcedureDataSetMeasurementValue();
                    procedureDataSetMeasurementValue.procedure_dataset_id = testDataCondition.mrid || null;
                    procedureDataSetMeasurementValue.measurement_value_id = value.mrid || null;
                    entity.procedureDataSetMeasurementValue.push(procedureDataSetMeasurementValue);
                }
            }
        }
    }

    return entity;
}

export const JobEntityToDto = (entity) => {
    const dto = new SurgeArresterJobDto();
    //job properties
    dto.properties.mrid = entity.oldWork.mrid || '';
    dto.properties.name = entity.oldWork.name || '';
    dto.properties.type = entity.oldWork.type || '';
    dto.properties.creation_date = entity.oldWork.created_date_time || '';
    dto.properties.execution_date = entity.oldWork.execution_date || '';
    dto.properties.tested_by = entity.oldWork.tested_by || '';
    dto.properties.approved_by = entity.oldWork.approver || '';
    dto.properties.approval_date = entity.oldWork.approval_date || '';
    dto.properties.test_method = entity.oldWork.test_method || '';
    dto.properties.ref_standard = entity.oldWork.ref_standard || '';
    dto.properties.summary = entity.oldWork.description || '';
    dto.properties.asset_id = entity.oldWork.asset_id || '';

    //attachment
    dto.attachmentId = entity.attachment.id || '';
    dto.attachment = entity.attachment;
    if(dto.attachment && dto.attachment.path) {
        dto.attachmentData = JSON.parse(dto.attachment.path)
    } else {
        dto.attachmentData = []
    }

    //testing equipment
    for(const testingEquipment of entity.testingEquipment) {
        const data = new TestingEquipment();
        data.mrid = testingEquipment.mrid || '';
        data.model = testingEquipment.model || '';
        data.serial_number = testingEquipment.serial_number || '';
        data.work_id = testingEquipment.work_id || '';
        data.calibration_date = testingEquipment.calibration_date || '';
        data.test_type_surge_arrester_id = [];
        for(const surgeArresterTestingEquipmentTestType of entity.surgeArresterTestingEquipmentTestType) {
            if(surgeArresterTestingEquipmentTestType.testing_equipment_id === data.mrid) {
                data.test_type_surge_arrester_id.push(surgeArresterTestingEquipmentTestType.test_type_id);
            }
        }
        dto.testingEquipmentData.push(data);
    }
    dto.surgeArresterTestingEquipmentTestType = entity.surgeArresterTestingEquipmentTestType || [];

    //test list
    for (const item of entity.workTasks) {
        let condition = commonFunc.buildEmptyTestCondition(surgeArresterConditionMap[item.type]?.columns || []);
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
                attachment : new Attachment(),
                attachmentData : [],
            },
            data : {
                table : [],
            }
        }
        testTemplate.testCondition.comment = item.comment || '';
        testTemplate.testTypeId = item.procedureIds

        for(const attachment of entity.attachmentTest) {
            if(attachment.id_foreign === item.mrid) {
                testTemplate.testCondition.attachment = attachment;
                if(attachment && attachment.path) {
                    testTemplate.testCondition.attachmentData = JSON.parse(attachment.path)
                } else {
                    testTemplate.testCondition.attachmentData = []
                }
                break;
            }
        }

        const testData = entity.testDataSet.filter(x => x.work_task === item.mrid && x.type === 'test');
        for(const test of testData) {
            const rowData = {};
            rowData.mrid = test.mrid || '';
            const stringMeasutementValueData = entity.stringMeasurementValues.filter(x => x.procedure_dataset_id == test.mrid);
            for (const smv of stringMeasutementValueData) {
                const key = smv.alias_name; // vd: "assessment"

                rowData[key] = {
                    mrid: smv.mrid,
                    type: "string",
                    unit: "",
                    value: smv.value || "",
                    measurement_id: smv.string_measurement || ''
                };
            }

            const analogValueData = entity.analogValues.filter(x => x.procedure_dataset_id === test.mrid);
            for (const av of analogValueData) {
                const key = av.alias_name; // vd: "assessment"

                rowData[key] = {
                    mrid: av.mrid,
                    type: "analog",
                    unit: "",
                    value: av.value || "",
                    measurement_id: av.analog || ''
                };
            }

            const discreteValueData = entity.discreteValues.filter(x => x.procedure_dataset_id === test.mrid);
            for (const dv of discreteValueData) {
                const key = dv.alias_name; // vd: "assessment"

                rowData[key] = {
                    mrid: dv.mrid,
                    type: "discrete",
                    unit: "",
                    value: dv.value || "",
                    measurement_id: dv.discrete || ''
                };
            }

            testTemplate.data.table.push(rowData);
        }
        const testDataCondition = entity.testDataSet.find(x => x.work_task === item.mrid && x.type === 'condition');
        if (testDataCondition) {
            const rowData = {};
            const stringMeasutementValueData = entity.stringMeasurementValues.filter(x => x.procedure_dataset_id === testDataCondition.mrid);
            testTemplate.testCondition.mrid = testDataCondition.mrid || '';
            for (const smv of stringMeasutementValueData) {
                const key = smv.alias_name; // vd: "assessment"

                rowData[key] = {
                    mrid: smv.mrid,
                    type: "string",
                    unit: "",
                    value: smv.value || "",
                    measurement_id: smv.string_measurement || ''
                };
            }

            const analogValueData = entity.analogValues.filter(x => x.procedure_dataset_id === testDataCondition.mrid);
            for (const av of analogValueData) {
                const key = av.alias_name; // vd: "assessment"

                rowData[key] = {
                    mrid: av.mrid,
                    type: "analog",
                    unit: "",
                    value: av.value || "",
                    measurement_id: av.analog || ''
                };
            }

            const discreteValueData = entity.discreteValues.filter(x => x.procedure_dataset_id === testDataCondition.mrid);
            for (const dv of discreteValueData) {
                const key = dv.alias_name; // vd: "assessment"

                rowData[key] = {
                    mrid: dv.mrid,
                    type: "discrete",
                    unit: "",
                    value: dv.value || "",
                    measurement_id: dv.discrete || ''
                };
            }
            testTemplate.testCondition.condition = rowData;
        }

        dto.testList.push(testTemplate);
    }
    return dto;
}