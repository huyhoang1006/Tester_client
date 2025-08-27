import db from '../../../datacontext/index.js'
import * as attachmentContext from '../../../attachmentcontext/index'
import path from 'path'
import { uploadAttachmentTransaction, backupAllFilesInDir, deleteBackupFiles, restoreFiles, syncFilesWithDeletion, getAttachmentByForeignIdAndType, deleteAttachmentByIdTransaction, deleteDirectory } from '@/function/entity/attachment'
import {insertOldWorkTransaction, getOldWorkById} from "@/function/cim/oldWork/index"
import { insertTestingEquipmentTransaction, getTestingEquipmentById, getTestingEquipmentByWorkId, deleteTestingEquipmentByIdTransaction } from '../../testingEquipment/index.js'
import SurgeArresterJobEntity from '@/views/Entity/Job/SurgeArrester'
import { insertWorkTaskTransaction, getWorkTaskByWork, deleteWorkTaskByIdTransaction } from '@/function/cim/workTask/index.js'
import { insertOldSpecimenTransaction, getOldSpecimenByWorkTaskId, deleteOldSpecimenByIdTransaction } from '@/function/cim/oldSpecimen/index.js'
import { insertOldTransformerObservationTransaction, getOldTransformerObservationById, deleteOldTransformerObservationByIdTransaction, getOldTransformerObservationByWorkTaskId } from '@/function/cim/oldTransformerObservation/index.js'
import {insertPercentTransaction, deletePercentByIdTransaction, getPercentById} from '@/function/cim/percent/index.js'
import {insertTemperatureTransaction, deleteTemperatureByIdTransaction, getTemperatureById} from '@/function/cim/temperature/index.js'

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

            //specimen
            const newIdsSpecimen = entity.specimen.map(v => v.mrid).filter(id => id); // bỏ null/empty
            const oldIdsSpecimen = old_entity.specimen.map(v => v.mrid).filter(id => id);

            const toAddSpecimen = entity.specimen.filter(v => v.mrid && !oldIdsSpecimen.includes(v.mrid));
            const toDeleteSpecimen = old_entity.specimen.filter(v => v.mrid && !newIdsSpecimen.includes(v.mrid));
            const toUpdateSpecimen = entity.specimen.filter(v => v.mrid && oldIdsSpecimen.includes(v.mrid));

            for (const specimen of toAddSpecimen) {
                await insertOldSpecimenTransaction(specimen, db);
            }

            for (const specimen of toUpdateSpecimen) {
                await insertOldSpecimenTransaction(specimen, db);
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

            //delete testing equipment that are not in the new list
            for (const equipment of toDelete) {
                await deleteTestingEquipmentByIdTransaction(equipment.mrid, db);
            }

            for (const specimen of toDeleteSpecimen) {
                console.log("Deleting Specimen:", specimen);
                await deleteOldSpecimenByIdTransaction(specimen.mrid, db);
            }

            for (const observation of toDeleteTransformerObservation) {
                console.log("Deleting Transformer Observation:", observation);
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
        restoreFiles(null, null, entity.oldWork.mrid);
        deleteBackupFiles(null, entity.oldWork.mrid);
        for(const attachment of entity.attachmentTest) {
            restoreFiles(null, null, attachment.id_foreign);
            deleteBackupFiles(null, attachment.id_foreign);
        }
        console.error('Error retrieving surge arrester entity:', error);
        await runAsync('ROLLBACK');
        return { success: false, error, message: 'Error retrieving surge arrester entity' };
    }
}

export const getSurgeArresterJobEntity = async (id) => {
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

                const dataWorkTask = await getWorkTaskByWork(entity.oldWork.mrid, db);
                if(dataWorkTask.success) {
                    entity.workTasks = dataWorkTask.data;
                } else {
                    entity.workTasks = [];
                }

                for (let i = 0; i < entity.workTasks.length; i++) {
                    const workTask = entity.workTasks[i];
                    const dataSpecimen = await getOldSpecimenByWorkTaskId(workTask.mrid);
                    if(dataSpecimen.success) {
                        entity.specimen = entity.specimen.concat(dataSpecimen.data);
                    }

                    for(const specimen of entity.specimen) {
                        if(specimen.humidity_at_sampling) {
                            const dataPercent = await getPercentById(specimen.humidity_at_sampling);
                            if(dataPercent.success) {
                                entity.percent.push(dataPercent.data);
                            }
                        }

                    }
                    for(const specimen of entity.specimen) {
                        if(specimen.ambient_temperature_at_sampling) {
                            const dataTemp = await getTemperatureById(specimen.ambient_temperature_at_sampling);
                            if(dataTemp.success) {
                                entity.temperature.push(dataTemp.data);
                            }
                        }
                    }
                    for(const specimen of entity.specimen) {
                        if(specimen.reference_temp) {
                            const dataTemp = await getTemperatureById(specimen.reference_temp);
                            if(dataTemp.success) {
                                entity.temperature.push(dataTemp.data);
                            }
                        }
                    }
                    for(const specimen of entity.specimen) {
                        if(specimen.winding_temp) {
                            const dataTemp = await getTemperatureById(specimen.winding_temp);
                            if(dataTemp.success) {
                                entity.temperature.push(dataTemp.data);
                            }
                        }
                    }

                    const dataTransformerObservation = await getOldTransformerObservationByWorkTaskId(workTask.mrid);
                    if(dataTransformerObservation.success) {
                        entity.transformerObservation = entity.transformerObservation.concat(dataTransformerObservation.data);
                    }
                    for(const observation of entity.transformerObservation) {
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

                    const dataAttachmentTest = await getAttachmentByForeignIdAndType(workTask.mrid, 'test');
                    if(dataAttachmentTest.success) {
                        entity.attachmentTest.push(dataAttachmentTest.data);
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