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
            await insertSheathVoltageLimiterTransaction(entity.sheathVoltageLimiter, db);
            console.log('Inserted sheathVoltageLimiter');

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
                    voltage: [
                        "rated_u",
                        "max_u"
                    ],
                    currentFlow: [
                        "short_circuit_current"
                    ],
                    second: [
                        "rated_duration_short_circuit"
                    ],
                    temperature: [
                        "insulation_max_operating_temp"
                    ],
                    area: [
                        "conductor_size",
                        "armour_cross_sectional_area_tap",
                        "concentric_area"
                    ],
                    frequency: [
                        "rated_frequency"
                    ],
                    length: [
                        "armour_bedding_thickness",
                        "armour_thickness",
                        "concentric_length_lay",
                        "concentric_thickness",
                        "conductor_shield_thickness",
                        "nominal_conductor_diameter",
                        "diameter_over_shield",
                        "diameter_over_sheath",
                        "diameter_over_armour",
                        "diameter_bedding_over_armour",
                        "diameter_over_sheath_reinforcing",
                        "sheath_thickness",
                        "sheath_reinforcing_thickness",
                        "sheath_reinforcing_length_lay",
                        "sheath_reinforcing_width",
                        "jacket_thickness",
                        "screen_thickness",
                        "length"
                    ]
                };
                const concentricNeutral = {
                    length: [
                        'insulation_thickness',
                        'diameter_over_insulation',
                        'diameter_over_screen',
                        'diameter_over_neutral',
                        'diameter_over_jacket'
                    ],
                }

                const dataDB = [joint_cable_info_arr, terminal_cable_info_arr, sheath_voltage_limiter_arr, concentricNeutral, oldCableInfoArr]
                const entityDB = ['joint', 'terminal', 'sheathVoltageLimiter', 'concentricNeutral', 'oldCableInfo']

                const voltage = [];
                const currentFlow = [];
                const second = [];
                const temperature = [];
                const area = [];
                const frequency = [];
                const length = [];

                for (const i in dataDB) {
                    const item = dataDB[i];
                    for (const key in item) {
                        for (const field of item[key]) {
                            if (key === 'voltage') {
                                if (entity[entityDB[i]][field] != null) {
                                    voltage.push(entity[entityDB[i]][field]);
                                }
                            }
                            else if (key === 'currentFlow') {
                                if (entity[entityDB[i]][field] != null) {
                                    currentFlow.push(entity[entityDB[i]][field]);
                                }
                            }
                            else if (key === 'second') {
                                if (entity[entityDB[i]][field] != null) {
                                    second.push(entity[entityDB[i]][field]);
                                }
                            }
                            else if (key === 'temperature') {
                                if (entity[entityDB[i]][field] != null) {
                                    temperature.push(entity[entityDB[i]][field]);
                                }
                            }
                            else if (key === 'area') {
                                if (entity[entityDB[i]][field] != null) {
                                    area.push(entity[entityDB[i]][field]);
                                }
                            }
                            else if (key === 'frequency') {
                                if (entity[entityDB[i]][field] != null) {
                                    frequency.push(entity[entityDB[i]][field]);
                                }
                            }
                            else if (key === 'length') {
                                if (entity[entityDB[i]][field] != null) {
                                    length.push(entity[entityDB[i]][field]);
                                }
                            }
                        }
                    }
                }

                const dataVoltage = await getVoltageByIds(voltage);
                if (dataVoltage.success) {
                    entity.voltage = dataVoltage.data;
                }

                const dataCurrentFlow = await getCurrentFlowByIds(currentFlow);
                if (dataCurrentFlow.success) {
                    entity.currentFlow = dataCurrentFlow.data;
                }

                const dataSecond = await getSecondByIds(second);
                if (dataSecond.success) {
                    entity.second = dataSecond.data;
                }

                const dataTemperature = await getTemperatureByIds(temperature);
                if (dataTemperature.success) {
                    entity.temperature = dataTemperature.data;
                }

                const dataArea = await getAreaByIds(area);
                if (dataArea.success) {
                    entity.area = dataArea.data;
                }

                const dataFrequency = await getFrequencyByIds(frequency);
                if (dataFrequency.success) {
                    entity.frequency = dataFrequency.data;
                }

                const dataLength = await getLengthByIds(length);
                if (dataLength.success) {
                    entity.length = dataLength.data;
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
        console.log('1');
        // Xóa oldCableInfo
        if (entity.oldCableInfo && entity.oldCableInfo.mrid) {
            await deleteOldCableInfoTransaction(entity.oldCableInfo.mrid, db);
        }
        console.log('2');

        // Xóa assetPsr
        if (entity.assetPsr && entity.assetPsr.mrid) {
            await deleteAssetPsrTransaction(entity.assetPsr.mrid, db);
        }
        console.log('3');

        // Xóa asset
        if (entity.asset && entity.asset.mrid) {
            await deleteAssetByIdTransaction(entity.asset.mrid, db);
        }
        console.log('4');

        // Xóa productAssetModel
        if (entity.productAssetModel && entity.productAssetModel.mrid) {
            await deleteProductAssetModelByIdTransaction(entity.productAssetModel.mrid, db);
        }
        console.log('5');

        // Xóa lifecycleDate
        if (entity.lifecycleDate && entity.lifecycleDate.mrid) {
            await deleteLifecycleDateByIdTransaction(entity.lifecycleDate.mrid, db);
        }
        console.log('6');

        // Xóa terminal
        if (entity.terminal && entity.terminal.mrid) {
            await deleteTerminalCableInfoTransaction(entity.terminal.mrid, db);
        }
        console.log('7');

        // Xóa sheathVoltageLimiter
        if (entity.sheathVoltageLimiter && entity.sheathVoltageLimiter.mrid) {
            await deleteSheathVoltageLimiterTransaction(entity.sheathVoltageLimiter.mrid, db);
        }
        console.log('8');

        // Xóa joint
        if (entity.joint && entity.joint.mrid) {
            await deleteJointCableInfoById(entity.joint.mrid, db);
        }
        console.log('9');

        // Xóa concentricNeutralCableInfo
        if (entity.concentricNeutral && entity.concentricNeutral.mrid) {
            await deleteConcentricNeutralCableInfoTransaction(entity.concentricNeutral.mrid, db);
        }
        console.log('10');

        // Xóa temperature
        for (const temperature of entity.temperature || []) {
            if (temperature.mrid) await deleteTemperatureByIdTransaction(temperature.mrid, db);
        }
        console.log('11');

        // Xóa voltage
        for (const voltage of entity.voltage || []) {
            if (voltage.mrid) await deleteVoltageByIdTransaction(voltage.mrid, db);
        }
        console.log('12');

        // Xóa length
        for (const length of entity.length || []) {
            if (length.mrid) await deleteLengthByIdTransaction(length.mrid, db);
        }
        console.log('13');

        // Xóa frequency
        for (const frequency of entity.frequency || []) {
            if (frequency.mrid) await deleteFrequencyByIdTransaction(frequency.mrid, db);
        }
        console.log('14');

        // Xóa second
        for (const second of entity.second || []) {
            if (second.mrid) await deleteSecondsByIdTransaction(second.mrid, db);
        }
        console.log('15');

        // Xóa currentFlow
        for (const currentFlow of entity.currentFlow || []) {
            if (currentFlow.mrid) await deleteCurrentFlowByIdTransaction(currentFlow.mrid, db);
        }
        console.log('16');

        // Xóa area
        for (const area of entity.area || []) {
            if (area.mrid) await deleteAreaByIdTransaction(area.mrid, db);
        }
        console.log('17');

        await runAsync('COMMIT');
        return { success: true, message: 'Power cable entity deleted successfully' };
    } catch (error) {
        await runAsync('ROLLBACK');
        return { success: false, error, message: 'Error deleting Power Cable entity' };
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