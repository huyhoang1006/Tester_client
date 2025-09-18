import db from '../../datacontext/index'
import { uploadAttachmentTransaction, backupAllFilesInDir, deleteBackupFiles, restoreFiles, syncFilesWithDeletion, getAttachmentByForeignIdAndType, deleteAttachmentByIdTransaction, deleteDirectory } from '@/function/entity/attachment'
import { insertVoltageTransaction, getVoltageById, deleteVoltageByIdTransaction } from '@/function/cim/voltage'
import { insertFrequencyTransaction, getFrequencyById, deleteFrequencyByIdTransaction } from '@/function/cim/frequency'
import { insertApparentPowerTransaction, getApparentPowerById, deleteApparentPowerByIdTransaction } from '@/function/cim/apparentPower'
import { insertLifecycleDateTransaction, getLifecycleDateById, deleteLifecycleDateByIdTransaction } from '@/function/cim/lifecycleDate'
import { insertProductAssetModelTransaction, getProductAssetModelById, deleteProductAssetModelByIdTransaction } from '@/function/cim/productAssetModel'
import { insertAssetTransaction, getAssetById, deleteAssetByIdTransaction } from '@/function/cim/asset'
import { insertOldPotentialTransformerTransaction, getOldPotentialTransformerInfoById, deleteOldPotentialTransformerInfoTransaction } from '@/function/cim/OldPotentialTransformerInfo/index.js'
import { insertPotentialTransformerTable, deletePotentialTransformerTableByPotentialTransformerInfoId, getPotentialTransformerTableByPotentialTransformerInfoId } from '@/function/cim/PotentialTransformerTable/index.js'
import { insertAssetPsrTransaction, getAssetPsrById, getAssetPsrByAssetIdAndPsrId, deleteAssetPsrTransaction, deleteAssetPsrByIdTransaction } from '@/function/entity/assetPsr'
import VoltageTransformerEntity from '@/views/Entity/VoltageTransformer'
import { getAssetInfoById } from '@/function/cim/assetInfo'


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

            //productAssetModel
            console.log("product assetmodel : ", entity.productAssetModel)
            const productAssetModelResult = await insertProductAssetModelTransaction(entity.productAssetModel, db);

            //oldPotentialTransformerInfo
            console.log("old potential transformer info : ", entity.OldPotentialTransformerInfo)
            await insertOldPotentialTransformerTransaction(entity.OldPotentialTransformerInfo, db);

            //lifecycleDate
            await insertLifecycleDateTransaction(entity.lifecycleDate, db);





            //asset
            await insertAssetTransaction(entity.asset, db);


            //assetPsr
            await insertAssetPsrTransaction(entity.assetPsr, db);

            //delete old data potentialTransformerTable
            await deletePotentialTransformerTableByPotentialTransformerInfoId(entity.OldPotentialTransformerInfo.mrid, db);

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
        if (id == null || id === '') {
            return { success: false, error: new Error('Invalid ID') };
        } else {
            const entity = new VoltageTransformerEntity()
            const dataVt = await getAssetById(id);
            if (dataVt.success) {
                entity.asset = dataVt.data
                console.log('dataVt:', dataVt)
                const dataLifecycleDate = await getLifecycleDateById(entity.asset.lifecycle_date);
                if (dataLifecycleDate.success) {
                    entity.lifecycleDate = dataLifecycleDate.data;
                }


                const dataOldVtInfo = await getOldPotentialTransformerInfoById(entity.asset.asset_info);
                if (dataOldVtInfo.success) {
                    entity.OldPotentialTransformerInfo = dataOldVtInfo.data;
                }

                console.log('entity.OldPotentialTransformerInfo:', entity.OldPotentialTransformerInfo)

                const productAssetModelId = entity.asset.product_asset_model;

                const dataProductAssetModel = await getProductAssetModelById(productAssetModelId);

                if (dataProductAssetModel.success) {
                    entity.productAssetModel = dataProductAssetModel.data;
                }

                const dataAssetInfo = await getAssetInfoById(entity.asset.asset_info);
                if (dataAssetInfo.success) {
                    entity.assetInfo = dataAssetInfo.data;
                }

                const dataAssetPsr = await getAssetPsrByAssetIdAndPsrId(entity.asset.mrid, psrId);
                if (dataAssetPsr.success) {
                    entity.assetPsr = dataAssetPsr.data;
                }

                const dataAttachment = await getAttachmentByForeignIdAndType(entity.asset.mrid, 'asset');
                if (dataAttachment.success) {
                    entity.attachment = dataAttachment.data;
                }

                const dataVoltage = await getVoltageById(entity.OldPotentialTransformerInfo.rated_voltage);
                if (dataVoltage.success) {
                    entity.voltage.push(dataVoltage.data);
                }

                const dataFrequency = await getFrequencyById(entity.OldPotentialTransformerInfo.rated_frequency);
                if (dataFrequency.success) {
                    entity.frequency.push(dataFrequency.data);
                }

                const dataPotentialTransformerTable = await getPotentialTransformerTableByPotentialTransformerInfoId(entity.OldPotentialTransformerInfo.mrid);
                if (dataPotentialTransformerTable.success) {
                    entity.potentialTransformerTable = dataPotentialTransformerTable.data;
                }

                const arrVoltage = [];
                const arrApparentPower = [];
                entity.potentialTransformerTable.forEach(item => {
                    arrVoltage.push(item.usr_rated_voltage);
                    arrApparentPower.push(item.rated_burden);
                })
                const arrVoltageUnique = [...new Set(arrVoltage)];
                const arrApparentPowerUnique = [...new Set(arrApparentPower)];

                for (const voltage of arrVoltageUnique) {
                    const dataVoltage = await getVoltageById(voltage);
                    if (dataVoltage.success) {
                        entity.voltage.push(dataVoltage.data);
                    }
                }

                for (const apparentPower of arrApparentPowerUnique) {
                    const dataApparentPower = await getApparentPowerById(apparentPower);
                    if (dataApparentPower.success) {
                        entity.apparentPower.push(dataApparentPower.data);
                    }
                }

                console.log('entity.potentialTransformerTable:', entity.potentialTransformerTable)

                console.log('entity.voltage:', entity.voltage)
                console.log('entity.apparentPower:', entity.apparentPower)
                console.log('entity.frequency:', entity.frequency)

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

export const deleteVoltageTransformerEntity = async (data) => {
    console.log('start deleteVoltageTransformerEntity');
    try {
        if (!data.asset || !data.asset.mrid) {
            return { success: false, error: new Error('Invalid ID') };
        }

        try {
            await runAsync('BEGIN TRANSACTION');

            // Xóa attachment
            if (data.attachment && data.attachment.id) {
                const pathData = JSON.parse(data.attachment.path || '[]');
                if (Array.isArray(pathData) && pathData.length > 0) {
                    syncFilesWithDeletion(pathData, null, data.mrid);
                }
                await deleteAttachmentByIdTransaction(data.attachment.id, db);
            }



            // Xóa assetPsr
            if (data.assetPsr && data.assetPsr.mrid) {
                await deleteAssetPsrTransaction(data.assetPsr.mrid, db);
            }
            console.log('1');

            if (data.asset && data.asset.mrid) {
                await deleteAssetByIdTransaction(data.asset.mrid, db);
            }
            console.log('2');

            // Xóa productAssetModel
            if (data.productAssetModel && data.productAssetModel.mrid) {
                await deleteProductAssetModelByIdTransaction(data.productAssetModel.mrid, db);
            }
            console.log('3');

            // Xóa lifecycleDate
            if (data.lifecycleDate && data.lifecycleDate.mrid) {
                await deleteLifecycleDateByIdTransaction(data.lifecycleDate.mrid, db);
            }
            console.log('4');

            await deletePotentialTransformerTableByPotentialTransformerInfoId(data.OldPotentialTransformerInfo.mrid, db);
            console.log('5');
            // Xóa OldPotentialTransformerInfo
            if (data.OldPotentialTransformerInfo && data.OldPotentialTransformerInfo.mrid) {
                await deleteOldPotentialTransformerInfoTransaction(data.OldPotentialTransformerInfo.mrid, db);
            }
            console.log('6');
            // Collect voltage & apparentPower
            const arrVoltage = [];
            const arrApparentPower = [];

            if (Array.isArray(data.potentialTransformerTable)) {
                data.potentialTransformerTable.forEach(item => {
                    if (item.usr_rated_voltage) arrVoltage.push(item.usr_rated_voltage);
                    if (item.rated_burden) arrApparentPower.push(item.rated_burden);
                });
            }

            // Xóa voltage
            for (const voltage of arrVoltage) {
                if (voltage && voltage.mrid) {
                    await deleteVoltageByIdTransaction(voltage.mrid, db);
                }
            }

            // Xóa apparent power
            for (const apparentPower of arrApparentPower) {
                if (apparentPower && apparentPower.mrid) {
                    await deleteApparentPowerByIdTransaction(apparentPower.mrid, db);
                }
            }

            // Xóa frequency nếu có
            if (data.OldPotentialTransformerInfo
                && data.OldPotentialTransformerInfo.rated_frequency
                && data.OldPotentialTransformerInfo.rated_frequency.mrid) {
                await deleteFrequencyByIdTransaction(data.OldPotentialTransformerInfo.rated_frequency.mrid, db);
            }

            // Xóa voltage còn lại
            if (Array.isArray(data.voltage)) {
                for (const voltage of data.voltage) {
                    if (voltage && voltage.mrid) {
                        await deleteVoltageByIdTransaction(voltage.mrid, db);
                    }
                }
            }



            await runAsync('COMMIT');

            // Xóa thư mục theo mrid asset
            if (data.asset && data.asset.mrid) {
                deleteDirectory(null, data.asset.mrid);
            }

            return { success: true, message: 'Voltage Transformer entity deleted successfully' };

        } catch (error) {
            await runAsync('ROLLBACK');
            console.error('Error deleting Voltage Transformer entity:', error);
            return { success: false, error, message: 'Error deleting Voltage Transformer entity' };
        }

    } catch (error) {
        console.error('Error deleting Voltage Transformer entity:', error);
        return { success: false, error, message: 'Error deleting Voltage Transformer entity' };
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
