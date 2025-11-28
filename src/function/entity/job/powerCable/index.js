import db from '../../../datacontext/index.js'
import * as attachmentContext from '../../../attachmentcontext/index'
import path from 'path'
import { uploadAttachmentTransaction, backupAllFilesInDir, deleteBackupFiles, restoreFiles, syncFilesWithDeletion, getAttachmentByForeignIdAndType, deleteAttachmentByIdTransaction, deleteDirectory } from '@/function/entity/attachment'
import { insertOldWorkTransaction, getOldWorkById } from "@/function/cim/oldWork/index"
import { insertTestingEquipmentTransaction, getTestingEquipmentById, getTestingEquipmentByWorkId, deleteTestingEquipmentByIdTransaction } from '../../testingEquipment/index.js'
import PowerCableJobEntity from '@/views/Flatten/Job/PowerCable/index.js'
import { insertWorkTaskTransaction, getWorkTaskByWork, deleteWorkTaskByIdTransaction } from '@/function/cim/workTask/index.js'
import { insertOldTransformerObservationTransaction, getOldTransformerObservationById, deleteOldTransformerObservationByIdTransaction, getOldTransformerObservationByWorkTaskId } from '@/function/cim/oldTransformerObservation/index.js'
import { insertPercentTransaction, deletePercentByIdTransaction, getPercentById } from '@/function/cim/percent/index.js'
import { insertTemperatureTransaction, deleteTemperatureByIdTransaction, getTemperatureById } from '@/function/cim/temperature/index.js'
import { insertPowerCableTestingEquipmentTestTypeTransaction, getPowerCableTestingEquipmentTestingEqId, deletePowerCableTestingEquipmentTestTypeByIdTransaction } from '../../powerCableTestingEquipmentTestType/index.js'

import { insertTestDataSetTransaction, getTestDataSetByWorkTaskId, deleteTestDataSetByIdTransaction } from '@/function/cim/testDataSet'
import { insertAnalogTransaction } from '@/function/cim/analog'
import { insertStringMeasurementTransaction } from '@/function/cim/stringMeasurement/index.js'
import { insertDiscreteTransaction } from '@/function/cim/discrete'
import { insertValueAliasSetTransaction } from '@/function/cim/valueAliasSet/index.js'
import { insertValueToAliasTransaction } from '@/function/cim/valueToAlias'
import { insertProcedureTransaction } from '@/function/cim/procedure'
import { insertMeasurementProcedureTransaction } from '@/function/cim/measurementProcedure/index.js'
import { insertAnalogValueTransaction } from '@/function/cim/analogValue'
import { insertStringMeasurementValueTransaction } from '@/function/cim/stringMeasurementValue'
import { insertDiscreteValueTransaction } from '@/function/cim/discreteValue'

