/* eslint-disable */
import SurgeArresterJobEntity from "@/views/Entity/Job/SurgeArrester"
import SurgeArresterJobDto from "@/views/Dto/Job/SurgeArrester";
import WorkTask from "@/views/Cim/WorkTask";
import TestDataSet from "@/views/Cim/TestDataSet";
import OldSpecimen from "@/views/Cim/OldSpecimen";
import OldTransformerObservation from "@/views/Cim/OldTransformerObservation";
import Attachment from '@/views/Entity/Attachment'
import { UnitSymbol } from "@/views/Enum/UnitSymbol";
import Percent from "@/views/Cim/Percent";
import Temperature from "@/views/Cim/Temperature";

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
    entity.testingEquipment = dto.testingEquipmentData || [];

    //test list
    for (const item of dto.testList) {
        const workTask = new WorkTask();
        const specimen = new OldSpecimen();
        const transformerObservation = new OldTransformerObservation();

        workTask.mrid = item.mrid || null;
        workTask.name = item.name || null;
        workTask.type = item.testTypeCode || null;
        workTask.kind = 'test';
        workTask.comment = item.testCondition.comment || null;
        workTask.work = entity.oldWork.mrid || null;
        entity.workTasks.push(workTask);

        specimen.mrid = item.testCondition.mrid || null;
        //humidity_at_sampling
        specimen.humidity_at_sampling = item.testCondition.condition.humidity.mrid || null;
        const percent = new Percent();
        percent.mrid = item.testCondition.condition.humidity.mrid || null;
        percent.value = item.testCondition.condition.humidity.value || null;
        let unitPartsPercent = (item.testCondition.condition.humidity.unit || '').split('|');
        percent.multiplier = unitPartsPercent.length > 1 ? unitPartsPercent[0] : null;
        percent.unit = unitPartsPercent.length > 1 ? unitPartsPercent[1] : unitPartsPercent[0] || null;
        entity.percent.push(percent);

        //ambient_temperature_at_sampling
        specimen.ambient_temperature_at_sampling = item.testCondition.condition.ambient_temperature.mrid || null;
        const ambientTemp = new Temperature();
        ambientTemp.mrid = item.testCondition.condition.ambient_temperature.mrid || null;
        ambientTemp.value = item.testCondition.condition.ambient_temperature.value || null;
        let unitPartsAmbientTemp = (item.testCondition.condition.ambient_temperature.unit || '').split('|');
        ambientTemp.multiplier = unitPartsAmbientTemp.length > 1 ? unitPartsAmbientTemp[0] : null;
        ambientTemp.unit = unitPartsAmbientTemp.length > 1 ? unitPartsAmbientTemp[1] : unitPartsAmbientTemp[0] || null;
        entity.temperature.push(ambientTemp);

        //weather_kind
        specimen.weather_kind = item.testCondition.condition.weather || null;

        //reference_temperature
        specimen.reference_temp = item.testCondition.condition.reference_temperature.mrid || null;
        const referenceTemp = new Temperature();
        referenceTemp.mrid = item.testCondition.condition.reference_temperature.mrid || null;
        referenceTemp.value = item.testCondition.condition.reference_temperature.value || null;
        let unitPartsReferenceTemp = (item.testCondition.condition.reference_temperature.unit || '').split('|');
        referenceTemp.multiplier = unitPartsReferenceTemp.length > 1 ? unitPartsReferenceTemp[0] : null;
        referenceTemp.unit = unitPartsReferenceTemp.length > 1 ? unitPartsReferenceTemp[1] : unitPartsReferenceTemp[0] || null;
        entity.temperature.push(referenceTemp);

        //winding_temperature
        specimen.winding_temp = item.testCondition.condition.winding_temperature.mrid || null;
        const windingTemp = new Temperature();
        windingTemp.mrid = item.testCondition.condition.winding_temperature.mrid || null;
        windingTemp.value = item.testCondition.condition.winding_temperature.value || null;
        let unitPartsWindingTemp = (item.testCondition.condition.winding_temperature.unit || '').split('|');
        windingTemp.multiplier = unitPartsWindingTemp.length > 1 ? unitPartsWindingTemp[0] : null;
        windingTemp.unit = unitPartsWindingTemp.length > 1 ? unitPartsWindingTemp[1] : unitPartsWindingTemp[0] || null;
        entity.temperature.push(windingTemp);

        //set work_task_id
        specimen.work_task_id = item.mrid || null;
        entity.specimen.push(specimen);

        //transformer observation
        //top_oil_temperature
        transformerObservation.top_oil_temp = item.testCondition.condition.top_oil_temperature.mrid || null;
        const topOilTemp = new Temperature();
        topOilTemp.mrid = item.testCondition.condition.top_oil_temperature.mrid || null
        topOilTemp.value = item.testCondition.condition.top_oil_temperature.value || null;
        let unitPartsTopOilTemp = (item.testCondition.condition.top_oil_temperature.unit || '').split('|');
        topOilTemp.multiplier = unitPartsTopOilTemp.length > 1 ? unitPartsTopOilTemp[0] : null;
        topOilTemp.unit = unitPartsTopOilTemp.length > 1 ? unitPartsTopOilTemp[1] : unitPartsTopOilTemp[0] || null;
        entity.temperature.push(topOilTemp);

        //observation_id
        transformerObservation.mrid = item.testCondition.observationId || null;

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

        for(const data of item.data.table) {
            const testData = new TestDataSet();
            testData.mrid = data.mrid || null;
            testData.work_task = item.mrid || null;
            testData.specimen_id = specimen.mrid || null;            
        }
    }

    return entity;
}

