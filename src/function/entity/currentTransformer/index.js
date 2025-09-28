import db from "@/function/datacontext/index";
import { backupAllFilesInDir, syncFilesWithDeletion, restoreFiles, deleteBackupFiles } from "@/function/entity/attachment";
import { insertProductAssetModelTransaction, getProductAssetModelById, deleteProductAssetModelByIdTransaction } from "@/function/cim/productAssetModel";
import { insertOldCurrentTransformerInfoTransaction, getOldCurrentTransformerInfoById, deleteOldCurrentTransformerInfoByIdTransaction } from "@/function/cim/oldCurrentTransformerInfo";
import { insertVoltageTransaction, getVoltageById, deleteVoltageByIdTransaction } from "@/function/cim/voltage";
import { insertCurrentFlowTransaction, getCurrentFlowById, deleteCurrentFlowByIdTransaction } from "@/function/cim/currentFlow";
import { insertSecondsTransaction, getSecondById, deleteSecondsByIdTransaction } from "@/function/cim/seconds";
import { insertFrequencyTransaction, getFrequencyById, deleteFrequencyByIdTransaction } from "@/function/cim/frequency";
import { insertResistanceTransaction, getResistanceById, deleteResistanceByIdTransaction } from "@/function/cim/resistance";
import { insertPercentTransaction, getPercentById, deletePercentByIdTransaction } from "@/function/cim/percent";
import { insertApparentPowerTransaction, getApparentPowerById, deleteApparentPowerByIdTransaction } from "@/function/cim/apparentPower";
import { insertTemperatureTransaction, getTemperatureById, deleteTemperatureByIdTransaction } from "@/function/cim/temperature";
import { insertCtCoreInfoTransaction, getCtCoreInfoById, deleteCtCoreInfoByCurrentTransformerInfoIdTransaction } from "@/function/cim/ctCoreInfo";
import { insertCtTapInfoTransaction, getCtTapInfoById, deleteCtTapInfoByCtCoreInfoIdTransaction } from "@/function/cim/ctTapInfo";
import { insertAssetTransaction, getAssetById, deleteAssetByIdTransaction } from "@/function/cim/asset";
import { insertAssetPsrTransaction, getAssetPsrById, deleteAssetPsrByIdTransaction, getAssetPsrByAssetIdAndPsrId } from "@/function/entity/assetPsr";
import { insertLifecycleDateTransaction, getLifecycleDateById, deleteLifecycleDateByIdTransaction } from "@/function/cim/lifecycleDate";
import CurrentTransformerEntity from "@/views/Entity/CurrentTransformer";
import { getAssetInfoById } from "@/function/cim/assetInfo";
import { getAttachmentByForeignIdAndType } from "@/function/entity/attachment";


