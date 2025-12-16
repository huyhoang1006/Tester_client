import db from '../../../datacontext/index.js'
import * as attachmentContext from '../../../attachmentcontext/index'
import path from 'path'
import { uploadAttachmentTransaction, backupAllFilesInDir, deleteBackupFiles, restoreFiles, syncFilesWithDeletion, getAttachmentByForeignIdAndType, deleteAttachmentByIdTransaction, deleteDirectory } from '@/function/entity/attachment'
import {insertOldWorkTransaction, getOldWorkById} from "@/function/cim/oldWork/index"
import { insertTestingEquipmentTransaction, getTestingEquipmentById, getTestingEquipmentByWorkId, deleteTestingEquipmentByIdTransaction } from '../../testingEquipment/index.js'
import SurgeArresterJobEntity from '@/views/Flatten/Job/SurgeArrester/index.js'
import { insertWorkTaskTransaction, getWorkTaskByWork, deleteWorkTaskByIdTransaction } from '@/function/cim/workTask/index.js'
import { insertOldTransformerObservationTransaction, getOldTransformerObservationById, deleteOldTransformerObservationByIdTransaction, getOldTransformerObservationByWorkTaskId } from '@/function/cim/oldTransformerObservation/index.js'
import {insertPercentTransaction, deletePercentByIdTransaction, getPercentById} from '@/function/cim/percent/index.js'
import {insertTemperatureTransaction, deleteTemperatureByIdTransaction, getTemperatureById} from '@/function/cim/temperature/index.js'
import { insertSurgeArresterTestingEquipmentTestTypeTransaction, getSurgeArresterTestingEquipmentTestingEqId, deleteSurgeArresterTestingEquipmentTestTypeByIdTransaction } from '../../surgeArresterTestingEquipmentTestType/index.js'
import { insertTestDataSetTransaction, getTestDataSetByWorkTaskId, deleteTestDataSetByIdTransaction } from '@/function/cim/testDataSet'
import { insertAnalogTransaction, getAllAnalogByProcedureIds  } from '@/function/cim/analog'
import { insertStringMeasurementTransaction, getAllStringMeasurementByProcedureIds } from '@/function/cim/stringMeasurement/index.js'
import {insertDiscreteTransaction , getAllDiscreteByProcedureIds } from  '@/function/cim/discrete'
import { insertValueAliasSetTransaction, getValueAliasSetByIds} from '@/function/cim/valueAliasSet/index.js'
import { insertValueToAliasTransaction, getValueToAliasByValueAliasSetId } from '@/function/cim/valueToAlias'
import { getProcedureByAssetId, insertProcedureTransaction } from '@/function/cim/procedure'
import { insertMeasurementProcedureTransaction } from '@/function/cim/measurementProcedure/index.js'
import { insertAnalogValueTransaction, getAnalogValueByTestDataSetMrids, deleteAnalogValueByIdTransaction } from '@/function/cim/analogValue/index.js'
import { insertStringMeasurementValueTransaction, getStringMeasurementValueByTestDataSetMrids, deleteStringMeasurementValueByIdTransaction } from '@/function/cim/stringMeasurementValue/index.js'
import { insertDiscreteValueTransaction, getDiscreteValueByTestDataSetMrids, deleteDiscreteValueByIdTransaction } from '@/function/cim/discreteValue/index.js'
import { insertProcedureDataSetMeasurementValueTransaction } from '@/function/cim/procedureDataSetMeasurementValue/index.js'
import { insertProcedureAssetTransaction } from '@/function/cim/procedureAsset/index.js'

