import db from '../../datacontext/index'
import path from 'path'
import * as attachmentContext from '../../attachmentcontext/index'
import { uploadAttachmentTransaction, backupAllFilesInDir, deleteBackupFiles, restoreFiles, syncFilesWithDeletion, getAttachmentByForeignIdAndType, deleteAttachmentByIdTransaction, deleteDirectory } from '@/function/entity/attachment'
import { insertVoltageTransaction, getVoltageById, deleteVoltageByIdTransaction } from '@/function/cim/voltage';
import { insertCurrentFlowTransaction, getCurrentFlowById, deleteCurrentFlowByIdTransaction } from '@/function/cim/currentFlow';
import { insertLifecycleDateTransaction, getLifecycleDateById, deleteLifecycleDateByIdTransaction } from '@/function/cim/lifecycleDate';
import { insertProductAssetModelTransaction, getProductAssetModelById, deleteProductAssetModelByIdTransaction } from '@/function/cim/productAssetModel';
import { insertAssetPsrTransaction, getAssetPsrById, getAssetPsrByAssetIdAndPsrId, deleteAssetPsrTransaction } from '@/function/entity/assetPsr'
import { insertLengthTransaction } from '@/function/cim/length'
import { insertAreaTransaction } from '@/function/cim/area';
import { insertFrequencyTransaction } from '@/function/cim/frequency';
import { insertTemperatureTransaction } from '@/function/cim/temperature';
import { insertAssetTransaction } from '@/function/cim/asset';
import { insertConcentricNeutralCableInfoTransaction } from '@/function/cim/concentricNeutralCableInfo';
import { insertJointCableInfoTransaction } from '@/function/cim/jointCableInfo';
import { insertOldCableInfoTransaction } from '@/function/cim/oldCableInfo';
import { insertSheathVoltageLimiterTransaction } from '@/function/cim/sheathVoltageLimiter';
import { insertTerminalCableInfoTransaction } from '@/function/cim/terminalCableInfo';



export const insertPowerCableEntity = async (old_entity, entity) => {
    console.log('Inserting Power Cable entity:', entity.asset.mrid);
    try {
        if (entity.asset.mrid === null || entity.asset.mrid === '') {
            const result = {
                success: false,
                error: new Error("MRID is required for Power Cable Entity"),
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
                    error: new Error("MRID is required for Power Cable Entity"),
                    message: '',
                }
                return result;
            }
            await runAsync('BEGIN TRANSACTION');

            //voltage

            for (const voltage of entity.voltage) {
                await insertVoltageTransaction(voltage, db);
            }

            console.log('Inserted voltages');

            //length
            for (const length of entity.length) {
                await insertLengthTransaction(length, db);
            }
            console.log('Inserted lengths');
            //area
            for (const area of entity.area) {
                await insertAreaTransaction(area, db);
            }
            console.log('Inserted areas');
            //frequency
            for (const frequency of entity.frequency) {
                await insertFrequencyTransaction(frequency, db);
            }
            console.log('Inserted frequencies');
            //temperature
            for (const temperature of entity.temperature) {
                await insertTemperatureTransaction(temperature, db);
            }
            console.log('Inserted temperatures');

            //currentFlow
            for (const currentFlow of entity.currentFlow) {
                await insertCurrentFlowTransaction(currentFlow, db);
            }
            console.log('Inserted currentFlows');

            //concentricNeutralCableInfo
            await insertConcentricNeutralCableInfoTransaction(entity.concentricNeutral, db);
            console.log('Inserted concentricNeutralCableInfo');

            //jointCableInfo
            await insertJointCableInfoTransaction(entity.jointCableInfo, db);
            console.log('Inserted jointCableInfo');

            //sheathVoltageLimiter
            await insertSheathVoltageLimiterTransaction(entity.sheathVoltageLimiter, db);
            console.log('Inserted sheathVoltageLimiter');

            //terminalCableInfo
            await insertTerminalCableInfoTransaction(entity.terminalCableInfo, db);
            console.log('Inserted terminalCableInfo');

            //jointCableInfo
            await insertJointCableInfoTransaction(entity.jointCableInfo, db);
            console.log('Inserted jointCableInfo');

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

            //oldCableInfo
            await insertOldCableInfoTransaction(entity.oldCableInfo, db);
            console.log('Inserted oldCableInfo');

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
            return { success: true, data: entity, message: 'Surge Arrester entity inserted successfully' };
        }
    } catch (error) {
        restoreFiles(null, null, entity.asset.mrid);
        deleteBackupFiles(null, entity.asset.mrid);
        console.error('Error retrieving Power Cable entity:', error);
        await runAsync('ROLLBACK');
        return { success: false, error, message: 'Error retrieving Power Cable entity' };
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