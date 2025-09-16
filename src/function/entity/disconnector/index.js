import db from '../../datacontext/index'
import { backupAllFilesInDir, deleteBackupFiles, restoreFiles, syncFilesWithDeletion } from '@/function/entity/attachment'
import { insertVoltageTransaction, deleteVoltageByIdTransaction } from '@/function/cim/voltage';
import { insertSecondsTransaction, deleteSecondsByIdTransaction } from '@/function/cim/seconds';
import { insertCurrentFlowTransaction, deleteCurrentFlowByIdTransaction } from '@/function/cim/currentFlow';
import { getDisconnectorInfoById, insertDisconnectorInfoTransaction } from '@/function/cim/disconnectorInfo';
import DisconnectorEntity from '@/views/Entity/Disconnector';
import { getAssetById } from '@/function/cim/asset';


export const insertDisconnectorEntity = async (old_entity,entity) => {
    try {
        if(entity.asset.mrid === null || entity.asset.mrid === '') {
            const result = {
                success: false,
                error: new Error("MRID is required for Disconnector Entity"),
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
                    error: new Error("MRID is required for Disconnector Entity"),
                    message: '',
                }
                return result;
            }
            await runAsync('BEGIN TRANSACTION');
            //voltage
            console.log('start voltage' );
            const oldIds = (old_entity.voltage || []).map(v => v.mrid).filter(id => id);
            const toAdd = entity.voltage.filter(v => v.mrid && !oldIds.includes(v.mrid));
            const toUpdate = entity.voltage.filter(v => v.mrid && oldIds.includes(v.mrid));
            for (const voltage of toAdd) {
                await insertVoltageTransaction(voltage, db);
            }
            for (const voltage of toUpdate) {
                await insertVoltageTransaction(voltage, db);
            }
            console.log('voltage' );
            //seconds
            const oldSecondsIds = (old_entity.seconds || []).map(s => s.mrid).filter(id => id);
            const toAddSeconds = entity.seconds.filter(s => s.mrid && !oldSecondsIds.includes(s.mrid));
            const toUpdateSeconds = entity.seconds.filter(s => s.mrid && oldSecondsIds.includes(s.mrid));
            for (const seconds of toAddSeconds) {
                await insertSecondsTransaction(seconds, db);
            }
            for (const seconds of toUpdateSeconds) {
                await insertSecondsTransaction(seconds, db);
            }
            console.log('seconds' );
            //currentFlow
            const oldCurrentFlowIds = (old_entity.currentFlow || []).map(c => c.mrid).filter(id => id);
            const toAddCurrentFlow = entity.currentFlow.filter(c => c.mrid && !oldCurrentFlowIds.includes(c.mrid));
            const toUpdateCurrentFlow = entity.currentFlow.filter(c => c.mrid && oldCurrentFlowIds.includes(c.mrid));
            for (const currentFlow of toAddCurrentFlow) {
                await insertCurrentFlowTransaction(currentFlow, db);
            }
            for (const currentFlow of toUpdateCurrentFlow) {
                await insertCurrentFlowTransaction(currentFlow, db);
            }
            console.log('currentFlow' );
           //disconnectorInfo
           await insertDisconnectorInfoTransaction(entity.disconnectorInfo, db);
           console.log('disconnectorInfo' );
           await runAsync('COMMIT');
           return { success: true, data: entity, message: 'Insert disconnector entity completed' };

        }
    } catch (error) {
        restoreFiles(null, null, entity.asset.mrid);
        deleteBackupFiles(null, entity.asset.mrid);
        console.error('Error retrieving disconnector entity:', error);
        await runAsync('ROLLBACK');
        return { success: false, error, message: 'Error retrieving disconnector entity' };
    }
}


export const getDisconnectorEntityById = async (id, psrId) => {
    try {
        if(id == null || id === '') {
            return { success: false, error: new Error('Invalid ID') };
        } else {
            const entity = new DisconnectorEntity()
            const dataDisconnector = await getAssetById(id);
            if(dataDisconnector.success) {
                entity.asset = dataDisconnector.data
                const dataLifecycleDate = await getLifecycleDateById(entity.asset.lifecycle_date);
                if(dataLifecycleDate.success) {
                    entity.lifecycleDate = dataLifecycleDate.data;
                }
                const dataDisconnectorInfo = await getDisconnectorInfoById(entity.asset.asset_info);
                if(dataOldBushingInfo.success) {
                    entity.oldBushingInfo = dataOldBushingInfo.data;
                }
                
                const productAssetModelId = entity.oldBushingInfo.product_asset_model;
                const dataProductAssetModel = await getProductAssetModelById(productAssetModelId);
                if(dataProductAssetModel.success) {
                    entity.productAssetModel = dataProductAssetModel.data;
                }
                
                const dataAssetPsr = await getAssetPsrByAssetIdAndPsrId(entity.bushing.mrid, psrId);
                if(dataAssetPsr.success) {
                    entity.assetPsr = dataAssetPsr.data;
                }

                const dataAttachment = await getAttachmentByForeignIdAndType(entity.bushing.mrid, 'asset');
                if(dataAttachment.success) {
                    entity.attachment = dataAttachment.data;
                }

                return {
                    success: true,
                    data: entity,
                    message: 'Bushing entity retrieved successfully'
                }
            } else {
                return { success: false, error: dataBushing.error, message: dataBushing.message };
            }
        }
    } catch (error) {
        console.error("Error retrieving Bushing entity by ID:", error);
        return { success: false, error, message: 'Error retrieving Bushing entity by ID' };
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