export const insertCurrentTransformerEntity = async (old_entity, entity) => {

    try {
        if (entity.asset.mrid === null || entity.asset.mrid === '') {
            const result = {
                success: false,
                error: new Error("MRID is required for Current Transformer Entity"),
                message: '',
            }
            return result;
        } else {
            backupAllFilesInDir(null, null, entity.oldCurrentTransformerInfo.mrid);
            const syncResult = syncFilesWithDeletion(JSON.parse(entity.attachment.path), null, entity.oldCurrentTransformerInfo.mrid);
            if (!syncResult.success) {
                restoreFiles(null, null, entity.oldCurrentTransformerInfo.mrid);
                deleteBackupFiles(null, entity.oldCurrentTransformerInfo.mrid);
                const result = {
                    success: false,
                    error: new Error("MRID is required for Current Transformer Entity"),
                    message: '',
                }
                return result;
            }
        }
        await runAsync('BEGIN TRANSACTION');
        //voltage
        const newVoltageIds = (entity.voltage || []).map(v => v.mrid).filter(id => id);
        const oldVoltageIds = (old_entity.voltage || []).map(v => v.mrid).filter(id => id);
        const toAddVoltage = (entity.voltage || []).filter(v => v.mrid && !oldVoltageIds.includes(v.mrid));
        const toDeleteVoltage = (old_entity.voltage || []).filter(v => v.mrid && !newVoltageIds.includes(v.mrid));
        const toUpdateVoltage = (entity.voltage || []).filter(v => v.mrid && oldVoltageIds.includes(v.mrid));
        for (const voltage of toAddVoltage) {
            await insertVoltageTransaction(voltage, db);
        }
        for (const voltage of toUpdateVoltage) {
            await insertVoltageTransaction(voltage, db);
        }
        console.log('voltage')
        //currentFlow
        const newCurrentFlowIds = (entity.currentFlow || []).map(c => c.mrid).filter(id => id);
        const oldCurrentFlowIds = (old_entity.currentFlow || []).map(c => c.mrid).filter(id => id);
        const toAddCurrentFlow = (entity.currentFlow || []).filter(c => c.mrid && !oldCurrentFlowIds.includes(c.mrid));
        const toDeleteCurrentFlow = (old_entity.currentFlow || []).filter(c => c.mrid && !newCurrentFlowIds.includes(c.mrid));
        const toUpdateCurrentFlow = (entity.currentFlow || []).filter(c => c.mrid && oldCurrentFlowIds.includes(c.mrid));
        for (const currentFlow of toAddCurrentFlow) {
            await insertCurrentFlowTransaction(currentFlow, db);
        }
        for (const currentFlow of toUpdateCurrentFlow) {
            await insertCurrentFlowTransaction(currentFlow, db);
        }
        console.log('currentFlow')
        //seconds
        const newSecondsIds = (entity.seconds || []).map(s => s.mrid).filter(id => id);
        const oldSecondsIds = (old_entity.seconds || []).map(s => s.mrid).filter(id => id);
        const toAddSeconds = (entity.seconds || []).filter(s => s.mrid && !oldSecondsIds.includes(s.mrid));
        const toDeleteSeconds = (old_entity.seconds || []).filter(s => s.mrid && !newSecondsIds.includes(s.mrid));
        const toUpdateSeconds = (entity.seconds || []).filter(s => s.mrid && oldSecondsIds.includes(s.mrid));
        for (const seconds of toAddSeconds) {
            await insertSecondsTransaction(seconds, db);
        }
        for (const seconds of toUpdateSeconds) {
            await insertSecondsTransaction(seconds, db);
        }
        console.log('seconds')
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
        //resistance
        const newResistanceIds = (entity.resistance || []).map(r => r.mrid).filter(id => id);
        const oldResistanceIds = (old_entity.resistance || []).map(r => r.mrid).filter(id => id);
        const toAddResistance = (entity.resistance || []).filter(r => r.mrid && !oldResistanceIds.includes(r.mrid));
        const toDeleteResistance = (old_entity.resistance || []).filter(r => r.mrid && !newResistanceIds.includes(r.mrid));
        const toUpdateResistance = (entity.resistance || []).filter(r => r.mrid && oldResistanceIds.includes(r.mrid));
        for (const resistance of toAddResistance) {
            await insertResistanceTransaction(resistance, db);
        }
        for (const resistance of toUpdateResistance) {
            await insertResistanceTransaction(resistance, db);
        }
        console.log('resistance')
        //percent
        const newPercentIds = (entity.percent || []).map(p => p.mrid).filter(id => id);
        const oldPercentIds = (old_entity.percent || []).map(p => p.mrid).filter(id => id);
        const toAddPercent = (entity.percent || []).filter(p => p.mrid && !oldPercentIds.includes(p.mrid));
        const toDeletePercent = (old_entity.percent || []).filter(p => p.mrid && !newPercentIds.includes(p.mrid));
        const toUpdatePercent = (entity.percent || []).filter(p => p.mrid && oldPercentIds.includes(p.mrid));
        for (const percent of toAddPercent) {
            await insertPercentTransaction(percent, db);
        }
        for (const percent of toUpdatePercent) {
            await insertPercentTransaction(percent, db);
        }
        console.log('percent')
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
        //temperature
        const newTemperatureIds = (entity.temperature || []).map(t => t.mrid).filter(id => id);
        const oldTemperatureIds = (old_entity.temperature || []).map(t => t.mrid).filter(id => id);
        const toAddTemperature = (entity.temperature || []).filter(t => t.mrid && !oldTemperatureIds.includes(t.mrid));
        const toDeleteTemperature = (old_entity.temperature || []).filter(t => t.mrid && !newTemperatureIds.includes(t.mrid));
        const toUpdateTemperature = (entity.temperature || []).filter(t => t.mrid && oldTemperatureIds.includes(t.mrid));
        for (const temperature of toAddTemperature) {
            await insertTemperatureTransaction(temperature, db);
        }
        for (const temperature of toUpdateTemperature) {
            await insertTemperatureTransaction(temperature, db);
        }
        console.log('temperature')

        //productAssetModel
        const productAssetModelResult = await insertProductAssetModelTransaction(entity.productAssetModel, db);
        console.log("product assetmodel inserted successfully")

        //oldCurrentTransformerInfo
        await insertOldCurrentTransformerInfoTransaction(entity.oldCurrentTransformerInfo, db);
        console.log("old current transformer info inserted successfully")

        // Sửa lỗi logic xóa
        if (old_entity.CtCoreInfo && old_entity.CtCoreInfo.length > 0) {
            // 1. Xóa tất cả các CtTapInfo cũ liên quan đến từng core cũ
            for (const core of old_entity.CtCoreInfo) {
                if (core.mrid) {
                    await deleteCtTapInfoByCtCoreInfoIdTransaction(core.mrid, db);
                }
            }

            // 2. Xóa tất cả các CtCoreInfo cũ dựa trên current_transformer_info_id
            const currentTransformerInfoId = old_entity.oldCurrentTransformerInfo.mrid;
            if (currentTransformerInfoId) {
                await deleteCtCoreInfoByCurrentTransformerInfoIdTransaction(currentTransformerInfoId, db);
            }
        }
        console.log("old ct core info deleted successfully")

        //CtCoreInfo
        console.log("ct core info : ", entity.CtCoreInfo)
        for (const ctCoreInfo of entity.CtCoreInfo) {
            await insertCtCoreInfoTransaction(ctCoreInfo, db);
        }
        console.log("ct core info inserted successfully")

        //CtTapInfo
        console.log("ct tap info : ", entity.CtTapInfo)
        for (const ctTapInfo of entity.CtTapInfo) {
            await insertCtTapInfoTransaction(ctTapInfo, db);
        }
        //lifecycleDate
        await insertLifecycleDateTransaction(entity.lifecycleDate, db);

        //asset
        await insertAssetTransaction(entity.asset, db);
        //assetPsr
        await insertAssetPsrTransaction(entity.assetPsr, db);
        await runAsync('COMMIT');
        deleteBackupFiles(null, entity.oldCurrentTransformerInfo.mrid);
        return { success: true, data: entity, message: 'Current Transformer entity inserted successfully' };


    } catch (error) {
        restoreFiles(null, null, entity.oldCurrentTransformerInfo.mrid);
        deleteBackupFiles(null, entity.oldCurrentTransformerInfo.mrid);
        console.error('Error retrieving current transformer entity:', error);
        await runAsync('ROLLBACK');
        return { success: false, error, message: 'Error retrieving current transformer entity' };
    }
}

