import db from '../../datacontext/index'
import path from 'path'
import * as attachmentContext from '../../attachmentcontext/index'
import { uploadAttachmentTransaction, backupAllFilesInDir, deleteBackupFiles, restoreFiles, syncFilesWithDeletion, getAttachmentByForeignIdAndType, deleteAttachmentByIdTransaction, deleteDirectory } from '@/function/entity/attachment'
import {insertSurgeArresterTransaction, getSurgeArresterById, deleteSurgeArresterTransaction} from '@/function/cim/surgeArrester';
import {insertVoltageTransaction, getVoltageById, deleteVoltageByIdTransaction} from '@/function/cim/voltage';
import { insertSecondsTransaction, getSecondById, deleteSecondsByIdTransaction } from '@/function/cim/seconds';
import {insertCurrentFlowTransaction, getCurrentFlowById, deleteCurrentFlowByIdTransaction} from '@/function/cim/currentFlow';
import {insertLifecycleDateTransaction, getLifecycleDateById, deleteLifecycleDateByIdTransaction} from '@/function/cim/lifecycleDate';
import {insertProductAssetModelTransaction, getProductAssetModelById, deleteProductAssetModelByIdTransaction} from '@/function/cim/productAssetModel';
import {insertAssetPsrTransaction, getAssetPsrById, getAssetPsrByAssetIdAndPsrId, deleteAssetPsrTransaction} from '@/function/entity/assetPsr'
import { insertOldSurgeArresterInfoTransaction, getOldSurgeArresterInfoBySurgeArresterId, deleteOldSurgeArresterInfoByIdTransaction } from '@/function/cim/oldSurgeArresterInfo';
import SurgeArresterEntity from '@/views/Flatten/SurgeArrester';

