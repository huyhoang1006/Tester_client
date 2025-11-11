/* eslint-disable */
import CurrentTransformerJobEntity from "@/views/Entity/Job/CurrentTransformer"
import CurrentTransformerJobDto from "@/views/Dto/Job/CurrentTransformer";
import WorkTask from "@/views/Cim/WorkTask";
import TestDataSet from "@/views/Cim/TestDataSet";
import OldTransformerObservation from "@/views/Cim/OldTransformerObservation";
import Attachment from '@/views/Entity/Attachment'
import { UnitSymbol } from "@/views/Enum/UnitSymbol";
import Percent from "@/views/Cim/Percent";
import Temperature from "@/views/Cim/Temperature";
import TestingEquipment from "@/views/Entity/TestingEquipment";
import CurrentTransformerTestType from "@/views/Entity/CurrentTransformerTestType";
import StringMeaurementValue from "@/views/Cim/StringMeasurementValue";
import AnalogValue from "@/views/Cim/AnalogValue";
import DiscreteValue from "@/views/Cim/DiscreteValue";
import StringMeaurement from "@/views/Cim/StringMeasurement";
import Analog from "@/views/Cim/Analog";
import Discrete from "@/views/Cim/Discrete";
import ValueAliasSet from "@/views/Cim/ValueAliasSet";
import ValueToAlias from "@/views/Cim/ValueToAlias";

