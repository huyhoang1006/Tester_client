import db from '../../datacontext/index'
import path from 'path'
import * as attachmentContext from '../../attachmentcontext/index'
import { uploadAttachmentTransaction, backupAllFilesInDir, deleteBackupFiles, restoreFiles, syncFilesWithDeletion, getAttachmentByForeignIdAndType, deleteAttachmentByIdTransaction, deleteDirectory } from '@/function/entity/attachment'
import { insertVoltageTransaction } from '@/function/cim/voltage';
import { insertCurrentFlowTransaction } from '@/function/cim/currentFlow';
import { insertLifecycleDateTransaction } from '@/function/cim/lifecycleDate';
import { insertProductAssetModelTransaction } from '@/function/cim/productAssetModel';
import { insertAssetPsrTransaction } from '@/function/entity/assetPsr'
import { insertFrequencyTransaction } from '@/function/cim/frequency';
import { insertAssetTransaction } from '@/function/cim/asset';
import { insertRotatingMachineInfoTransaction } from '@/function/cim/rotatingMachineInfo';



export const insertRotatingMachineEntity = async (old_entity, entity) => {
    try {
        if (entity.asset.mrid === null || entity.asset.mrid === '') {
            const result = {
                success: false,
                error: new Error("MRID is required for Rotating Machine Entity"),
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
                    error: new Error("MRID is required for Rotating Machine Entity"),
                    message: '',
                }
                return result;
            }
            await runAsync('BEGIN TRANSACTION');


            //current flow
            const newCurrentFlowIds = entity.currentFlow.map(s => s.mrid).filter(id => id);
            const oldCurrentFlowIds = old_entity.currentFlow.map(s => s.mrid).filter(id => id);

            const toAddCurrentFlow = entity.currentFlow.filter(s => s.mrid && !oldCurrentFlowIds.includes(s.mrid));
            const toDeleteCurrentFlow = old_entity.currentFlow.filter(s => s.mrid && !newCurrentFlowIds.includes(s.mrid));
            const toUpdateCurrentFlow = entity.currentFlow.filter(s => s.mrid && oldCurrentFlowIds.includes(s.mrid));
            for (const currentFlow of toAddCurrentFlow) {
                await insertCurrentFlowTransaction(currentFlow, db);
            }
            for (const currentFlow of toUpdateCurrentFlow) {
                await insertCurrentFlowTransaction(currentFlow, db);
            }
            console.log('Inserted current flow');


            //frequency
            const newFrequencyIds = entity.frequency.map(s => s.mrid).filter(id => id);
            const oldFrequencyIds = old_entity.frequency.map(s => s.mrid).filter(id => id);

            const toAddFrequency = entity.frequency.filter(s => s.mrid && !oldFrequencyIds.includes(s.mrid));
            const toDeleteFrequency = old_entity.frequency.filter(s => s.mrid && !newFrequencyIds.includes(s.mrid));
            const toUpdateFrequency = entity.frequency.filter(s => s.mrid && oldFrequencyIds.includes(s.mrid));
            for (const frequency of toAddFrequency) {
                await insertFrequencyTransaction(frequency, db);
            }
            for (const frequency of toUpdateFrequency) {
                await insertFrequencyTransaction(frequency, db);
            }
            console.log('Inserted frequency');

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
            console.log('Inserted voltage');

            await insertRotatingMachineInfoTransaction(entity.rotatingMachine, db);
            console.log('Inserted rotatingMachineInfo');

            //lifecycleDate
            await insertLifecycleDateTransaction(entity.lifecycleDate, db);
            console.log('Inserted lifecycleDate');

            //productAssetModel
            await insertProductAssetModelTransaction(entity.productAssetModel, db);
            console.log('Inserted productAssetModel');

            //asset
            await insertAssetTransaction(entity.asset, db);
            console.log('Inserted asset');

            //assetPsr
            await insertAssetPsrTransaction(entity.assetPsr, db);
            console.log('Inserted assetPsr');

            //attachment
            if (entity.attachment.id && Array.isArray(JSON.parse(entity.attachment.path))) {
                const pathData = JSON.parse(entity.attachment.path);
                const newPath = []
                for (let i = 0; i < pathData.length; i++) {
                    const namefile = path.basename(pathData[i].path);
                    pathData[i].path = path.join(attachmentContext.getAttachmentDir(), entity.asset.mrid, namefile);
                    newPath.push(pathData[i]);
                }
                entity.attachment.path = JSON.stringify(newPath);
                await uploadAttachmentTransaction(entity.attachment, db);
            }
            console.log('Inserted attachment');

            await runAsync('COMMIT');
            deleteBackupFiles(null, entity.asset.mrid);
            return { success: true, data: entity, message: 'Rotating machine entity inserted successfully' };
        }
    } catch (error) {
        restoreFiles(null, null, entity.asset.mrid);
        deleteBackupFiles(null, entity.asset.mrid);
        console.error('Error retrieving Rotating Machine entity:', error);
        await runAsync('ROLLBACK');
        return { success: false, error, message: 'Error retrieving Rotating Machine entity' };
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