export const insertSurgeArresterEntity = async (old_entity,entity) => {
    try {
        if(entity.surgeArrester.mrid === null || entity.surgeArrester.mrid === '') {
            const result = {
                success: false,
                error: new Error("MRID is required for Surge Arrester Entity"),
                message: '',
            }
            return result;
        } else {
            backupAllFilesInDir(null, null, entity.surgeArrester.mrid);
            const syncResult = syncFilesWithDeletion(JSON.parse(entity.attachment.path), null, entity.surgeArrester.mrid);
            if (!syncResult.success) {
                restoreFiles(null, null, entity.surgeArrester.mrid);
                deleteBackupFiles(null, entity.surgeArrester.mrid);
                const result = {
                    success: false,
                    error: new Error("MRID is required for Surge Arrester Entity"),
                    message: '',
                }
                return result;
            }
            await runAsync('BEGIN TRANSACTION');

            //voltage
            const newIds = entity.voltage.map(v => v.mrid).filter(id => id); // bỏ null/empty
            const oldIds = old_entity.voltage.map(v => v.mrid).filter(id => id);

            const toAdd = entity.voltage.filter(v => v.mrid && !oldIds.includes(v.mrid));
            const toDelete = old_entity.voltage.filter(v => v.mrid && !newIds.includes(v.mrid));
            const toUpdate = entity.voltage.filter(v => v.mrid && oldIds.includes(v.mrid));
            for (const voltage of toAdd) {
                await insertVoltageTransaction(voltage, db);
            }
            for (const voltage of toUpdate) {
                await insertVoltageTransaction(voltage, db);
            }

            //seconds
            const newSecondsIds = entity.seconds.map(s => s.mrid).filter(id => id);
            const oldSecondsIds = old_entity.seconds.map(s => s.mrid).filter(id => id);

            const toAddSeconds = entity.seconds.filter(s => s.mrid && !oldSecondsIds.includes(s.mrid));
            const toDeleteSeconds = old_entity.seconds.filter(s => s.mrid && !newSecondsIds.includes(s.mrid));
            const toUpdateSeconds = entity.seconds.filter(s => s.mrid && oldSecondsIds.includes(s.mrid));
            for (const seconds of toAddSeconds) {
                await insertSecondsTransaction(seconds, db);
            }
            for (const seconds of toUpdateSeconds) {
                await insertSecondsTransaction(seconds, db);
            }

            //currentFlow
            const newCurrentFlowIds = entity.currentFlow.map(c => c.mrid).filter(id => id);
            const oldCurrentFlowIds = old_entity.currentFlow.map(c => c.mrid).filter(id => id);

            const toAddCurrentFlow = entity.currentFlow.filter(c => c.mrid && !oldCurrentFlowIds.includes(c.mrid));
            const toDeleteCurrentFlow = old_entity.currentFlow.filter(c => c.mrid && !newCurrentFlowIds.includes(c.mrid));
            const toUpdateCurrentFlow = entity.currentFlow.filter(c => c.mrid && oldCurrentFlowIds.includes(c.mrid));
            for (const currentFlow of toAddCurrentFlow) {
                await insertCurrentFlowTransaction(currentFlow, db);
            }

            for (const currentFlow of toUpdateCurrentFlow) {
                await insertCurrentFlowTransaction(currentFlow, db);
            }

            await insertLifecycleDateTransaction(entity.lifecycleDate, db);
            await insertProductAssetModelTransaction(entity.productAssetModel, db);
            await insertSurgeArresterTransaction(entity.surgeArrester, db);
            await insertAssetPsrTransaction(entity.assetPsr, db);

            //oldSurgeArresterInfo
            const newOldSurgeArresterInfoIds = entity.oldSurgeArresterInfo.map(o => o.mrid).filter(id => id);
            const oldOldSurgeArresterInfoIds = old_entity.oldSurgeArresterInfo.map(o => o.mrid).filter(id => id);

            const toAddOldSurgeArresterInfo = entity.oldSurgeArresterInfo.filter(o => o.mrid && !oldOldSurgeArresterInfoIds.includes(o.mrid));
            const toDeleteOldSurgeArresterInfo = old_entity.oldSurgeArresterInfo.filter(o => o.mrid && !newOldSurgeArresterInfoIds.includes(o.mrid));
            const toUpdateOldSurgeArresterInfo = entity.oldSurgeArresterInfo.filter(o => o.mrid && oldOldSurgeArresterInfoIds.includes(o.mrid));

            for (const oldSurgeArresterInfo of toAddOldSurgeArresterInfo) {
                await insertOldSurgeArresterInfoTransaction(oldSurgeArresterInfo, db);
            }

            for (const oldSurgeArresterInfo of toUpdateOldSurgeArresterInfo) {
                await insertOldSurgeArresterInfoTransaction(oldSurgeArresterInfo, db);
            }

            if (entity.attachment.id && Array.isArray(JSON.parse(entity.attachment.path))) {
                const pathData = JSON.parse(entity.attachment.path);
                const newPath = []
                for(let i = 0; i < pathData.length; i++) {
                    const namefile = path.basename(pathData[i].path);
                    pathData[i].path = path.join(attachmentContext.getAttachmentDir(), entity.surgeArrester.mrid, namefile);
                    newPath.push(pathData[i]);
                }
                entity.attachment.path = JSON.stringify(newPath);
                await uploadAttachmentTransaction(entity.attachment, db);
            }

            //delete
            for (const oldSurgeArresterInfo of toDeleteOldSurgeArresterInfo) {
                await deleteOldSurgeArresterInfoByIdTransaction(oldSurgeArresterInfo.mrid, db);
            }

            for (const voltage of toDelete) {
                await deleteVoltageByIdTransaction(voltage.mrid, db);
            }
            for (const seconds of toDeleteSeconds) {
                await deleteSecondsByIdTransaction(seconds.mrid, db);
            }
            for (const currentFlow of toDeleteCurrentFlow) {
                await deleteCurrentFlowByIdTransaction(currentFlow.mrid, db);
            }

            await runAsync('COMMIT');
            deleteBackupFiles(null, entity.surgeArrester.mrid);
            return { success: true, data: entity, message: 'Surge Arrester entity inserted successfully' };
        }
    } catch (error) {
        restoreFiles(null, null, entity.surgeArrester.mrid);
        deleteBackupFiles(null, entity.surgeArrester.mrid);
        console.error('Error retrieving surge arrester entity:', error);
        await runAsync('ROLLBACK');
        return { success: false, error, message: 'Error retrieving surge arrester entity' };
    }
}

