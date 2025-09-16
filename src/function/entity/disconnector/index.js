import db from '../../datacontext/index'
import { uploadAttachmentTransaction, backupAllFilesInDir, deleteBackupFiles, restoreFiles, syncFilesWithDeletion, getAttachmentByForeignIdAndType, deleteAttachmentByIdTransaction, deleteDirectory } from '@/function/entity/attachment'
import { insertVoltageTransaction, deleteVoltageByIdTransaction } from '@/function/cim/voltage';
import { insertSecondsTransaction, deleteSecondsByIdTransaction } from '@/function/cim/seconds';
import { insertCurrentFlowTransaction, deleteCurrentFlowByIdTransaction } from '@/function/cim/currentFlow';
import { getDisconnectorInfoById, insertDisconnectorInfoTransaction } from '@/function/cim/disconnectorInfo';
import DisconnectorEntity from '@/views/Entity/Disconnector';
import { insertAssetTransaction, getAssetById } from '@/function/cim/asset';
import {insertAssetPsrTransaction, getAssetPsrById, getAssetPsrByAssetIdAndPsrId, deleteAssetPsrTransaction} from '@/function/entity/assetPsr'
import {insertLifecycleDateTransaction, getLifecycleDateById, deleteLifecycleDateByIdTransaction} from '@/function/cim/lifecycleDate';
import {insertProductAssetModelTransaction, getProductAssetModelById, deleteProductAssetModelByIdTransaction} from '@/function/cim/productAssetModel';


export const insertDisconnectorEntity = async (entity) => {
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

            voltage
            for (const voltage of entity.voltage) {
                await insertVoltageTransaction(voltage, db);
            }

            second
            for (const seconds of entity.voltage) {
                await insertSecondsTransaction(seconds, db);
            }
           
            currentFlow
            for (const currentFlow of entity.currentFlow) {
                await insertCurrentFlowTransaction(currentFlow, db);
            }


            await insertLifecycleDateTransaction(entity.lifecycleDate, db);
            await insertProductAssetModelTransaction(entity.productAssetModel, db);
            await insertDisconnectorInfoTransaction(entity.disconnectorInfo, db);
            await insertAssetTransaction(entity.asset, db);
            await insertAssetPsrTransaction(entity.assetPsr, db);

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
                if(dataDisconnectorInfo.success) {
                    entity.disconnectorInfo = dataDisconnectorInfo.data;
                }
                
                const productAssetModelId = entity.disconnectorInfo.product_asset_model;
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
                    message: 'Disconnector entity retrieved successfully'
                }
            } else {
                return { success: false, error: dataDisconnector.error, message: dataDisconnector.message };
            }
        }
    } catch (error) {
        console.error("Error retrieving Disconnector entity by ID:", error);
        return { success: false, error, message: 'Error retrieving Disconnector entity by ID' };
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