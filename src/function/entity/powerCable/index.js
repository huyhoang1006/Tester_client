import db from '../../datacontext/index'
import path from 'path'
import * as attachmentContext from '../../attachmentcontext/index'
import { uploadAttachmentTransaction, backupAllFilesInDir, deleteBackupFiles, restoreFiles, syncFilesWithDeletion, getAttachmentByForeignIdAndType, deleteAttachmentByIdTransaction, deleteDirectory } from '@/function/entity/attachment'
import { insertVoltageTransaction, getVoltageById, deleteVoltageByIdTransaction, getVoltageByIds } from '@/function/cim/voltage';
import { insertCurrentFlowTransaction, getCurrentFlowByIds, deleteCurrentFlowByIdTransaction } from '@/function/cim/currentFlow';
import { insertLifecycleDateTransaction, getLifecycleDateById, deleteLifecycleDateByIdTransaction } from '@/function/cim/lifecycleDate';
import { insertProductAssetModelTransaction, getProductAssetModelById, deleteProductAssetModelByIdTransaction } from '@/function/cim/productAssetModel';
import { insertAssetPsrTransaction, getAssetPsrById, getAssetPsrByAssetIdAndPsrId, deleteAssetPsrTransaction } from '@/function/entity/assetPsr'
import { insertLengthTransaction, getLengthById, getLengthByIds, deleteLengthByIdTransaction } from '@/function/cim/length'
import { insertAreaTransaction, getAreaById, getAreaByIds, deleteAreaByIdTransaction } from '@/function/cim/area';
import { insertFrequencyTransaction, getFrequencyById, getFrequencyByIds, deleteFrequencyByIdTransaction } from '@/function/cim/frequency';
import { insertTemperatureTransaction, getTemperatureById, getTemperatureByIds, deleteTemperatureByIdTransaction } from '@/function/cim/temperature';
import { getAssetById, insertAssetTransaction, deleteAssetByIdTransaction } from '@/function/cim/asset';
import { getConcentricNeutralCableInfoById, insertConcentricNeutralCableInfoTransaction, deleteConcentricNeutralCableInfoTransaction } from '@/function/cim/concentricNeutralCableInfo';
import { insertJointCableInfoTransaction, getJointCableInfoById, getJointCableInfoByCableInfoId, deleteJointCableInfoById } from '@/function/cim/jointCableInfo';
import { insertOldCableInfoTransaction, getOldCableInfoById, getOldCableInfoByCableInfoId, deleteOldCableInfoTransaction } from '@/function/cim/oldCableInfo';
import { insertSheathVoltageLimiterTransaction, getSheathVoltageLimiterById, getSheathVoltageLimiterByCableInfoId, deleteSheathVoltageLimiterTransaction } from '@/function/cim/sheathVoltageLimiter';
import { insertTerminalCableInfoTransaction, getTerminalCableInfoById, getTerminalCableInfoByCableInfoId, deleteTerminalCableInfoTransaction } from '@/function/cim/terminalCableInfo';
import { insertSecondsTransaction, getSecondById, getSecondByIds, deleteSecondsByIdTransaction } from '@/function/cim/seconds';
import PowerCableEntity from '@/views/Flatten/PowerCable/index'