export const getSurgeArresterEntityById = async (id, psrId) => {
    try {
        if(id == null || id === '') {
            return { success: false, error: new Error('Invalid ID') };
        } else {
            const entity = new SurgeArresterEntity()
            const dataSurgeArrester = await getSurgeArresterById(id);
            if(dataSurgeArrester.success) {
                entity.surgeArrester = dataSurgeArrester.data
                const dataLifecycleDate = await getLifecycleDateById(entity.surgeArrester.lifecycle_date);
                if(dataLifecycleDate.success) {
                    entity.lifecycleDate = dataLifecycleDate.data;
                }
                const dataOldSurgeArresterInfo = await getOldSurgeArresterInfoBySurgeArresterId(entity.surgeArrester.mrid);
                if(dataOldSurgeArresterInfo.success) {
                    entity.oldSurgeArresterInfo = dataOldSurgeArresterInfo.data;
                }

                if(entity.oldSurgeArresterInfo.length > 0) {
                    const productAssetModelId = entity.oldSurgeArresterInfo[0].product_asset_model;
                    const dataProductAssetModel = await getProductAssetModelById(productAssetModelId);
                    if(dataProductAssetModel.success) {
                        entity.productAssetModel = dataProductAssetModel.data;
                    }
                }

                const dataAssetPsr = await getAssetPsrByAssetIdAndPsrId(entity.surgeArrester.mrid, psrId);
                if(dataAssetPsr.success) {
                    entity.assetPsr = dataAssetPsr.data;
                }

                if(entity.oldSurgeArresterInfo.length > 0) {
                    const voltageArr = ['continuous_operating_voltage', 'rated_voltage', 'maximum_system_voltage', 'pf_with_stand_voltage_isolated_distance', 'pf_with_stand_voltage_earth_between_pole']
                    const currentFlowArr = ['short_time_with_stand_current']
                    const secondsArr = ['rated_duration_of_short_circuit']
                    for(let i = 0; i < entity.oldSurgeArresterInfo.length; i++) {
                        for(let j = 0; j < voltageArr.length; j++) {
                            const voltage = await getVoltageById(entity.oldSurgeArresterInfo[i][voltageArr[j]]);
                            if(voltage.success) {
                                entity.voltage.push(voltage.data);
                            }
                        }
                        for(let j = 0; j < currentFlowArr.length; j++) {
                            const currentFlow = await getCurrentFlowById(entity.oldSurgeArresterInfo[i][currentFlowArr[j]]);
                            if(currentFlow.success) {
                                entity.currentFlow.push(currentFlow.data);
                            }
                        }
                        for(let j = 0; j < secondsArr.length; j++) {
                            const seconds = await getSecondById(entity.oldSurgeArresterInfo[i][secondsArr[j]]);
                            if(seconds.success) {
                                entity.seconds.push(seconds.data);
                            }
                        }
                    }
                }

                const dataAttachment = await getAttachmentByForeignIdAndType(entity.surgeArrester.mrid, 'asset');
                if(dataAttachment.success) {
                    entity.attachment = dataAttachment.data;
                }

                return {
                    success: true,
                    data: entity,
                    message: 'Surge Arrester entity retrieved successfully'
                }
            } else {
                return { success: false, error: dataSurgeArrester.error, message: dataSurgeArrester.message };
            }
        }
    } catch (error) {
        console.error("Error retrieving Surge Arrester entity by ID:", error);
        return { success: false, error, message: 'Error retrieving Surge Arrester entity by ID' };
    }
}

export const deleteSurgeArresterEntity = async (data) => {
    try {
        if(data.surgeArrester == null || data.surgeArrester.mrid == null || data.surgeArrester.mrid === '') {
            return { success: false, error: new Error('Invalid ID') };
        } else {
            try {
                await runAsync('BEGIN TRANSACTION');
                if(data.attachment && data.attachment.id) {
                    const pathData = JSON.parse(data.attachment.path || '[]')
                    if (Array.isArray(pathData) && pathData.length > 0) {
                        syncFilesWithDeletion(pathData, null, data.mrid);
                    }
                }
                if( data.attachment.id) {
                    await deleteAttachmentByIdTransaction(data.attachment.id, db);
                }
                if(data.assetPsr && data.assetPsr.mrid) {
                    await deleteAssetPsrTransaction(data.assetPsr.mrid, db);
                }
                for (const oldSurgeArresterInfo of data.oldSurgeArresterInfo) {
                    if (oldSurgeArresterInfo.mrid) {
                        await deleteOldSurgeArresterInfoByIdTransaction(oldSurgeArresterInfo.mrid, db);
                    }
                }
                if(data.surgeArrester.mrid) {
                    await deleteSurgeArresterTransaction(data.surgeArrester.mrid, db);
                }
                if(data.lifecycleDate && data.lifecycleDate.mrid) {
                    await deleteLifecycleDateByIdTransaction(data.lifecycleDate.mrid, db);
                }
                if(data.productAssetModel && data.productAssetModel.mrid) {
                    await deleteProductAssetModelByIdTransaction(data.productAssetModel.mrid, db);
                }
                for (const voltage of data.voltage) {
                    if (voltage.mrid) {
                        await deleteVoltageByIdTransaction(voltage.mrid, db);
                    }
                }
                for (const seconds of data.seconds) {
                    if (seconds.mrid) {
                        await deleteSecondsByIdTransaction(seconds.mrid, db);
                    }
                }
                for (const currentFlow of data.currentFlow) {
                    if (currentFlow.mrid) {
                        await deleteCurrentFlowByIdTransaction(currentFlow.mrid, db);
                    }
                }
                await runAsync('COMMIT');
                if(data.attachment && data.attachment.id) {
                    deleteDirectory(null, data.surgeArrester.mrid);
                }
                return { success: true, message: 'Surge Arrester entity deleted successfully' };
            } catch (error) {
                await runAsync('ROLLBACK');
                console.error('Error deleting Surge Arrester entity:', error);
                return { success: false, error, message: 'Error deleting Surge Arrester entity' };
            }
        }
    } catch (error) {
        console.error('Error deleting Surge Arrester entity:', error);
        return { success: false, error, message: 'Error deleting Surge Arrester entity' };
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