export const insertSurgeArresterJobEntity = async (old_entity,entity) => {
    try {
        if(entity.oldWork.mrid === null || entity.oldWork.mrid === '') {
            const result = {
                success: false,
                error: new Error("MRID is required for Surge Arrester Job Entity"),
                message: '',
            }
            return result;
        } else {
            backupAllFilesInDir(null, null, entity.oldWork.mrid);
            const syncResult = syncFilesWithDeletion(JSON.parse(entity.attachment.path), null, entity.oldWork.mrid);
            if (!syncResult.success) {
                restoreFiles(null, null, entity.oldWork.mrid);
                deleteBackupFiles(null, entity.oldWork.mrid);
                const result = {
                    success: false,
                    error: new Error("MRID is required for Surge Arrester Job Entity"),
                    message: '',
                }
                return result;
            }

            for(const attachment of entity.attachmentTest) {
                if(entity.attachmentTest.id && Array.isArray(JSON.parse(attachment.path))) {
                    backupAllFilesInDir(null, null, attachment.id_foreign);
                    const syncResult = syncFilesWithDeletion(JSON.parse(attachment.path), null, attachment.id_foreign);
                    if (!syncResult.success) {
                        restoreFiles(null, null, attachment.id_foreign);
                        deleteBackupFiles(null, attachment.id_foreign);
                        const result = {
                            success: false,
                            error: new Error("MRID is required for Surge Arrester Job Entity"),
                            message: '',
                        }
                        return result;
                    }
                }
            }

            await runAsync('BEGIN TRANSACTION');
            await insertOldWorkTransaction(entity.oldWork, db);
            if (entity.attachment.id && Array.isArray(JSON.parse(entity.attachment.path))) {
                const pathData = JSON.parse(entity.attachment.path);
                const newPath = []
                for(let i = 0; i < pathData.length; i++) {
                    const namefile = path.basename(pathData[i].path);
                    pathData[i].path = path.join(attachmentContext.getAttachmentDir(), namefile);
                    newPath.push(pathData[i]);
                }
                entity.attachment.path = JSON.stringify(newPath);
                await uploadAttachmentTransaction(entity.attachment, db);
            }

            //procedure
            for(const procedure of entity.procedure) {
                await insertProcedureTransaction(procedure, db);
            }

            for(const procedureAsset of entity.procedureAsset) {
                await insertProcedureAssetTransaction(procedureAsset, db);
            }

            //measurement
            //insert analog
            for(const analog of entity.analog) {
                await insertAnalogTransaction(analog, db);
            }

            //insert string measurement
            for(const stringMeasurement of entity.stringMeasurement) {
                await insertStringMeasurementTransaction(stringMeasurement, db);
            }

            //insert valueAliasSet
            for(const valueAliasSet of entity.valueAliasSet) {
                await insertValueAliasSetTransaction(valueAliasSet, db);
            }

            //insert valueToAlias
            for(const valueToAlias of entity.valueToAlias) {
                await insertValueToAliasTransaction(valueToAlias, db);
            }

            //insert discrete
            for(const discrete of entity.discrete) {
                await insertDiscreteTransaction(discrete, db);
            }

            //insert measurement procedure
            for(const measurementProcedure of entity.measurementProcedure) {
                await insertMeasurementProcedureTransaction(measurementProcedure, db);
            }

            //testing equipment
            const newIds = entity.testingEquipment.map(v => v.mrid).filter(id => id); // bỏ null/empty
            const oldIds = old_entity.testingEquipment.map(v => v.mrid).filter(id => id);

            const toAdd = entity.testingEquipment.filter(v => v.mrid && !oldIds.includes(v.mrid));
            const toDelete = old_entity.testingEquipment.filter(v => v.mrid && !newIds.includes(v.mrid));
            const toUpdate = entity.testingEquipment.filter(v => v.mrid && oldIds.includes(v.mrid));
            for (const equipment of toAdd) {
                await insertTestingEquipmentTransaction(equipment, db);
            }
            for (const equipment of toUpdate) {
                await insertTestingEquipmentTransaction(equipment, db);
            }

            //surgeArresterTestingEquipmentTestType
            const newIdsSet = entity.surgeArresterTestingEquipmentTestType.map(v => v.mrid).filter(id => id); // bỏ null/empty
            const oldIdsSet = old_entity.surgeArresterTestingEquipmentTestType.map(v => v.mrid).filter(id => id);

            const toAddSet = entity.surgeArresterTestingEquipmentTestType.filter(v => v.mrid && !oldIdsSet.includes(v.mrid));
            const toDeleteSet = old_entity.surgeArresterTestingEquipmentTestType.filter(v => v.mrid && !newIdsSet.includes(v.mrid));
            const toUpdateSet = entity.surgeArresterTestingEquipmentTestType.filter(v => v.mrid && oldIdsSet.includes(v.mrid));
            
            for (const equipmentTestType of toAddSet) {
                await insertSurgeArresterTestingEquipmentTestTypeTransaction(equipmentTestType, db);
            }

            for (const equipmentTestType of toUpdateSet) {
                await insertSurgeArresterTestingEquipmentTestTypeTransaction(equipmentTestType, db);
            }

            //insert work tasks
            const newIdsWorkTask = entity.workTasks.map(v => v.mrid).filter(id => id); // bỏ null/empty
            const oldIdsWorkTask = old_entity.workTasks.map(v => v.mrid).filter(id => id);

            const toAddWorkTask = entity.workTasks.filter(v => v.mrid && !oldIdsWorkTask.includes(v.mrid));
            const toDeleteWorkTask = old_entity.workTasks.filter(v => v.mrid && !newIdsWorkTask.includes(v.mrid));
            const toUpdateWorkTask = entity.workTasks.filter(v => v.mrid && oldIdsWorkTask.includes(v.mrid));

            for (const workTask of toAddWorkTask) {
                await insertWorkTaskTransaction(workTask, db);
            }

            for (const workTask of toUpdateWorkTask) {
                await insertWorkTaskTransaction(workTask, db);
            }

            //percentage
            const newIdsPercentage = entity.percent.map(v => v.mrid).filter(id => id); // bỏ null/empty
            const oldIdsPercentage = old_entity.percent.map(v => v.mrid).filter(id => id);

            const toAddPercentage = entity.percent.filter(v => v.mrid && !oldIdsPercentage.includes(v.mrid));
            const toDeletePercentage = old_entity.percent.filter(v => v.mrid && !newIdsPercentage.includes(v.mrid));
            const toUpdatePercentage = entity.percent.filter(v => v.mrid && oldIdsPercentage.includes(v.mrid));

            for (const percentage of toAddPercentage) {
                await insertPercentTransaction(percentage, db);
            }

            for (const percentage of toUpdatePercentage) {
                await insertPercentTransaction(percentage, db);
            }

            //temperature
            const newIdsTemperature = entity.temperature.map(v => v.mrid).filter(id => id); // bỏ null/empty
            const oldIdsTemperature = old_entity.temperature.map(v => v.mrid).filter(id => id);

            const toAddTemperature = entity.temperature.filter(v => v.mrid && !oldIdsTemperature.includes(v.mrid));
            const toDeleteTemperature = old_entity.temperature.filter(v => v.mrid && !newIdsTemperature.includes(v.mrid));
            const toUpdateTemperature = entity.temperature.filter(v => v.mrid && oldIdsTemperature.includes(v.mrid));
            for (const temperature of toAddTemperature) {
                await insertTemperatureTransaction(temperature, db);
            }

            for (const temperature of toUpdateTemperature) {
                await insertTemperatureTransaction(temperature, db);
            }

            //transformer observation
            const newIdsTransformerObservation = entity.transformerObservation.map(v => v.mrid).filter(id => id); // bỏ null/empty
            const oldIdsTransformerObservation = old_entity.transformerObservation.map(v => v.mrid).filter(id => id);

            const toAddTransformerObservation = entity.transformerObservation.filter(v => v.mrid && !oldIdsTransformerObservation.includes(v.mrid));
            const toUpdateTransformerObservation = entity.transformerObservation.filter(v => v.mrid && oldIdsTransformerObservation.includes(v.mrid));
            const toDeleteTransformerObservation = old_entity.transformerObservation.filter(v => v.mrid && !newIdsTransformerObservation.includes(v.mrid));

            for (const observation of toAddTransformerObservation) {
                await insertOldTransformerObservationTransaction(observation, db);
            }

            for (const observation of toUpdateTransformerObservation) {
                await insertOldTransformerObservationTransaction(observation, db);
            }

            //attachemt
            if (entity.attachment.id && Array.isArray(JSON.parse(entity.attachment.path))) {
                const pathData = JSON.parse(entity.attachment.path);
                const newPath = []
                for(let i = 0; i < pathData.length; i++) {
                    const namefile = path.basename(pathData[i].path);
                    pathData[i].path = path.join(attachmentContext.getAttachmentDir(), entity.attachment.id_foreign, namefile);
                    newPath.push(pathData[i]);
                }
                entity.attachment.path = JSON.stringify(newPath);
                await uploadAttachmentTransaction(entity.attachment, db);
            }

            //attachment test
            for(const attachment of entity.attachmentTest) {
                if (attachment.id && Array.isArray(JSON.parse(attachment.path))) {
                    const pathData = JSON.parse(attachment.path);
                    const newPath = []
                    for(let i = 0; i < pathData.length; i++) {
                        const namefile = path.basename(pathData[i].path);
                        pathData[i].path = path.join(attachmentContext.getAttachmentDir(), attachment.id_foreign, namefile);
                        newPath.push(pathData[i]);
                    }
                    attachment.path = JSON.stringify(newPath);
                    await uploadAttachmentTransaction(attachment, db);
                }
            }

            //testdataset
            const newIdsTestDataSet = entity.testDataSet.map(v => v.mrid).filter(id => id); // bỏ null/empty
            const oldIdsTestDataSet = old_entity.testDataSet.map(v => v.mrid).filter(id => id);

            const toAddTestDataSet = entity.testDataSet.filter(v => v.mrid && !oldIdsTestDataSet.includes(v.mrid));
            const toUpdateTestDataSet = entity.testDataSet.filter(v => v.mrid && oldIdsTestDataSet.includes(v.mrid));
            const toDeleteTestDataSet = old_entity.testDataSet.filter(v => v.mrid && !newIdsTestDataSet.includes(v.mrid));

            for (const testData of toAddTestDataSet) {
                await insertTestDataSetTransaction(testData, db);
            }

            for (const testData of toUpdateTestDataSet) {
                await insertTestDataSetTransaction(testData, db);
            }

            //analog value
            const newIdsAnalogValue = entity.analogValues.map(v => v.mrid).filter(id => id); // bỏ null/empty
            const oldIdsAnalogValue = old_entity.analogValues.map(v => v.mrid).filter(id => id);

            const toAddAnalogValue = entity.analogValues.filter(v => v.mrid && !oldIdsAnalogValue.includes(v.mrid));
            const toUpdateAnalogValue = entity.analogValues.filter(v => v.mrid && oldIdsAnalogValue.includes(v.mrid));
            const toDeleteAnalogValue = old_entity.analogValues.filter(v => v.mrid && !newIdsAnalogValue.includes(v.mrid));
            for (const analogValue of toAddAnalogValue) {
                await insertAnalogValueTransaction(analogValue, db);
            }

            for (const analogValue of toUpdateAnalogValue) {
                await insertAnalogValueTransaction(analogValue, db);
            }

            //string measurement value
            const newIdsStringMeasurementValue = entity.stringMeasurementValues.map(v => v.mrid).filter(id => id); // bỏ null/empty
            const oldIdsStringMeasurementValue = old_entity.stringMeasurementValues.map(v => v.mrid).filter(id => id);

            const toAddStringMeasurementValue = entity.stringMeasurementValues.filter(v => v.mrid && !oldIdsStringMeasurementValue.includes(v.mrid));
            const toUpdateStringMeasurementValue = entity.stringMeasurementValues.filter(v => v.mrid && oldIdsStringMeasurementValue.includes(v.mrid));
            const toDeleteStringMeasurementValue = old_entity.stringMeasurementValues.filter(v => v.mrid && !newIdsStringMeasurementValue.includes(v.mrid));
            for (const stringMeasurementValue of toAddStringMeasurementValue) {
                await insertStringMeasurementValueTransaction(stringMeasurementValue, db);
            }

            for (const stringMeasurementValue of toUpdateStringMeasurementValue) {
                await insertStringMeasurementValueTransaction(stringMeasurementValue, db);
            }

            //discrete value
            const newIdsDiscreteValue = entity.discreteValues.map(v => v.mrid).filter(id => id);
            const oldIdsDiscreteValue = old_entity.discreteValues.map(v => v.mrid).filter(id => id);

            const toAddDiscreteValue = entity.discreteValues.filter(v => v.mrid && !oldIdsDiscreteValue.includes(v.mrid));
            const toUpdateDiscreteValue = entity.discreteValues.filter(v => v.mrid && oldIdsDiscreteValue.includes(v.mrid));
            const toDeleteDiscreteValue = old_entity.discreteValues.filter(v => v.mrid && !newIdsDiscreteValue.includes(v.mrid));
            for (const discreteValue of toAddDiscreteValue) {
                await insertDiscreteValueTransaction(discreteValue, db);
            }
            for (const discreteValue of toUpdateDiscreteValue) {
                await insertDiscreteValueTransaction(discreteValue, db);
            }

            //procedure dataset measurement value
            for(const procedureDataSetMeasurementValue of entity.procedureDataSetMeasurementValue) {
                await insertProcedureDataSetMeasurementValueTransaction(procedureDataSetMeasurementValue, db);
            }

            //delete section
            for(const analogValue of toDeleteAnalogValue) {
                await deleteAnalogValueByIdTransaction(analogValue.mrid, db);
            }

            for(const stringMeasurementValue of toDeleteStringMeasurementValue) {
                await deleteStringMeasurementValueByIdTransaction(stringMeasurementValue.mrid, db);
            }

            for(const discreteValue of toDeleteDiscreteValue) {
                await deleteDiscreteValueByIdTransaction(discreteValue.mrid, db);
            }

            for (const testData of toDeleteTestDataSet) {
                await deleteTestDataSetByIdTransaction(testData.mrid, db);
            }

            for(const equipmentTestType of toDeleteSet) {
                await deleteSurgeArresterTestingEquipmentTestTypeByIdTransaction(equipmentTestType.mrid, db);
            }

            for (const equipment of toDelete) {
                await deleteTestingEquipmentByIdTransaction(equipment.mrid, db);
            }

            for (const observation of toDeleteTransformerObservation) {
                await deleteOldTransformerObservationByIdTransaction(observation.mrid, db);
            }

            for (const workTask of toDeleteWorkTask) {
                await deleteWorkTaskByIdTransaction(workTask.mrid, db);
            }

            for (const percentage of toDeletePercentage) {
                await deletePercentByIdTransaction(percentage.mrid, db);
            }

            for (const temperature of toDeleteTemperature) {
                await deleteTemperatureByIdTransaction(temperature.mrid, db);
            }

            await runAsync('COMMIT');
            deleteBackupFiles(null, entity.oldWork.mrid);
            for(const attachment of entity.attachmentTest) {
                deleteBackupFiles(null, attachment.id_foreign);
            }
            return { success: true, data: entity, message: 'Surge Arrester Job entity inserted successfully' };

        }
    } catch (error) {
        console.error('Error retrieving surge arrester entity:', error);
        restoreFiles(null, null, entity.oldWork.mrid);
        deleteBackupFiles(null, entity.oldWork.mrid);
        for(const attachment of entity.attachmentTest) {
            restoreFiles(null, null, attachment.id_foreign);
            deleteBackupFiles(null, attachment.id_foreign);
        }
        await runAsync('ROLLBACK');
        return { success: false, error, message: 'Error retrieving surge arrester entity' };
    }
}

