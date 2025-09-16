import db from '../../datacontext/index'
import { backupAllFilesInDir, deleteBackupFiles, restoreFiles, syncFilesWithDeletion } from '@/function/entity/attachment'
import { insertVoltageTransaction, getVoltageById, deleteVoltageByIdTransaction } from '@/function/cim/voltage'
import { insertFrequencyTransaction, getFrequencyById, deleteFrequencyByIdTransaction } from '@/function/cim/frequency'
import { insertApparentPowerTransaction, getApparentPowerById, deleteApparentPowerByIdTransaction } from '@/function/cim/apparentPower'
import { insertLifecycleDateTransaction, getLifecycleDateById, deleteLifecycleDateByIdTransaction } from '@/function/cim/lifecycleDate'
import { insertProductAssetModelTransaction, getProductAssetModelById, deleteProductAssetModelByIdTransaction } from '@/function/cim/productAssetModel'
import { insertAssetTransaction, getAssetById, deleteAssetByIdTransaction } from '@/function/cim/asset'
import { insertOldPotentialTransformerTransaction } from '@/function/cim/OldPotentialTransformerInfo/index.js'
import { insertPotentialTransformerTable } from '@/function/cim/PotentialTransformerTable/index.js'
import { insertPotentialTransformerTransaction } from '@/function/cim/PotentialTransformerInfo/index.js'


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
            console.log('apparentPower')
            //lifecycleDate
            await insertLifecycleDateTransaction(entity.lifecycleDate, db);
            console.log('lifecycleDate')

            await insertProductAssetModelTransaction(entity.productAssetModel, db);
            console.log('productAssetModel')
            //asset
            await insertAssetTransaction(entity.asset, db);
            console.log('asset')
            //potentialTransformerInfo
            await insertPotentialTransformerTransaction(entity.OldPotentialTransformerInfo, db);
            console.log('potentialTransformerInfo')
            //potentialTransformerTable
            console.log('potentialTransformerTable: ' + entity.potentialTransformerTable.length)
            for (const table of entity.potentialTransformerTable) {
                await insertPotentialTransformerTable(table, db);
            }
            console.log('potentialTransformerTable')
            //oldPotentialTransformerInfo
            await insertOldPotentialTransformerTransaction(entity.OldPotentialTransformerInfo, db);
            console.log('oldPotentialTransformerInfo')
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

const runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
};