export const insertPowerCableEntity = async (old_entity, entity) => {
    try {
        if (entity.asset.mrid === null || entity.asset.mrid === '') {
            return {
                success: false,
                error: new Error("MRID is required for Power Cable Entity"),
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
                    error: new Error("MRID is required for Power Cable Entity"),
                    message: '',
                };
            }
            await runAsync('BEGIN TRANSACTION');

            //area
            const newAreaIds = entity.area.map(s => s.mrid).filter(id => id);
            const oldAreaIds = old_entity.area.map(s => s.mrid).filter(id => id);
            const toAddArea = entity.area.filter(s => s.mrid && !oldAreaIds.includes(s.mrid));
            const toDeleteArea = old_entity.area.filter(s => s.mrid && !newAreaIds.includes(s.mrid));
            const toUpdateArea = entity.area.filter(s => s.mrid && oldAreaIds.includes(s.mrid));
            for (const area of toAddArea) await insertAreaTransaction(area, db);
            for (const area of toUpdateArea) await insertAreaTransaction(area, db);
            for (const area of toDeleteArea) await deleteUnitSafely(deleteAreaByIdTransaction, area.mrid, db);

            //current flow
            const newCurrentFlowIds = entity.currentFlow.map(s => s.mrid).filter(id => id);
            const oldCurrentFlowIds = old_entity.currentFlow.map(s => s.mrid).filter(id => id);
            const toAddCurrentFlow = entity.currentFlow.filter(s => s.mrid && !oldCurrentFlowIds.includes(s.mrid));
            const toDeleteCurrentFlow = old_entity.currentFlow.filter(s => s.mrid && !newCurrentFlowIds.includes(s.mrid));
            const toUpdateCurrentFlow = entity.currentFlow.filter(s => s.mrid && oldCurrentFlowIds.includes(s.mrid));
            for (const item of toAddCurrentFlow) await insertCurrentFlowTransaction(item, db);
            for (const item of toUpdateCurrentFlow) await insertCurrentFlowTransaction(item, db);
            for (const item of toDeleteCurrentFlow) await deleteUnitSafely(deleteCurrentFlowByIdTransaction, item.mrid, db);

            //second
            const newSecondIds = entity.second.map(s => s.mrid).filter(id => id);
            const oldSecondIds = old_entity.second.map(s => s.mrid).filter(id => id);
            const toAddSecond = entity.second.filter(s => s.mrid && !oldSecondIds.includes(s.mrid));
            const toDeleteSecond = old_entity.second.filter(s => s.mrid && !newSecondIds.includes(s.mrid));
            const toUpdateSecond = entity.second.filter(s => s.mrid && oldSecondIds.includes(s.mrid));
            for (const item of toAddSecond) await insertSecondsTransaction(item, db);
            for (const item of toUpdateSecond) await insertSecondsTransaction(item, db);
            for (const item of toDeleteSecond) await deleteUnitSafely(deleteSecondsByIdTransaction, item.mrid, db);

            //frequency
            const newFrequencyIds = entity.frequency.map(s => s.mrid).filter(id => id);
            const oldFrequencyIds = old_entity.frequency.map(s => s.mrid).filter(id => id);
            const toAddFrequency = entity.frequency.filter(s => s.mrid && !oldFrequencyIds.includes(s.mrid));
            const toDeleteFrequency = old_entity.frequency.filter(s => s.mrid && !newFrequencyIds.includes(s.mrid));
            const toUpdateFrequency = entity.frequency.filter(s => s.mrid && oldFrequencyIds.includes(s.mrid));
            for (const item of toAddFrequency) await insertFrequencyTransaction(item, db);
            for (const item of toUpdateFrequency) await insertFrequencyTransaction(item, db);
            for (const item of toDeleteFrequency) await deleteUnitSafely(deleteFrequencyByIdTransaction, item.mrid, db);

            //length
            const newLengthIds = entity.length.map(s => s.mrid).filter(id => id);
            const oldLengthIds = old_entity.length.map(s => s.mrid).filter(id => id);
            const toAddLength = entity.length.filter(s => s.mrid && !oldLengthIds.includes(s.mrid));
            const toDeleteLength = old_entity.length.filter(s => s.mrid && !newLengthIds.includes(s.mrid));
            const toUpdateLength = entity.length.filter(s => s.mrid && oldLengthIds.includes(s.mrid));
            for (const item of toAddLength) await insertLengthTransaction(item, db);
            for (const item of toUpdateLength) await insertLengthTransaction(item, db);
            for (const item of toDeleteLength) await deleteUnitSafely(deleteLengthByIdTransaction, item.mrid, db);

            //voltage
            const newIds = entity.voltage.map(v => v.mrid).filter(id => id);
            const oldIds = old_entity.voltage.map(v => v.mrid).filter(id => id);
            const toAdd = entity.voltage.filter(v => v.mrid && !oldIds.includes(v.mrid));
            const toDelete = old_entity.voltage.filter(v => v.mrid && !newIds.includes(v.mrid));
            const toUpdate = entity.voltage.filter(v => v.mrid && oldIds.includes(v.mrid));
            for (const item of toAdd) await insertVoltageTransaction(item, db);
            for (const item of toUpdate) await insertVoltageTransaction(item, db);
            for (const item of toDelete) await deleteUnitSafely(deleteVoltageByIdTransaction, item.mrid, db);

            //temperature
            const newTemperatureIds = entity.temperature.map(v => v.mrid).filter(id => id);
            const oldTemperatureIds = old_entity.temperature.map(v => v.mrid).filter(id => id);
            const toAddTemperature = entity.temperature.filter(v => v.mrid && !oldTemperatureIds.includes(v.mrid));
            const toDeleteTemperature = old_entity.temperature.filter(v => v.mrid && !newTemperatureIds.includes(v.mrid));
            const toUpdateTemperature = entity.temperature.filter(v => v.mrid && oldTemperatureIds.includes(v.mrid));
            for (const item of toAddTemperature) await insertTemperatureTransaction(item, db);
            for (const item of toUpdateTemperature) await insertTemperatureTransaction(item, db);
            for (const item of toDeleteTemperature) await deleteUnitSafely(deleteTemperatureByIdTransaction, item.mrid, db);

            // Other components
            await insertConcentricNeutralCableInfoTransaction(entity.concentricNeutral, db);
            await insertJointCableInfoTransaction(entity.joint, db);
            await insertSheathVoltageLimiterTransaction(entity.sheathVoltageLimiter, db);
            await insertTerminalCableInfoTransaction(entity.terminal, db);
            await insertLifecycleDateTransaction(entity.lifecycleDate, db);
            await insertProductAssetModelTransaction(entity.productAssetModel, db);
            await insertAssetTransaction(entity.asset, db);
            await insertAssetPsrTransaction(entity.assetPsr, db);
            await insertOldCableInfoTransaction(entity.oldCableInfo, db);

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
        if (id == null || id === '') {
            return { success: false, error: new Error('Invalid ID') };
        } else {
            const entity = new PowerCableEntity()
            const dataPowerCable = await getAssetById(id);
            if (dataPowerCable.success) {
                entity.asset = dataPowerCable.data
                const dataLifecycleDate = await getLifecycleDateById(entity.asset.lifecycle_date);
                if (dataLifecycleDate.success) {
                    entity.lifecycleDate = dataLifecycleDate.data;
                }
                const dataCencentricNeutralInfo = await getConcentricNeutralCableInfoById(entity.asset.asset_info);
                if (dataCencentricNeutralInfo.success) {
                    entity.concentricNeutral = dataCencentricNeutralInfo.data;
                }

                const productAssetModelId = entity.asset.product_asset_model;
                const dataProductAssetModel = await getProductAssetModelById(productAssetModelId);
                if (dataProductAssetModel.success) {
                    entity.productAssetModel = dataProductAssetModel.data;
                }

                const dataAssetPsr = await getAssetPsrByAssetIdAndPsrId(entity.asset.mrid, psrId);
                if (dataAssetPsr.success) {
                    entity.assetPsr = dataAssetPsr.data;
                }

                const dataAttachment = await getAttachmentByForeignIdAndType(entity.asset.mrid, 'asset');
                if (dataAttachment.success) {
                    entity.attachment = dataAttachment.data;
                }

                const dataOldCableInfo = await getOldCableInfoByCableInfoId(entity.concentricNeutral.mrid);
                if (dataOldCableInfo.success) {
                    entity.oldCableInfo = dataOldCableInfo.data;
                }

                const dataJointInfo = await getJointCableInfoByCableInfoId(entity.concentricNeutral.mrid);
                if (dataJointInfo.success) {
                    entity.joint = dataJointInfo.data;
                }

                const terminalCableInfo = await getTerminalCableInfoByCableInfoId(entity.concentricNeutral.mrid);
                if (terminalCableInfo.success) {
                    entity.terminal = terminalCableInfo.data;
                }

                const sheathVoltageLimiter = await getSheathVoltageLimiterByCableInfoId(entity.concentricNeutral.mrid);
                if (sheathVoltageLimiter.success) {
                    entity.sheathVoltageLimiter = sheathVoltageLimiter.data;
                }

                const joint_cable_info_arr = {
                    currentFlow: ['rated_current'],
                    voltage: ['rated_u']
                }
                const terminal_cable_info_arr = {
                    voltage: ['rated_u', 'bil', 'bsl'],
                }
                const sheath_voltage_limiter_arr = {
                    currentFlow: ['nominal_discharge_current', 'high_current_impulse_withstand', 'long_duration_current_impulse_withstand', 'short_circuit_withstand'],
                    voltage: ['rated_voltage_ur', 'max_continuous_operating_voltage']
                }
                const oldCableInfoArr = {
                    voltage: ["rated_u", "max_u"],
                    currentFlow: ["short_circuit_current"],
                    second: ["rated_duration_short_circuit"],
                    temperature: ["insulation_max_operating_temp"],
                    area: ["conductor_size", "armour_cross_sectional_area_tap", "concentric_area"],
                    frequency: ["rated_frequency"],
                    length: [
                        "armour_bedding_thickness", "armour_thickness", "concentric_length_lay", "concentric_thickness",
                        "conductor_shield_thickness", "nominal_conductor_diameter", "diameter_over_shield", "diameter_over_sheath",
                        "diameter_over_armour", "diameter_bedding_over_armour", "diameter_over_sheath_reinforcing", "sheath_thickness",
                        "sheath_reinforcing_thickness", "sheath_reinforcing_length_lay", "sheath_reinforcing_width", "jacket_thickness",
                        "screen_thickness", "length"
                    ]
                };
                const concentricNeutral = {
                    length: ['insulation_thickness', 'diameter_over_insulation', 'diameter_over_screen', 'diameter_over_neutral', 'diameter_over_jacket'],
                }

                const dataDB = [joint_cable_info_arr, terminal_cable_info_arr, sheath_voltage_limiter_arr, concentricNeutral, oldCableInfoArr]
                const entityDB = ['joint', 'terminal', 'sheathVoltageLimiter', 'concentricNeutral', 'oldCableInfo']

                const voltage = [], currentFlow = [], second = [], temperature = [], area = [], frequency = [], length = [];

                for (const i in dataDB) {
                    const item = dataDB[i];
                    for (const key in item) {
                        for (const field of item[key]) {
                            const val = entity[entityDB[i]][field];
                            if (val != null) {
                                if (key === 'voltage') voltage.push(val);
                                else if (key === 'currentFlow') currentFlow.push(val);
                                else if (key === 'second') second.push(val);
                                else if (key === 'temperature') temperature.push(val);
                                else if (key === 'area') area.push(val);
                                else if (key === 'frequency') frequency.push(val);
                                else if (key === 'length') length.push(val);
                            }
                        }
                    }
                }

                const dataVoltage = await getVoltageByIds(voltage);
                if (dataVoltage.success) entity.voltage = dataVoltage.data;

                const dataCurrentFlow = await getCurrentFlowByIds(currentFlow);
                if (dataCurrentFlow.success) entity.currentFlow = dataCurrentFlow.data;

                const dataSecond = await getSecondByIds(second);
                if (dataSecond.success) entity.second = dataSecond.data;

                const dataTemperature = await getTemperatureByIds(temperature);
                if (dataTemperature.success) entity.temperature = dataTemperature.data;

                const dataArea = await getAreaByIds(area);
                if (dataArea.success) entity.area = dataArea.data;

                const dataFrequency = await getFrequencyByIds(frequency);
                if (dataFrequency.success) entity.frequency = dataFrequency.data;

                const dataLength = await getLengthByIds(length);
                if (dataLength.success) entity.length = dataLength.data;

                return { success: true, data: entity, message: 'Power Cable entity retrieved successfully' }
            } else {
                return { success: false, error: dataPowerCable.error, message: dataPowerCable.message };
            }
        }
    } catch (error) {
        console.error("Error retrieving Power Cable entity by ID:", error);
        return { success: false, error, message: 'Error retrieving Power Cable entity by ID' };
    }
}