export const getCurrentTransformerEntityById = async (id, psrId) => {
    try {
        if (id == null || id === '') {
            return { success: false, error: new Error('Invalid ID') };
        } else {
            const entity = new CurrentTransformerEntity()
            const dataCurrentTransformer = await getAssetById(id)
            if (dataCurrentTransformer.success) {
                entity.asset = dataCurrentTransformer.data
                console.log('dataCurrentTransformer:', dataCurrentTransformer)
                const dataLifecycleDate = await getLifecycleDateById(entity.asset.lifecycle_date)
                if (dataLifecycleDate.success) {
                    entity.lifecycleDate = dataLifecycleDate.data
                }
                const dataOldCurrentTransformerInfo = await getOldCurrentTransformerInfoById(entity.asset.asset_info)
                if (dataOldCurrentTransformerInfo.success) {
                    entity.oldCurrentTransformerInfo = dataOldCurrentTransformerInfo.data
                }

                const productAssetModelId = entity.asset.product_asset_model

                const dataProductAssetModel = await getProductAssetModelById(productAssetModelId)
                if (dataProductAssetModel.success) {
                    entity.productAssetModel = dataProductAssetModel.data
                }

                const dataAssetInfo = await getAssetInfoById(entity.asset.asset_info)
                if (dataAssetInfo.success) {
                    entity.assetInfo = dataAssetInfo.data
                }

                const dataAssetPsr = await getAssetPsrByAssetIdAndPsrId(entity.asset.mrid, psrId);
                if (dataAssetPsr.success) {
                    entity.assetPsr = dataAssetPsr.data;
                }

                const dataAttachment = await getAttachmentByForeignIdAndType(entity.asset.mrid, 'asset');
                if (dataAttachment.success) {
                    entity.attachment = dataAttachment.data;
                }

                

                return {
                    success: true,
                    data: entity,
                    message: 'Current Transformer entity retrieved successfully'
                }

            } else {
                return { success: false, error: dataCurrentTransformer.error, message: dataCurrentTransformer.message };
            }
        }

    } catch (error) {
        console.error("Error retrieving Current Transformer entity by ID:", error);
        return { success: false, error, message: 'Error retrieving Current Transformer entity by ID' };
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
