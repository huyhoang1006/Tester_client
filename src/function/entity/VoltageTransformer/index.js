import db from '../../datacontext/index'
import { uploadAttachmentTransaction, backupAllFilesInDir, deleteBackupFiles, restoreFiles, syncFilesWithDeletion, getAttachmentByForeignIdAndType, deleteAttachmentByIdTransaction, deleteDirectory } from '@/function/entity/attachment'
import { insertVoltageTransaction, getVoltageById, deleteVoltageByIdTransaction } from '@/function/cim/voltage'
import { insertFrequencyTransaction, getFrequencyById, deleteFrequencyByIdTransaction } from '@/function/cim/frequency'
import { insertApparentPowerTransaction, getApparentPowerById, deleteApparentPowerByIdTransaction } from '@/function/cim/apparentPower'
import { insertLifecycleDateTransaction, getLifecycleDateById, deleteLifecycleDateByIdTransaction } from '@/function/cim/lifecycleDate'
import { insertProductAssetModelTransaction, getProductAssetModelById, deleteProductAssetModelByIdTransaction } from '@/function/cim/productAssetModel'
import { insertAssetTransaction, getAssetById, deleteAssetByIdTransaction } from '@/function/cim/asset'
import { insertOldPotentialTransformerTransaction, getOldPotentialTransformerInfoById } from '@/function/cim/OldPotentialTransformerInfo/index.js'
import { insertPotentialTransformerTable } from '@/function/cim/PotentialTransformerTable/index.js'
import {insertAssetPsrTransaction, getAssetPsrById, getAssetPsrByAssetIdAndPsrId, deleteAssetPsrTransaction} from '@/function/entity/assetPsr'
import VoltageTransformerEntity from '@/views/Entity/VoltageTransformer'


/**
 * 
 * Error saving voltage transformer entity: Cannot read property 'mrid' of undefined
 */
export const insertVoltageTransformerEntity = async (old_entity, entity) => {
    try {
        if (entity.asset.mrid === null || entity.asset.mrid === '') {
            const result = {
                success: false,
                error: new Error("MRID is required for Voltage Transformer Entity"),
                message: '',
            }
            return result;
        } else {
            backupAllFilesInDir(null, null, entity.OldPotentialTransformerInfo.mrid);
            const syncResult = syncFilesWithDeletion(JSON.parse(entity.attachment.path), null, entity.OldPotentialTransformerInfo.mrid);
            if (!syncResult.success) {
                restoreFiles(null, null, entity.OldPotentialTransformerInfo.mrid);
                deleteBackupFiles(null, entity.OldPotentialTransformerInfo.mrid);
                const result = {
                    success: false,
                    error: new Error("MRID is required for Surge Arrester Entity"),
                    message: '',
                }
                return result;
            }
            await runAsync('BEGIN TRANSACTION');
            //voltage
            const newIds = (entity.voltage || []).map(v => v.mrid).filter(id => id);
            const oldIds = (old_entity.voltage || []).map(v => v.mrid).filter(id => id);
            const toAdd = (entity.voltage || []).filter(v => v.mrid && !oldIds.includes(v.mrid));
            const toDelete = (old_entity.voltage || []).filter(v => v.mrid && !newIds.includes(v.mrid));
            const toUpdate = (entity.voltage || []).filter(v => v.mrid && oldIds.includes(v.mrid));
            for (const voltage of toAdd) {
                await insertVoltageTransaction(voltage, db);
            }
            for (const voltage of toUpdate) {
                await insertVoltageTransaction(voltage, db);
            }
            console.log('voltage')
            //frequency
            const newFrequencyIds = (entity.frequency || []).map(f => f.mrid).filter(id => id);
            const oldFrequencyIds = (old_entity.frequency || []).map(f => f.mrid).filter(id => id);
            const toAddFrequency = (entity.frequency || []).filter(f => f.mrid && !oldFrequencyIds.includes(f.mrid));
            const toDeleteFrequency = (old_entity.frequency || []).filter(f => f.mrid && !newFrequencyIds.includes(f.mrid));
            const toUpdateFrequency = (entity.frequency || []).filter(f => f.mrid && oldFrequencyIds.includes(f.mrid));
            for (const frequency of toAddFrequency) {
                await insertFrequencyTransaction(frequency, db);
            }
            for (const frequency of toUpdateFrequency) {
                await insertFrequencyTransaction(frequency, db);
            }
            console.log('frequency')
            //apparentPower
            const newApparentPowerIds = (entity.apparentPower || []).map(a => a.mrid).filter(id => id);
            const oldApparentPowerIds = (old_entity.apparentPower || []).map(a => a.mrid).filter(id => id);
            const toAddApparentPower = (entity.apparentPower || []).filter(a => a.mrid && !oldApparentPowerIds.includes(a.mrid));
            const toDeleteApparentPower = (old_entity.apparentPower || []).filter(a => a.mrid && !newApparentPowerIds.includes(a.mrid));
            const toUpdateApparentPower = (entity.apparentPower || []).filter(a => a.mrid && oldApparentPowerIds.includes(a.mrid));
            for (const apparentPower of toAddApparentPower) {
                await insertApparentPowerTransaction(apparentPower, db);
            }
            for (const apparentPower of toUpdateApparentPower) {
                await insertApparentPowerTransaction(apparentPower, db);
            }

            //lifecycleDate
            await insertLifecycleDateTransaction(entity.lifecycleDate, db);

            //productAssetModel
            await insertProductAssetModelTransaction(entity.productAssetModel, db);
            

            //oldPotentialTransformerInfo
            await insertOldPotentialTransformerTransaction(entity.OldPotentialTransformerInfo, db);

            //asset
            await insertAssetTransaction(entity.asset, db);

            //assetPsr
            await insertAssetPsrTransaction(entity.assetPsr, db);


            //potentialTransformerTable
            for (const table of entity.potentialTransformerTable) {
                await insertPotentialTransformerTable(table, db);
            }
            await runAsync('COMMIT');
            deleteBackupFiles(null, entity.OldPotentialTransformerInfo.mrid);
            return { success: true, data: entity, message: 'Voltage Transformer entity inserted successfully' };

        }
    } catch (error) {
        restoreFiles(null, null, entity.OldPotentialTransformerInfo.mrid);
        deleteBackupFiles(null, entity.OldPotentialTransformerInfo.mrid);
        console.error('Error retrieving voltage transformer entity:', error);
        await runAsync('ROLLBACK');
        return { success: false, error, message: 'Error retrieving voltage transformer entity' };
    }
}

