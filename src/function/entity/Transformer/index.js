import db from '../../datacontext/index'
import path from 'path'
import * as attachmentContext from '../../attachmentcontext/index'
import { uploadAttachmentTransaction, backupAllFilesInDir, deleteBackupFiles, restoreFiles, syncFilesWithDeletion, getAttachmentByForeignIdAndType, deleteAttachmentByIdTransaction, deleteDirectory } from '@/function/entity/attachment'
import {insertOldPowerTransformerInfoTransaction, getOldPowerTransformerInfoById, deleteOldPowerTransformerInfoTransaction} from '@/function/cim/oldPowerTransformerInfo'
import {insertOldTransformerEndInfoTransaction, getOldTransformerEndInfoById, deleteOldTransformerEndInfoTransaction} from '@/function/cim/oldTransformerEndInfo'
import {insertAssetPsrTransaction, getAssetPsrById, getAssetPsrByAssetIdAndPsrId, deleteAssetPsrTransaction} from '@/function/entity/assetPsr'
import {insertProductAssetModelTransaction, getProductAssetModelById, deleteProductAssetModelByIdTransaction} from '@/function/cim/productAssetModel';
import {insertLifecycleDateTransaction, getLifecycleDateById, deleteLifecycleDateByIdTransaction} from '@/function/cim/lifecycleDate';
import { insertSecondsTransaction, getSecondById, deleteSecondsByIdTransaction } from '@/function/cim/seconds';
import {insertCurrentFlowTransaction, getCurrentFlowById, deleteCurrentFlowByIdTransaction} from '@/function/cim/currentFlow';
import {insertVoltageTransaction, getVoltageById, deleteVoltageByIdTransaction} from '@/function/cim/voltage';
import {insertFrequencyTransaction, getFrequencyById, deleteFrequencyByIdTransaction} from '@/function/cim/frequency';
import {insertMassTransaction, deleteMassByIdTransaction, getMassById} from '@/function/cim/mass'
import {insertVolumeTransaction, deleteVolumeByIdTransaction, getVolumeById} from '@/function/cim/volume'
import {insertAssetTransaction, deleteAssetByIdTransaction, getAssetById} from '@/function/cim/asset'

import SurgeArresterEntity from '@/views/Entity/SurgeArrester';