export const JobEntityToDto = (entity) => {
    console.log("Mapping Entity to DTO:", entity);
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
    dto.testingEquipmentData = entity.testingEquipment || [];

    //test list
    for (const item of entity.workTasks) {
        let testTemplate = {
            mrid: item.mrid || '',
            name: item.name || '',
            testTypeCode: item.type || '',
            testTypeName: '',
            testTypeId: '',
            testCondition: {
                observationId: '',
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
                attachment : new Attachment(),
                attachmentData : [],
            },
            data : {
                table : []
            }
        }
        testTemplate.testCondition.comment = item.comment || '';
        for(const specimen of entity.specimen) {
            if(specimen.work_task_id === item.mrid) {
                testTemplate.testCondition.mrid = specimen.mrid || '';
                testTemplate.testCondition.condition.humidity.mrid = specimen.humidity_at_sampling || '';
                testTemplate.testCondition.condition.ambient_temperature.mrid = specimen.ambient_temperature_at_sampling || '';
                testTemplate.testCondition.condition.weather = specimen.weather_kind || '';
                testTemplate.testCondition.condition.reference_temperature.mrid = specimen.reference_temp || '';
                testTemplate.testCondition.condition.winding_temperature.mrid = specimen.winding_temp || '';
            }
        }

        for(const observation of entity.transformerObservation) {
            if(observation.work_task_id === item.mrid) {
                testTemplate.testCondition.observationId = observation.mrid || '';
                testTemplate.testCondition.condition.top_oil_temperature.mrid = observation.top_oil_temp || '';
                testTemplate.testCondition.condition.bottom_oil_temperature.mrid = observation.bottom_oil_temp || '';
            }
        }

        for(const percent of entity.percent) {
            if(percent.mrid === testTemplate.testCondition.condition.humidity.mrid) {
                testTemplate.testCondition.condition.humidity.mrid = percent.mrid || '';
                testTemplate.testCondition.condition.humidity.value = percent.value || '';
            }
        }

        for(const temp of entity.temperature) {
            if(temp.mrid === testTemplate.testCondition.condition.ambient_temperature.mrid) {
                testTemplate.testCondition.condition.ambient_temperature.mrid = temp.mrid || '';
                testTemplate.testCondition.condition.ambient_temperature.value = temp.value || '';
            }
            if(temp.mrid === testTemplate.testCondition.condition.reference_temperature.mrid) {
                testTemplate.testCondition.condition.reference_temperature.mrid = temp.mrid || '';
                testTemplate.testCondition.condition.reference_temperature.value = temp.value || '';
            }
            if(temp.mrid === testTemplate.testCondition.condition.winding_temperature.mrid) {
                testTemplate.testCondition.condition.winding_temperature.mrid = temp.mrid || '';
                testTemplate.testCondition.condition.winding_temperature.value = temp.value || '';
            }

            if(temp.mrid === testTemplate.testCondition.condition.top_oil_temperature.mrid) {
                testTemplate.testCondition.condition.top_oil_temperature.mrid = temp.mrid || '';
                testTemplate.testCondition.condition.top_oil_temperature.value = temp.value || '';
            }

            if(temp.mrid === testTemplate.testCondition.condition.bottom_oil_temperature.mrid) {
                testTemplate.testCondition.condition.bottom_oil_temperature.mrid = temp.mrid || '';
                testTemplate.testCondition.condition.bottom_oil_temperature.value = temp.value || '';
            }
        }

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

        dto.testList.push(testTemplate);
    }
    return dto;
}