export const getVoltageTransformerEntityById = async (id, psrId) => {
    try {
        if(id == null || id === '') {
            return { success: false, error: new Error('Invalid ID') };
        } else {
            const entity = new VoltageTransformerEntity()
            const dataVt = await getAssetById(id);
            if(dataVt.success) {
                entity.asset = dataVt.data
                const dataLifecycleDate = await getLifecycleDateById(entity.asset.lifecycle_date);
                if(dataLifecycleDate.success) {
                    entity.lifecycleDate = dataLifecycleDate.data;
                }

                const dataOldVtInfo = await getOldPotentialTransformerInfoById(entity.asset.mrid);
                if(dataOldVtInfo.success) {
                    entity.OldPotentialTransformerInfo = dataOldVtInfo.data;
                }
                
                const productAssetModelId = entity.OldPotentialTransformerInfo.product_asset_model;
                const dataProductAssetModel = await getProductAssetModelById(productAssetModelId);
                if(dataProductAssetModel.success) {
                    entity.productAssetModel = dataProductAssetModel.data;
                }
                
                const dataAssetPsr = await getAssetPsrByAssetIdAndPsrId(entity.asset.mrid, psrId);
                if(dataAssetPsr.success) {
                    entity.assetPsr = dataAssetPsr.data;
                }

                const dataAttachment = await getAttachmentByForeignIdAndType(entity.asset.mrid, 'asset');
                if(dataAttachment.success) {
                    entity.attachment = dataAttachment.data;
                }

                return {
                    success: true,
                    data: entity,
                    message: 'Voltage transformer entity retrieved successfully'
                }
            } else {
                return { success: false, error: dataVt.error, message: dataVt.message };
            }
        }
    } catch (error) {
        console.error("Error retrieving Voltage Transformer entity by ID:", error);
        return { success: false, error, message: 'Error retrieving Voltage Transformer entity by ID' };
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