export const insertTransformerEntity = async (old_entity,entity) => {
    try {
        if(entity.asset.mrid === null || entity.asset.mrid === '') {
            const result = {
                success: false,
                error: new Error("MRID is required for Transformer Entity"),
                message: '',
            }
            return result;
        } else {
            backupAllFilesInDir(null, null, entity.asset.mrid);
            const syncResult = syncFilesWithDeletion(JSON.parse(entity.attachment.path), null, entity.asset.mrid);
            if (!syncResult.success) {
                restoreFiles(null, null, entity.asset.mrid);
                deleteBackupFiles(null, entity.asset.mrid);
                const result = {
                    success: false,
                    error: new Error("MRID is required for Transformer Entity"),
                    message: '',
                }
                return result;
            }
            await runAsync('BEGIN TRANSACTION');

            //voltage
            // const newIds = entity.voltage.map(v => v.mrid).filter(id => id); // bỏ null/empty
            // const oldIds = old_entity.voltage.map(v => v.mrid).filter(id => id);

            // const toAdd = entity.voltage.filter(v => v.mrid && !oldIds.includes(v.mrid));
            // const toDelete = old_entity.voltage.filter(v => v.mrid && !newIds.includes(v.mrid));
            // const toUpdate = entity.voltage.filter(v => v.mrid && oldIds.includes(v.mrid));
            // for (const voltage of toAdd) {
            //     await insertVoltageTransaction(voltage, db);
            // }
            // for (const voltage of toUpdate) {
            //     await insertVoltageTransaction(voltage, db);
            // }

            //frequency
            // const newFrequencyIds = entity.frequency.map(f => f.mrid).filter(id => id);
            // const oldFrequencyIds = old_entity.frequency.map(f => f.mrid).filter(id => id);

            // const toAddFrequency = entity.frequency.filter(f => f.mrid && !oldFrequencyIds.includes(f.mrid));
            // const toDeleteFrequency = old_entity.frequency.filter(f => f.mrid && !newFrequencyIds.includes(f.mrid));
            // const toUpdateFrequency = entity.frequency.filter(f => f.mrid && oldFrequencyIds.includes(f.mrid));
            // for (const frequency of toAddFrequency) {
            //     await insertFrequencyTransaction(frequency, db);
            // }
            // for (const frequency of toUpdateFrequency) {
            //     await insertFrequencyTransaction(frequency, db);
            // }

            //seconds
            // const newSecondsIds = entity.seconds.map(s => s.mrid).filter(id => id);
            // const oldSecondsIds = old_entity.seconds.map(s => s.mrid).filter(id => id);

            // const toAddSeconds = entity.seconds.filter(s => s.mrid && !oldSecondsIds.includes(s.mrid));
            // const toDeleteSeconds = old_entity.seconds.filter(s => s.mrid && !newSecondsIds.includes(s.mrid));
            // const toUpdateSeconds = entity.seconds.filter(s => s.mrid && oldSecondsIds.includes(s.mrid));
            // for (const seconds of toAddSeconds) {
            //     await insertSecondsTransaction(seconds, db);
            // }
            // for (const seconds of toUpdateSeconds) {
            //     await insertSecondsTransaction(seconds, db);
            // }

            //currentFlow
            // const newCurrentFlowIds = entity.currentFlow.map(c => c.mrid).filter(id => id);
            // const oldCurrentFlowIds = old_entity.currentFlow.map(c => c.mrid).filter(id => id);

            // const toAddCurrentFlow = entity.currentFlow.filter(c => c.mrid && !oldCurrentFlowIds.includes(c.mrid));
            // const toDeleteCurrentFlow = old_entity.currentFlow.filter(c => c.mrid && !newCurrentFlowIds.includes(c.mrid));
            // const toUpdateCurrentFlow = entity.currentFlow.filter(c => c.mrid && oldCurrentFlowIds.includes(c.mrid));
            // for (const currentFlow of toAddCurrentFlow) {
            //     await insertCurrentFlowTransaction(currentFlow, db);
            // }

            // for (const currentFlow of toUpdateCurrentFlow) {
            //     await insertCurrentFlowTransaction(currentFlow, db);
            // }

            //mass
            // const newMassIds = entity.mass.map(c => c.mrid).filter(id => id);
            // const oldMassIds = old_entity.mass.map(c => c.mrid).filter(id => id);

            // const toAddMass = entity.mass.filter(c => c.mrid && !oldMassIds.includes(c.mrid));
            // const toDeleteMass = old_entity.mass.filter(c => c.mrid && !newMassIds.includes(c.mrid));
            // const toUpdateMass = entity.mass.filter(c => c.mrid && oldMassIds.includes(c.mrid));
            // for (const mass of toAddMass) {
            //     await insertMassTransaction(mass, db);
            // }

            // for (const mass of toUpdateMass) {
            //     await insertMassTransaction(mass, db);
            // }

            //volume
            // const newVolumeIds = entity.volume.map(c => c.mrid).filter(id => id);
            // const oldVolumeIds = old_entity.volume.map(c => c.mrid).filter(id => id);

            // const toAddVolume = entity.volume.filter(c => c.mrid && !oldVolumeIds.includes(c.mrid));
            // const toDeleteVolume = old_entity.volume.filter(c => c.mrid && !newVolumeIds.includes(c.mrid));
            // const toUpdateVolume = entity.volume.filter(c => c.mrid && oldVolumeIds.includes(c.mrid));
            // for (const volume of toAddVolume) {
            //     await insertVolumeTransaction(volume, db);
            // }

            // for (const volume of toUpdateVolume) {
            //     await insertVolumeTransaction(volume, db);
            // }


            await insertLifecycleDateTransaction(entity.lifecycleDate, db);
            await insertProductAssetModelTransaction(entity.productAssetModel, db);
            await insertAssetTransaction(entity.asset, db);
            await insertAssetPsrTransaction(entity.assetPsr, db);
            // await insertOldTransformerEndInfoTransaction(entity.oldPowerTransformerInfo, db);


            //oldPowerTransformerInfo
            // const newOldTransformerEndInfoIds = entity.oldTransformerEndInfo.map(o => o.mrid).filter(id => id);
            // const oldOldTransformerEndInfoIds = old_entity.oldTransformerEndInfo.map(o => o.mrid).filter(id => id);

            // const toAddOldTransformerEndInfo = entity.oldTransformerEndInfo.filter(o => o.mrid && !oldOldTransformerEndInfoIds.includes(o.mrid));
            // const toDeleteOldTransformerEndInfo = old_entity.oldTransformerEndInfo.filter(o => o.mrid && !newOldTransformerEndInfoIds.includes(o.mrid));
            // const toUpdateOldTransformerEndInfo = entity.oldTransformerEndInfo.filter(o => o.mrid && oldOldTransformerEndInfoIds.includes(o.mrid));

            // for (const oldTransformerEndInfo of toAddOldTransformerEndInfo) {
            //     await insertOldTransformerEndInfoTransaction(oldTransformerEndInfo, db);
            // }

            // for (const oldTransformerEndInfo of toUpdateOldTransformerEndInfo) {
            //     await insertOldTransformerEndInfoTransaction(oldTransformerEndInfo, db);
            // }

            if (entity.attachment.id && Array.isArray(JSON.parse(entity.attachment.path))) {
                const pathData = JSON.parse(entity.attachment.path);
                const newPath = []
                for(let i = 0; i < pathData.length; i++) {
                    const namefile = path.basename(pathData[i].path);
                    pathData[i].path = path.join(attachmentContext.getAttachmentDir(), entity.asset.mrid, namefile);
                    newPath.push(pathData[i]);
                }
                entity.attachment.path = JSON.stringify(newPath);
                await uploadAttachmentTransaction(entity.attachment, db);
            }

            //delete
            for (const oldTransformerEndInfo of toDeleteOldTransformerEndInfo) {
                await deleteOldTransformerEndInfoTransaction(oldTransformerEndInfo.mrid, db);
            }

            for (const mass of toDeleteMass) {
                await deleteMassByIdTransaction(mass.mrid, db);
            }

            for (const volume of toDeleteVolume) {
                await deleteVolumeByIdTransaction(volume.mrid, db);
            }

            for (const frequency of toDeleteFrequency) {
                await deleteFrequencyByIdTransaction(frequency.mrid, db);
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
            const dataSurgeArrester = await getAssetById(id);
            if(dataSurgeArrester.success) {
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