export const deletePowerCableEntity = async (entity) => {
    try {
        await runAsync('BEGIN TRANSACTION');

        // Xóa attachment trước
        if (entity.attachment && entity.attachment.id) {
            const pathData = JSON.parse(entity.attachment.path || '[]')
            if (Array.isArray(pathData) && pathData.length > 0) {
                syncFilesWithDeletion(pathData, null, entity.asset.mrid);
            }
        }

        // Xóa các bảng cha/bảng quan hệ trước (để nhả khóa ngoại)
        if (entity.oldCableInfo && entity.oldCableInfo.mrid) await deleteOldCableInfoTransaction(entity.oldCableInfo.mrid, db);
        if (entity.assetPsr && entity.assetPsr.mrid) await deleteAssetPsrTransaction(entity.assetPsr.mrid, db);
        if (entity.asset && entity.asset.mrid) await deleteAssetByIdTransaction(entity.asset.mrid, db);
        if (entity.productAssetModel && entity.productAssetModel.mrid) await deleteProductAssetModelByIdTransaction(entity.productAssetModel.mrid, db);
        if (entity.lifecycleDate && entity.lifecycleDate.mrid) await deleteLifecycleDateByIdTransaction(entity.lifecycleDate.mrid, db);
        if (entity.terminal && entity.terminal.mrid) await deleteTerminalCableInfoTransaction(entity.terminal.mrid, db);
        if (entity.sheathVoltageLimiter && entity.sheathVoltageLimiter.mrid) await deleteSheathVoltageLimiterTransaction(entity.sheathVoltageLimiter.mrid, db);
        if (entity.joint && entity.joint.mrid) await deleteJointCableInfoById(entity.joint.mrid, db);
        if (entity.concentricNeutral && entity.concentricNeutral.mrid) await deleteConcentricNeutralCableInfoTransaction(entity.concentricNeutral.mrid, db);

        // Xóa các Unit (Voltage, Length...) - Sử dụng hàm deleteUnitSafely để bỏ qua lỗi Constraint
        for (const item of entity.temperature || []) await deleteUnitSafely(deleteTemperatureByIdTransaction, item.mrid, db);
        for (const item of entity.voltage || []) await deleteUnitSafely(deleteVoltageByIdTransaction, item.mrid, db);
        for (const item of entity.length || []) await deleteUnitSafely(deleteLengthByIdTransaction, item.mrid, db);
        for (const item of entity.frequency || []) await deleteUnitSafely(deleteFrequencyByIdTransaction, item.mrid, db);
        for (const item of entity.second || []) await deleteUnitSafely(deleteSecondsByIdTransaction, item.mrid, db);
        for (const item of entity.currentFlow || []) await deleteUnitSafely(deleteCurrentFlowByIdTransaction, item.mrid, db);
        for (const item of entity.area || []) await deleteUnitSafely(deleteAreaByIdTransaction, item.mrid, db);

        await runAsync('COMMIT');
        return { success: true, message: 'Power cable entity deleted successfully' };
    } catch (error) {
        await runAsync('ROLLBACK');
        console.error('Delete Power Cable Error:', error);
        return { success: false, error, message: 'Error deleting Power Cable entity' };
    }
}