export const jobDtoToEntity = (dto) => {
    const entity = new CurrentTransformerJobEntity();

    //job properties
    entity.oldWork.mrid = dto.properties.mrid || null;
    entity.oldWork.name = dto.properties.name || null;
    entity.oldWork.type = dto.properties.work_order || null;
    entity.oldWork.created_date_time = dto.properties.creation_date || null;
    entity.oldWork.execution_date = dto.properties.execution_date || null;
    entity.oldWork.tested_by = dto.properties.tested_by || null;
    entity.oldWork.approver = dto.properties.approved_by || null;
    entity.oldWork.approval_date = dto.properties.approval_date || null;
    entity.oldWork.test_method = dto.properties.test_method || null;
    entity.oldWork.ref_standard = dto.properties.standard || null;
    entity.oldWork.description = dto.properties.summary || null;
    entity.oldWork.asset_id = dto.properties.asset_id || null;

    //attachment
    entity.attachment.id = dto.attachmentId || null;
    entity.attachment = dto.attachment || null;

    //testing equipment
    for (const equipment of dto.testingEquipmentData) {
        const data = new TestingEquipment();
        data.mrid = equipment.mrid || null;
        data.model = equipment.model || null;
        data.serial_number = equipment.serial_number || null;
        data.work_id = equipment.work_id || null;
        data.calibration_date = equipment.calibration_date || null;
        entity.testingEquipment.push(data);
    }

    //test list
    for (const item of dto.testList) {
        const testCodeKey = convertArrayToObject(item.data.row_data);
        for (const testCodeKeyItem of item.data.row_data) {
            if (testCodeKeyItem.type === 'string') {
                const stringMeasurement = new StringMeaurement();
                stringMeasurement.mrid = testCodeKeyItem.mrid || null;
                stringMeasurement.alias_name = testCodeKeyItem.code || null;
                stringMeasurement.name = testCodeKeyItem.name || null;
                entity.stringMeasurement.push(stringMeasurement);
            } else if (testCodeKeyItem.type === 'analog') {
                const analog = new Analog();
                analog.mrid = testCodeKeyItem.mrid || null;
                analog.alias_name = testCodeKeyItem.code || null;
                analog.name = testCodeKeyItem.name || null;
                const unitParts = (testCodeKeyItem.unit || '').split('|');
                analog.unit_multiplier = unitParts.length > 1 ? unitParts[0] : null;
                analog.unit_symbol = unitParts.length > 1 ? unitParts[1] : unitParts[0] || null;
                entity.analog.push(analog);
            } else if (testCodeKeyItem.type === 'discrete') {
                const discrete = new Discrete();
                discrete.mrid = testCodeKeyItem.mrid || null;
                discrete.alias_name = testCodeKeyItem.code || null;
                discrete.name = testCodeKeyItem.name || null;
                discrete.value_alias_set = testCodeKeyItem.pool.mrid || null;
                entity.discrete.push(discrete);

                const valueAliasSet = new ValueAliasSet();
                valueAliasSet.mrid = testCodeKeyItem.pool.mrid || null;
                entity.valueAliasSet.push(valueAliasSet);

                for (const valueAlias of testCodeKeyItem.pool.valueToAlias) {
                    const valueToAlias = new ValueToAlias();
                    valueToAlias.mrid = valueAlias.mrid || null;
                    valueToAlias.value = valueAlias.value || null;
                    valueToAlias.alias_name = valueAlias.alias_name || null;
                    valueToAlias.value_alias_set = testCodeKeyItem.pool.mrid || null;
                    entity.valueToAlias.push(valueToAlias);
                }
            }
        }

        //MeasurementProcedure
        for (const measurementProcedure of item.data.measurementProcedure) {
            entity.measurementProcedure.push(measurementProcedure);
        }

        const workTask = new WorkTask();
        const transformerObservation = new OldTransformerObservation();

        workTask.mrid = item.mrid || null;
        workTask.name = item.name || null;
        workTask.type = item.testTypeCode || null;
        workTask.kind = 'test';
        workTask.comment = item.testCondition.comment || null;
        workTask.work = entity.oldWork.mrid || null;
        entity.workTasks.push(workTask);

        transformerObservation.mrid = item.testCondition.mrid || null;
        //humidity_at_sampling
        transformerObservation.humidity = item.testCondition.condition.humidity.mrid || null;
        const percent = new Percent();
        percent.mrid = item.testCondition.condition.humidity.mrid || null;
        percent.value = item.testCondition.condition.humidity.value || null;
        let unitPartsPercent = (item.testCondition.condition.humidity.unit || '').split('|');
        percent.multiplier = unitPartsPercent.length > 1 ? unitPartsPercent[0] : null;
        percent.unit = unitPartsPercent.length > 1 ? unitPartsPercent[1] : unitPartsPercent[0] || null;
        entity.percent.push(percent);

        //ambient_temperature_at_sampling
        transformerObservation.ambient_temperature = item.testCondition.condition.ambient_temperature.mrid || null;
        const ambientTemp = new Temperature();
        ambientTemp.mrid = item.testCondition.condition.ambient_temperature.mrid || null;
        ambientTemp.value = item.testCondition.condition.ambient_temperature.value || null;
        let unitPartsAmbientTemp = (item.testCondition.condition.ambient_temperature.unit || '').split('|');
        ambientTemp.multiplier = unitPartsAmbientTemp.length > 1 ? unitPartsAmbientTemp[0] : null;
        ambientTemp.unit = unitPartsAmbientTemp.length > 1 ? unitPartsAmbientTemp[1] : unitPartsAmbientTemp[0] || null;
        entity.temperature.push(ambientTemp);

        //weather_kind
        transformerObservation.weather = item.testCondition.condition.weather || null;

        //reference_temperature
        transformerObservation.reference_temp = item.testCondition.condition.reference_temperature.mrid || null;
        const referenceTemp = new Temperature();
        referenceTemp.mrid = item.testCondition.condition.reference_temperature.mrid || null;
        referenceTemp.value = item.testCondition.condition.reference_temperature.value || null;
        let unitPartsReferenceTemp = (item.testCondition.condition.reference_temperature.unit || '').split('|');
        referenceTemp.multiplier = unitPartsReferenceTemp.length > 1 ? unitPartsReferenceTemp[0] : null;
        referenceTemp.unit = unitPartsReferenceTemp.length > 1 ? unitPartsReferenceTemp[1] : unitPartsReferenceTemp[0] || null;
        entity.temperature.push(referenceTemp);

        //winding_temperature
        transformerObservation.winding_temp = item.testCondition.condition.winding_temperature.mrid || null;
        const windingTemp = new Temperature();
        windingTemp.mrid = item.testCondition.condition.winding_temperature.mrid || null;
        windingTemp.value = item.testCondition.condition.winding_temperature.value || null;
        let unitPartsWindingTemp = (item.testCondition.condition.winding_temperature.unit || '').split('|');
        windingTemp.multiplier = unitPartsWindingTemp.length > 1 ? unitPartsWindingTemp[0] : null;
        windingTemp.unit = unitPartsWindingTemp.length > 1 ? unitPartsWindingTemp[1] : unitPartsWindingTemp[0] || null;
        entity.temperature.push(windingTemp);

        //top_oil_temperature
        transformerObservation.top_oil_temp = item.testCondition.condition.top_oil_temperature.mrid || null;
        const topOilTemp = new Temperature();
        topOilTemp.mrid = item.testCondition.condition.top_oil_temperature.mrid || null
        topOilTemp.value = item.testCondition.condition.top_oil_temperature.value || null;
        let unitPartsTopOilTemp = (item.testCondition.condition.top_oil_temperature.unit || '').split('|');
        topOilTemp.multiplier = unitPartsTopOilTemp.length > 1 ? unitPartsTopOilTemp[0] : null;
        topOilTemp.unit = unitPartsTopOilTemp.length > 1 ? unitPartsTopOilTemp[1] : unitPartsTopOilTemp[0] || null;
        entity.temperature.push(topOilTemp);

        //bottom_oil_temperature
        transformerObservation.bottom_oil_temp = item.testCondition.condition.bottom_oil_temperature.mrid || null;
        const bottomOilTemp = new Temperature();
        bottomOilTemp.mrid = item.testCondition.condition.bottom_oil_temperature.mrid || null
        bottomOilTemp.value = item.testCondition.condition.bottom_oil_temperature.value || null;
        let unitPartsBottomOilTemp = (item.testCondition.condition.bottom_oil_temperature.unit || '').split('|');
        bottomOilTemp.multiplier = unitPartsBottomOilTemp.length > 1 ? unitPartsBottomOilTemp[0] : null;
        bottomOilTemp.unit = unitPartsBottomOilTemp.length > 1 ? unitPartsBottomOilTemp[1] : unitPartsBottomOilTemp[0] || null;
        entity.temperature.push(bottomOilTemp);

        //set work_task_id
        transformerObservation.work_task_id = item.mrid || null;
        entity.transformerObservation.push(transformerObservation);

        //attachment
        entity.attachmentTest.push(item.testCondition.attachment);

        for (const data of item.data.table) {
            const testData = new TestDataSet();
            testData.mrid = data.mrid || null;
            testData.work_task = item.mrid || null;
            entity.testDataSet.push(testData);

            for (const [key, value] of Object.entries(data)) {
                if (typeof value === 'object') {
                    if (value.type === 'analog') {
                        const analogValue = new AnalogValue();
                        analogValue.mrid = value.mrid || null;
                        analogValue.alias_name = value.value || null;
                        analogValue.analog = testCodeKey[key] ? testCodeKey[key].mrid : null;
                        entity.analogValues.push(analogValue);
                    } else if (value.type === 'string') {
                        const stringValue = new StringMeaurementValue();
                        stringValue.mrid = value.mrid || null;
                        stringValue.value = value.value || null;
                        stringValue.alias_name = key || null;
                        stringValue.string_measurement = testCodeKey[key] ? testCodeKey[key].mrid : null;
                        entity.stringMeasurementValues.push(stringValue);
                    } else if (value.type === 'discrete') {
                        const discreteValue = new DiscreteValue();
                        discreteValue.mrid = value.mrid || null;
                        discreteValue.value = value.value || null;
                        discreteValue.alias_name = key || null;
                        discreteValue.discrete = testCodeKey[key] ? testCodeKey[key].mrid : null;
                        entity.discreteValues.push(discreteValue);
                    }
                }
            }
        }
    }

    //powerCableTestingEquipmentTestType
    for (const currentTransformerTestType of dto.currentTransformerTestType) {
        const data = new CurrentTransformerTestType();
        data.mrid = currentTransformerTestType.mrid || null;
        data.testing_equipment_id = currentTransformerTestType.testing_equipment_id || null;
        data.test_type_id = currentTransformerTestType.test_type_id || null;
        entity.currentTransformerTestType.push(data);
    }
    console.log('entity', entity);
    return entity;
}