export const insertPowerCableJobEntity = async (old_entity, entity) => {
    try {
        if (entity.oldWork.mrid === null || entity.oldWork.mrid === '') {
            const result = {
                success: false,
                error: new Error("MRID is required for Power Cable Job Entity"),
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
                    error: new Error("MRID is required for Power Cable Job Entity"),
                    message: '',
                }
                return result;
            }

            for (const attachment of entity.attachmentTest) {
                backupAllFilesInDir(null, null, attachment.id_foreign);
                const syncResult = syncFilesWithDeletion(JSON.parse(attachment.path), null, attachment.id_foreign);
                if (!syncResult.success) {
                    restoreFiles(null, null, attachment.id_foreign);
                    deleteBackupFiles(null, attachment.id_foreign);
                    const result = {
                        success: false,
                        error: new Error("MRID is required for Power Cable Job Entity"),
                        message: '',
                    }
                    return result;
                }
            }

            await runAsync('BEGIN TRANSACTION');
            await insertOldWorkTransaction(entity.oldWork, db);
            if (entity.attachment.id && Array.isArray(JSON.parse(entity.attachment.path))) {
                const pathData = JSON.parse(entity.attachment.path);
                const newPath = []
                for (let i = 0; i < pathData.length; i++) {
                    const namefile = path.basename(pathData[i].path);
                    pathData[i].path = path.join(attachmentContext.getAttachmentDir(), namefile);
                    newPath.push(pathData[i]);
                }
                entity.attachment.path = JSON.stringify(newPath);
                await uploadAttachmentTransaction(entity.attachment, db);
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

            //powerCableTestingEquipmentTestType
            const newIdsSet = entity.powerCableTestingEquipmentTestType.map(v => v.mrid).filter(id => id); // bỏ null/empty
            const oldIdsSet = old_entity.powerCableTestingEquipmentTestType.map(v => v.mrid).filter(id => id);

            const toAddSet = entity.powerCableTestingEquipmentTestType.filter(v => v.mrid && !oldIdsSet.includes(v.mrid));
            const toDeleteSet = old_entity.powerCableTestingEquipmentTestType.filter(v => v.mrid && !newIdsSet.includes(v.mrid));
            const toUpdateSet = entity.powerCableTestingEquipmentTestType.filter(v => v.mrid && oldIdsSet.includes(v.mrid));

            for (const equipmentTestType of toAddSet) {
                await insertPowerCableTestingEquipmentTestTypeTransaction(equipmentTestType, db);
            }

            for (const equipmentTestType of toUpdateSet) {
                await insertPowerCableTestingEquipmentTestTypeTransaction(equipmentTestType, db);
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
                for (let i = 0; i < pathData.length; i++) {
                    const namefile = path.basename(pathData[i].path);
                    pathData[i].path = path.join(attachmentContext.getAttachmentDir(), entity.attachment.id_foreign, namefile);
                    newPath.push(pathData[i]);
                }
                entity.attachment.path = JSON.stringify(newPath);
                await uploadAttachmentTransaction(entity.attachment, db);
            }

            //attachment test
            for (const attachment of entity.attachmentTest) {
                if (attachment.id && Array.isArray(JSON.parse(attachment.path))) {
                    const pathData = JSON.parse(attachment.path);
                    const newPath = []
                    for (let i = 0; i < pathData.length; i++) {
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

            //insert string measurement value
            const newIdsAnalog = entity.analog.map(v => v.mrid).filter(id => id); // bỏ null/empty
            const oldIdsAnalog = old_entity.analog.map(v => v.mrid).filter(id => id);

            const toAddAnalog = entity.analog.filter(v => v.mrid && !oldIdsAnalog.includes(v.mrid));
            const toUpdateAnalog = entity.analog.filter(v => v.mrid && oldIdsAnalog.includes(v.mrid));
            const toDeleteAnalog = old_entity.analog.filter(v => v.mrid && !newIdsAnalog.includes(v.mrid));

            for (const analog of toAddAnalog) {
                await insertAnalogTransaction(analog, db);
            }

            for (const analog of toUpdateAnalog) {
                await insertAnalogTransaction(analog, db);
            }

            //insert string measurement value
            const newIdsStringMeasurement = entity.stringMeasurement.map(v => v.mrid).filter(id => id);
            const oldIdsStringMeasurement = old_entity.stringMeasurement.map(v => v.mrid).filter(id => id);

            const toAddStringMeasurement = entity.stringMeasurement.filter(v => v.mrid && !oldIdsStringMeasurement.includes(v.mrid));
            const toUpdateStringMeasurement = entity.stringMeasurement.filter(v => v.mrid && oldIdsStringMeasurement.includes(v.mrid));
            const toDeleteStringMeasurement = old_entity.stringMeasurement.filter(v => v.mrid && !newIdsStringMeasurement.includes(v.mrid));

            for (const stringMeasurement of toAddStringMeasurement) {
                await insertStringMeasurementTransaction(stringMeasurement, db);
            }

            for (const stringMeasurement of toUpdateStringMeasurement) {
                await insertStringMeasurementTransaction(stringMeasurement, db);
            }

            //insert discrete value
            const newIdsDiscrete = entity.discrete.map(v => v.mrid).filter(id => id);
            const oldIdsDiscrete = old_entity.discrete.map(v => v.mrid).filter(id => id);

            const toAddDiscrete = entity.discrete.filter(v => v.mrid && !oldIdsDiscrete.includes(v.mrid));
            const toUpdateDiscrete = entity.discrete.filter(v => v.mrid && oldIdsDiscrete.includes(v.mrid));
            const toDeleteDiscrete = old_entity.discrete.filter(v => v.mrid && !newIdsDiscrete.includes(v.mrid));

            for (const discrete of toAddDiscrete) {
                await insertDiscreteTransaction(discrete, db);
            }

            for (const discrete of toUpdateDiscrete) {
                await insertDiscreteTransaction(discrete, db);
            }

            //insert analog values
            const newIdsAnalogValue = entity.analogValues.map(v => v.mrid).filter(id => id);
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

            //insert string measurement values
            const newIdsStringMeasurementValue = entity.stringMeasurementValues.map(v => v.mrid).filter(id => id);
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

            //insert discrete values
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

            //insert value alias sets
            const newIdsValueAliasSet = entity.valueAliasSet.map(v => v.mrid).filter(id => id);
            const oldIdsValueAliasSet = old_entity.valueAliasSet.map(v => v.mrid).filter(id => id);

            const toAddValueAliasSet = entity.valueAliasSet.filter(v => v.mrid && !oldIdsValueAliasSet.includes(v.mrid));
            const toUpdateValueAliasSet = entity.valueAliasSet.filter(v => v.mrid && oldIdsValueAliasSet.includes(v.mrid));

            for (const valueAliasSet of toAddValueAliasSet) {
                await insertValueAliasSetTransaction(valueAliasSet, db);
            }

            for (const valueAliasSet of toUpdateValueAliasSet) {
                await insertValueAliasSetTransaction(valueAliasSet, db);
            }

            //insert value to alias
            const newIdsValueToAlias = entity.valueToAlias.map(v => v.mrid).filter(id => id);
            const oldIdsValueToAlias = old_entity.valueToAlias.map(v => v.mrid).filter(id => id);

            const toAddValueToAlias = entity.valueToAlias.filter(v => v.mrid && !oldIdsValueToAlias.includes(v.mrid));
            const toUpdateValueToAlias = entity.valueToAlias.filter(v => v.mrid && oldIdsValueToAlias.includes(v.mrid));

            for (const valueToAlias of toAddValueToAlias) {
                await insertValueToAliasTransaction(valueToAlias, db);
            }

            for (const valueToAlias of toUpdateValueToAlias) {
                await insertValueToAliasTransaction(valueToAlias, db);
            }

            //delete testing equipment that are not in the new list
            for (const equipmentTestType of toDeleteSet) {
                await deletePowerCableTestingEquipmentTestTypeByIdTransaction(equipmentTestType.mrid, db);
            }

            for (const testData of toDeleteTestDataSet) {
                await deleteTestDataSetByIdTransaction(testData.mrid, db);
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
            for (const attachment of entity.attachmentTest) {
                deleteBackupFiles(null, attachment.id_foreign);
            }
            return { success: true, data: entity, message: 'Power Cable Job entity inserted successfully' };

        }
    } catch (error) {
        restoreFiles(null, null, entity.oldWork.mrid);
        deleteBackupFiles(null, entity.oldWork.mrid);
        for (const attachment of entity.attachmentTest) {
            restoreFiles(null, null, attachment.id_foreign);
            deleteBackupFiles(null, attachment.id_foreign);
        }
        console.error('Error retrieving power cable entity:', error);
        await runAsync('ROLLBACK');
        return { success: false, error, message: 'Error retrieving power cable entity' };
    }
}

export const getPowerCableJobEntity = async (id) => {
    try {
        if (id == null || id === '') {
            return { success: false, error: new Error('Invalid ID') };
        } else {
            const entity = new PowerCableJobEntity()
            const dataOldWork = await getOldWorkById(id);
            if (dataOldWork.success) {
                entity.oldWork = dataOldWork.data;

                const dataAttachment = await getAttachmentByForeignIdAndType(entity.oldWork.mrid, 'job');
                if (dataAttachment.success) {
                    entity.attachment = dataAttachment.data;
                }

                const dataTestingEquipment = await getTestingEquipmentByWorkId(entity.oldWork.mrid);
                if (dataTestingEquipment.success) {
                    entity.testingEquipment = dataTestingEquipment.data;
                } else {
                    entity.testingEquipment = [];
                }

                for (const equipment of entity.testingEquipment) {
                    const dataEquipmentTestType = await getPowerCableTestingEquipmentTestingEqId(equipment.mrid);
                    if (dataEquipmentTestType.success) {
                        entity.powerCableTestingEquipmentTestType = entity.powerCableTestingEquipmentTestType.concat(dataEquipmentTestType.data);
                    }
                }

                const dataWorkTask = await getWorkTaskByWork(entity.oldWork.mrid, db);
                if (dataWorkTask.success) {
                    entity.workTasks = dataWorkTask.data;
                } else {
                    entity.workTasks = [];
                }

                for (let i = 0; i < entity.workTasks.length; i++) {
                    const workTask = entity.workTasks[i];
                    const dataTransformerObservation = await getOldTransformerObservationByWorkTaskId(workTask.mrid);
                    if (dataTransformerObservation.success) {
                        entity.transformerObservation.push(dataTransformerObservation.data);
                    }

                    const dataAttachmentTest = await getAttachmentByForeignIdAndType(workTask.mrid, 'test');
                    if (dataAttachmentTest.success) {
                        entity.attachmentTest.push(dataAttachmentTest.data);
                    }

                    const dataTestDataSet = await getTestDataSetByWorkTaskId(workTask.mrid)
                    if (dataTestDataSet.success) {
                        entity.testDataSet = entity.testDataSet.concat(dataTestDataSet.data)
                    }
                }

                for (const observation of entity.transformerObservation) {
                    if (observation.humidity) {
                        const dataPercent = await getPercentById(observation.humidity);
                        if (dataPercent.success) {
                            entity.percent.push(dataPercent.data);
                        }
                    }

                }

                for (const observation of entity.transformerObservation) {
                    if (observation.ambient_temp) {
                        const dataTemp = await getTemperatureById(observation.ambient_temp);
                        if (dataTemp.success) {
                            entity.temperature.push(dataTemp.data);
                        }
                    }
                }

                for (const observation of entity.transformerObservation) {
                    if (observation.reference_temp) {
                        const dataTemp = await getTemperatureById(observation.reference_temp);
                        if (dataTemp.success) {
                            entity.temperature.push(dataTemp.data);
                        }
                    }
                }

                for (const observation of entity.transformerObservation) {
                    if (observation.winding_temp) {
                        const dataTemp = await getTemperatureById(observation.winding_temp);
                        if (dataTemp.success) {
                            entity.temperature.push(dataTemp.data);
                        }
                    }
                }

                for (const observation of entity.transformerObservation) {
                    if (observation.top_oil_temp) {
                        const dataTemp = await getTemperatureById(observation.top_oil_temp);
                        if (dataTemp.success) {
                            entity.temperature.push(dataTemp.data);
                        }
                    }
                    if (observation.bottom_oil_temp) {
                        const dataTemp = await getTemperatureById(observation.bottom_oil_temp);
                        if (dataTemp.success) {
                            entity.temperature.push(dataTemp.data);
                        }
                    }
                }

                return {
                    success: true,
                    data: entity,
                    message: 'Power Cable job entity retrieved successfully'
                }
            } else {
                return { success: false, error: dataOldWork.error, message: 'Error retrieving old work data' };
            }
        }
    } catch (error) {
        console.error('Error retrieving power cable job entity:', error);
        return { success: false, error, message: 'Error retrieving power cable job entity' };
    }
}

export const deletePowerCableJobEntity = async (id) => {
    try {
        if (id == null || id === '') {
            return { success: false, error: new Error('Invalid ID') };
        } else {
            await runAsync('BEGIN TRANSACTION');

            // Delete old work (this will cascade delete related records)
            await runAsync('DELETE FROM old_work WHERE mrid = ?', [id]);

            await runAsync('COMMIT');
            return { success: true, data: id, message: 'Power Cable Job entity deleted successfully' };
        }
    } catch (error) {
        console.error('Error deleting power cable job entity:', error);
        await runAsync('ROLLBACK');
        return { success: false, error, message: 'Error deleting power cable job entity' };
    }
}

const runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
};