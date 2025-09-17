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
import { getAssetById, insertAssetTransaction } from '@/function/cim/asset';
import { getConcentricNeutralCableInfoById, insertConcentricNeutralCableInfoTransaction } from '@/function/cim/concentricNeutralCableInfo';
import { insertJointCableInfoTransaction } from '@/function/cim/jointCableInfo';
import { insertOldCableInfoTransaction } from '@/function/cim/oldCableInfo';
import { insertSheathVoltageLimiterTransaction } from '@/function/cim/sheathVoltageLimiter';
import { insertTerminalCableInfoTransaction } from '@/function/cim/terminalCableInfo';
import { insertSecondsTransaction } from '@/function/cim/seconds';
import PowerCableEntity from '@/views/Entity/PowerCable/index'


export const insertPowerCableEntity = async (old_entity, entity) => {
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

            //area
            const newAreaIds = entity.area.map(s => s.mrid).filter(id => id);
            const oldAreaIds = old_entity.area.map(s => s.mrid).filter(id => id);

            const toAddArea = entity.area.filter(s => s.mrid && !oldAreaIds.includes(s.mrid));
            const toDeleteArea = old_entity.area.filter(s => s.mrid && !newAreaIds.includes(s.mrid));
            const toUpdateArea = entity.area.filter(s => s.mrid && oldAreaIds.includes(s.mrid));
            for (const area of toAddArea) {
                await insertAreaTransaction(area, db);
            }
            for (const area of toUpdateArea) {
                await insertAreaTransaction(area, db);
            }
            console.log('Inserted area');

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

            //second
            const newSecondIds = entity.second.map(s => s.mrid).filter(id => id);
            const oldSecondIds = old_entity.second.map(s => s.mrid).filter(id => id);

            const toAddSecond = entity.second.filter(s => s.mrid && !oldSecondIds.includes(s.mrid));
            const toDeleteSecond = old_entity.second.filter(s => s.mrid && !newSecondIds.includes(s.mrid));
            const toUpdateSecond = entity.second.filter(s => s.mrid && oldSecondIds.includes(s.mrid));
            for (const second of toAddSecond) {
                await insertSecondsTransaction(second, db);
            }
            for (const second of toUpdateSecond) {
                await insertSecondsTransaction(second, db);
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

            //length
            const newLengthIds = entity.length.map(s => s.mrid).filter(id => id);
            const oldLengthIds = old_entity.length.map(s => s.mrid).filter(id => id);

            const toAddLength = entity.length.filter(s => s.mrid && !oldLengthIds.includes(s.mrid));
            const toDeleteLength = old_entity.length.filter(s => s.mrid && !newLengthIds.includes(s.mrid));
            const toUpdateLength = entity.length.filter(s => s.mrid && oldLengthIds.includes(s.mrid));
            for (const length of toAddLength) {
                await insertLengthTransaction(length, db);
            }
            for (const length of toUpdateLength) {
                await insertLengthTransaction(length, db);
            }
            console.log('Inserted length');

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

            //temperature
            const newTemperatureIds = entity.temperature.map(v => v.mrid).filter(id => id); // bỏ null/empty
            const oldTemperatureIds = old_entity.temperature.map(v => v.mrid).filter(id => id);

            const toAddTemperature = entity.temperature.filter(v => v.mrid && !oldTemperatureIds.includes(v.mrid));
            const toDeleteTemperature = old_entity.temperature.filter(v => v.mrid && !newTemperatureIds.includes(v.mrid));
            const toUpdateTemperature = entity.temperature.filter(v => v.mrid && oldTemperatureIds.includes(v.mrid));
            for (const temperature of toAddTemperature) {
                await insertTemperatureTransaction(temperature, db);
            }
            for (const temperature of toUpdateTemperature) {
                await insertTemperatureTransaction(temperature, db);
            }
            console.log('Inserted temperature');

            //concentricNeutralCableInfo
            await insertConcentricNeutralCableInfoTransaction(entity.concentricNeutral, db);
            console.log('Inserted concentricNeutralCableInfo');

            //jointCableInfo
            await insertJointCableInfoTransaction(entity.joint, db);
            console.log('Inserted jointCableInfo');

            //sheathVoltageLimiter
            // await insertSheathVoltageLimiterTransaction(entity.sheathVoltageLimiter, db);
            // console.log('Inserted sheathVoltageLimiter');

            //terminalCableInfo
            await insertTerminalCableInfoTransaction(entity.terminal, db);
            console.log('Inserted terminalCableInfo');

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
            return { success: true, data: entity, message: 'Power cable entity inserted successfully' };
        }
    } catch (error) {
        restoreFiles(null, null, entity.asset.mrid);
        deleteBackupFiles(null, entity.asset.mrid);
        console.error('Error retrieving Power Cable entity:', error);
        await runAsync('ROLLBACK');
        return { success: false, error, message: 'Error retrieving Power Cable entity' };
    }
}

export const getPowerCableEntity = async (id, psrId) => {
    try {
        if(id == null || id === '') {
            return { success: false, error: new Error('Invalid ID') };
        } else {
            const entity = new PowerCableEntity()
            const dataPowerCable = await getAssetById(id);
            if(dataPowerCable.success) {
                entity.asset = dataPowerCable.data
                const dataLifecycleDate = await getLifecycleDateById(entity.asset.lifecycle_date);
                if(dataLifecycleDate.success) {
                    entity.lifecycleDate = dataLifecycleDate.data;
                }
                const dataCencentricNeutralInfo = await getConcentricNeutralCableInfoById(entity.asset.asset_info);
                if(dataCencentricNeutralInfo.success) {
                    entity.concentricNeutral = dataCencentricNeutralInfo.data;
                }
                
                const productAssetModelId = entity.asset.product_asset_model;
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
                    message: 'Power Cable entity retrieved successfully'
                }
            } else {
                return { success: false, error: dataPowerCable.error, message: dataPowerCable.message };
            }
        }
    } catch (error) {
        console.error("Error retrieving Power Cable entity by ID:", error);
        return { success: false, error, message: 'Error retrieving Power Cable entity by ID' };
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