// Hàm hỗ trợ xóa an toàn: Bỏ qua lỗi SQLITE_CONSTRAINT (do đang được dùng bởi bảng khác)
const deleteUnitSafely = async (deleteFunc, id, dbsql) => {
    if (!id) return;
    try {
        await deleteFunc(id, dbsql);
    } catch (error) {
        // Kiểm tra lỗi Constraint (SQLite error 19)
        // Cấu trúc lỗi có thể nằm trực tiếp ở error hoặc error.err hoặc error.error
        const isConstraintError = (errObj) => {
            return errObj && (errObj.code === 'SQLITE_CONSTRAINT' || errObj.errno === 19);
        };

        if (isConstraintError(error) || isConstraintError(error.err) || isConstraintError(error.error)) {
            // Constraint violation -> Bỏ qua, không ném lỗi
            return;
        }

        // Nếu không phải lỗi constraint thì ném ra ngoài
        throw error;
    }
};

const runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        const execute = (retries = 5) => {
            db.run(sql, params, function (err) {
                if (err) {
                    if (err.code === 'SQLITE_BUSY' && retries > 0) {
                        setTimeout(() => execute(retries - 1), 100);
                    } else {
                        reject(err);
                    }
                } else {
                    resolve();
                }
            });
        };
        execute();
    });
};