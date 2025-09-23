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
import { insertApparentPowerTransaction } from '@/function/cim/apparentPower';



export const insertRotatingMachineEntity = async (entity) => {
    try {
        if (entity.asset.mrid === null || entity.asset.mrid === '') {
            return {
                success: false,
                error: new Error("MRID is required for Rotating Machine Entity"),
                message: '',
            };
        } else {
            backupAllFilesInDir(null, null, entity.asset.mrid);
            const syncResult = syncFilesWithDeletion(JSON.parse(entity.attachment.path), null, entity.asset.mrid);

            if (!syncResult.success) {
                restoreFiles(null, null, entity.asset.mrid);
                deleteBackupFiles(null, entity.asset.mrid);
                return {
                    success: false,
                    error: new Error("MRID is required for Rotating Machine Entity"),
                    message: '',
                };
            }
            await runAsync('BEGIN TRANSACTION');

            // current flow
            for (const currentFlow of entity.currentFlow) {
                if (currentFlow.mrid) {
                    await insertCurrentFlowTransaction(currentFlow, db);
                }
            }
            console.log('Inserted current flow');

            // frequency
            for (const frequency of entity.frequency) {
                if (frequency.mrid) {
                    await insertFrequencyTransaction(frequency, db);
                }
            }
            console.log('Inserted frequency');

            // voltage
            for (const voltage of entity.voltage) {
                if (voltage.mrid) {
                    await insertVoltageTransaction(voltage, db);
                }
            }
            console.log('Inserted voltage');

            // apparentPower
            for (const apparentPower of entity.apparentPower) {
                if (apparentPower.mrid) {
                    await insertApparentPowerTransaction(apparentPower, db);
                }
            }
            console.log('Inserted apparentPower');

            await insertRotatingMachineInfoTransaction(entity.rotatingMachine, db);
            console.log('Inserted rotatingMachineInfo');

            // lifecycleDate
            await insertLifecycleDateTransaction(entity.lifecycleDate, db);
            console.log('Inserted lifecycleDate');

            // productAssetModel
            await insertProductAssetModelTransaction(entity.productAssetModel, db);
            console.log('Inserted productAssetModel');

            // asset
            await insertAssetTransaction(entity.asset, db);
            console.log('Inserted asset');

            // assetPsr
            await insertAssetPsrTransaction(entity.assetPsr, db);
            console.log('Inserted assetPsr');

            // attachment
            if (entity.attachment.id && Array.isArray(JSON.parse(entity.attachment.path))) {
                const pathData = JSON.parse(entity.attachment.path);
                const newPath = [];
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