export const JobEntityToDto = (entity) => {
    const dto = new CurrentTransformerJobDto();
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
    if (dto.attachment && dto.attachment.path) {
        dto.attachmentData = JSON.parse(dto.attachment.path)
    } else {
        dto.attachmentData = []
    }

    //testing equipment
    for (const testingEquipment of entity.testingEquipment) {
        const data = new TestingEquipment();
        data.mrid = testingEquipment.mrid || '';
        data.model = testingEquipment.model || '';
        data.serial_number = testingEquipment.serial_number || '';
        data.work_id = testingEquipment.work_id || '';
        data.calibration_date = testingEquipment.calibration_date || '';
        data.test_type_current_transformer_id = [];
        for (const currentTransformerTestType of entity.currentTransformerTestType) {
            if (currentTransformerTestType.testing_equipment_id === data.mrid) {
                data.test_type_power_cable_id.push(currentTransformerTestType.test_type_id);
            }
        }
        dto.testingEquipmentData.push(data);
    }
    dto.currentTransformerTestType = entity.currentTransformerTestType || [];

    //test list
    for (const item of entity.workTasks) {
        let testTemplate = {
            mrid: item.mrid || '',
            name: item.name || '',
            testTypeCode: item.type || '',
            testTypeName: '',
            testTypeId: '',
            testCondition: {
                mrid: '',
                condition: {
                    top_oil_temperature: {
                        mrid: '',
                        value: "",
                        unit: UnitSymbol.degC
                    },
                    bottom_oil_temperature: {
                        mrid: '',
                        value: "",
                        unit: UnitSymbol.degC
                    },
                    winding_temperature: {
                        mrid: '',
                        value: "",
                        unit: UnitSymbol.degC
                    },
                    reference_temperature: {
                        mrid: '',
                        value: "",
                        unit: UnitSymbol.degC
                    },
                    ambient_temperature: {
                        mrid: '',
                        value: "",
                        unit: UnitSymbol.degC
                    },
                    humidity: {
                        mrid: '',
                        value: "",
                        unit: UnitSymbol.percent
                    },
                    weather: ''
                },
                comment: '',
                attachment: new Attachment(),
                attachmentData: [],
            },
            data: {
                row_data: [],
                table: [],
                measurementProcedure: []
            }
        }
        testTemplate.testCondition.comment = item.comment || '';

        for (const observation of entity.transformerObservation) {
            if (observation.work_task_id === item.mrid) {
                testTemplate.testCondition.observationId = observation.mrid || '';
                testTemplate.testCondition.condition.top_oil_temperature.mrid = observation.top_oil_temp || '';
                testTemplate.testCondition.condition.bottom_oil_temperature.mrid = observation.bottom_oil_temp || '';
                testTemplate.testCondition.condition.winding_temperature.mrid = observation.winding_temp || '';
                testTemplate.testCondition.condition.reference_temperature.mrid = observation.reference_temp || '';
                testTemplate.testCondition.condition.ambient_temperature.mrid = observation.ambient_temperature || '';
                testTemplate.testCondition.condition.weather = observation.weather || '';
                testTemplate.testCondition.condition.humidity.mrid = observation.humidity || '';
            }
        }

        for (const percent of entity.percent) {
            if (percent.mrid === testTemplate.testCondition.condition.humidity.mrid) {
                testTemplate.testCondition.condition.humidity.mrid = percent.mrid || '';
                testTemplate.testCondition.condition.humidity.value = percent.value || '';
            }
        }

        for (const temp of entity.temperature) {
            if (temp.mrid === testTemplate.testCondition.condition.ambient_temperature.mrid) {
                testTemplate.testCondition.condition.ambient_temperature.mrid = temp.mrid || '';
                testTemplate.testCondition.condition.ambient_temperature.value = temp.value || '';
            }
            if (temp.mrid === testTemplate.testCondition.condition.reference_temperature.mrid) {
                testTemplate.testCondition.condition.reference_temperature.mrid = temp.mrid || '';
                testTemplate.testCondition.condition.reference_temperature.value = temp.value || '';
            }
            if (temp.mrid === testTemplate.testCondition.condition.winding_temperature.mrid) {
                testTemplate.testCondition.condition.winding_temperature.mrid = temp.mrid || '';
                testTemplate.testCondition.condition.winding_temperature.value = temp.value || '';
            }

            if (temp.mrid === testTemplate.testCondition.condition.top_oil_temperature.mrid) {
                testTemplate.testCondition.condition.top_oil_temperature.mrid = temp.mrid || '';
                testTemplate.testCondition.condition.top_oil_temperature.value = temp.value || '';
            }

            if (temp.mrid === testTemplate.testCondition.condition.bottom_oil_temperature.mrid) {
                testTemplate.testCondition.condition.bottom_oil_temperature.mrid = temp.mrid || '';
                testTemplate.testCondition.condition.bottom_oil_temperature.value = temp.value || '';
            }
        }

        for (const attachment of entity.attachmentTest) {
            if (attachment.id_foreign === item.mrid) {
                testTemplate.testCondition.attachment = attachment;
                if (attachment && attachment.path) {
                    testTemplate.testCondition.attachmentData = JSON.parse(attachment.path)
                } else {
                    testTemplate.testCondition.attachmentData = []
                }
                break;
            }
        }

        dto.testList.push(testTemplate);
    }
    return dto;
}

const convertArrayToObject = (arr) => {
    return arr.reduce((acc, item) => {
        if (item.code) {
            acc[item.code] = item;
        }
        return acc;
    }, {});
};