export const getSurgeArresterJobEntity = async (id, assetId) => {
    try {
        if(id == null || id === '') {
            return { success: false, error: new Error('Invalid ID') };
        } else {
            const entity = new SurgeArresterJobEntity()
            const dataOldWork = await getOldWorkById(id);
            if(dataOldWork.success) {
                entity.oldWork = dataOldWork.data;

                const dataAttachment = await getAttachmentByForeignIdAndType(entity.oldWork.mrid, 'job');
                if(dataAttachment.success) {
                    entity.attachment = dataAttachment.data;
                }

                const dataTestingEquipment = await getTestingEquipmentByWorkId(entity.oldWork.mrid);
                if(dataTestingEquipment.success) {
                    entity.testingEquipment = dataTestingEquipment.data;
                } else {
                    entity.testingEquipment = [];
                }

                for(const equipment of entity.testingEquipment) {
                    const dataEquipmentTestType = await getSurgeArresterTestingEquipmentTestingEqId(equipment.mrid);
                    if(dataEquipmentTestType.success) {
                        entity.surgeArresterTestingEquipmentTestType = entity.surgeArresterTestingEquipmentTestType.concat(dataEquipmentTestType.data);
                    }
                }

                const dataWorkTask = await getWorkTaskByWork(entity.oldWork.mrid, db);
                if(dataWorkTask.success) {
                    entity.workTasks = dataWorkTask.data;
                } else {
                    entity.workTasks = [];
                }

                for (let i = 0; i < entity.workTasks.length; i++) {
                    const workTask = entity.workTasks[i];
                    const dataTransformerObservation = await getOldTransformerObservationByWorkTaskId(workTask.mrid);
                    if(dataTransformerObservation.success) {
                        entity.transformerObservation.push(dataTransformerObservation.data);
                    }

                    const dataAttachmentTest = await getAttachmentByForeignIdAndType(workTask.mrid, 'test');
                    if(dataAttachmentTest.success) {
                        entity.attachmentTest.push(dataAttachmentTest.data);
                    }

                    const dataTestDataSet = await getTestDataSetByWorkTaskId(workTask.mrid)
                    if(dataTestDataSet.success) {
                        entity.testDataSet = entity.testDataSet.concat(dataTestDataSet.data)
                    }
                }

                for(const observation of entity.transformerObservation) {
                    if(observation.humidity) {
                        const dataPercent = await getPercentById(observation.humidity);
                        if(dataPercent.success) {
                            entity.percent.push(dataPercent.data);
                        }
                    }

                    if(observation.ambient_temp) {
                        const dataTemp = await getTemperatureById(observation.ambient_temp);
                        if(dataTemp.success) {
                            entity.temperature.push(dataTemp.data);
                        }
                    }

                    if(observation.reference_temp) {
                        const dataTemp = await getTemperatureById(observation.reference_temp);
                        if(dataTemp.success) {
                            entity.temperature.push(dataTemp.data);
                        }
                    }

                    if(observation.winding_temp) {
                        const dataTemp = await getTemperatureById(observation.winding_temp);
                        if(dataTemp.success) {
                            entity.temperature.push(dataTemp.data);
                        }
                    }

                    if(observation.top_oil_temp) {
                        const dataTemp = await getTemperatureById(observation.top_oil_temp);
                        if(dataTemp.success) {
                            entity.temperature.push(dataTemp.data);
                        }
                    }
                    if(observation.bottom_oil_temp) {
                        const dataTemp = await getTemperatureById(observation.bottom_oil_temp);
                        if(dataTemp.success) {
                            entity.temperature.push(dataTemp.data);
                        }
                    }

                }

                const mrids = entity.testDataSet.map(x => x.mrid);
                const analogValue = await getAnalogValueByTestDataSetMrids(mrids);
                if(analogValue.success) {
                    entity.analogValues = analogValue.data;
                }

                const stringMeasurementValue = await getStringMeasurementValueByTestDataSetMrids(mrids);
                if(stringMeasurementValue.success) {
                    entity.stringMeasurementValues = stringMeasurementValue.data;
                }

                const discreteValue = await getDiscreteValueByTestDataSetMrids(mrids);
                if(discreteValue.success) {
                    entity.discreteValues = discreteValue.data;
                }

                const procedure = await getProcedureByAssetId(assetId);
                if(procedure.success) {
                    entity.procedure = procedure.data;
                } else {
                    entity.procedure = [];
                }

                const procedureIds = entity.procedure.map(x => x.mrid);
                const analogSet = await getAllAnalogByProcedureIds(procedureIds);
                if(analogSet.success) {
                    entity.analog = analogSet.data;
                }

                const stringMeasurementSet = await getAllStringMeasurementByProcedureIds(procedureIds);
                if(stringMeasurementSet.success) {
                    entity.stringMeasurement = stringMeasurementSet.data;
                }

                const discreteSet = await getAllDiscreteByProcedureIds(procedureIds);
                if(discreteSet.success) {
                    entity.discrete = discreteSet.data;
                }

                const valueAliasSetIds = [...new Set(entity.discrete.map(x => x.value_alias_set))];
                const valueAliasSet = await getValueAliasSetByIds(valueAliasSetIds);
                if(valueAliasSet.success) {
                    entity.valueAliasSet = valueAliasSet.data;
                }

                for(const vas of entity.valueAliasSet) {
                    const vToAlias = await getValueToAliasByValueAliasSetId(vas.mrid);
                    if(vToAlias.success) {
                        entity.valueToAlias = entity.valueToAlias.concat(vToAlias.data);
                    }
                }

                return {
                    success: true,
                    data: entity,
                    message: 'Surge Arrester job entity retrieved successfully'
                }
            } else {
                return { success: false, error: dataOldWork.error, message: 'Error retrieving old work data' };
            }
        }
    } catch (error) {
        console.error('Error retrieving surge arrester job entity:', error);
        return { success: false, error, message: 'Error retrieving surge arrester job entity' };
    }
}

export const deleteSurgeArresterJobEntity = async (id) => {

}

const runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
};