import db from '../../datacontext/index'
import path from 'path'
import * as attachmentContext from '../../attachmentcontext/index'
import { uploadAttachmentTransaction, backupAllFilesInDir, deleteBackupFiles, restoreFiles, syncFilesWithDeletion, getAttachmentByForeignIdAndType, deleteAttachmentByIdTransaction, deleteDirectory } from '@/function/entity/attachment'
import {insertOldPowerTransformerInfoTransaction, getOldPowerTransformerInfoById, deleteOldPowerTransformerInfoTransaction} from '@/function/cim/oldPowerTransformerInfo'
import {insertOldTransformerEndInfoTransaction, deleteOldTransformerEndInfoTransaction, getOldTransformerEndInfoByPowerTransformerInfoId} from '@/function/cim/oldTransformerEndInfo'
import {insertAssetPsrTransaction, getAssetPsrByAssetIdAndPsrId, deleteAssetPsrTransaction} from '@/function/entity/assetPsr'
import {insertProductAssetModelTransaction, getProductAssetModelById, deleteProductAssetModelByIdTransaction} from '@/function/cim/productAssetModel';
import {insertLifecycleDateTransaction, getLifecycleDateById, deleteLifecycleDateByIdTransaction} from '@/function/cim/lifecycleDate';
import { insertSecondsTransaction, deleteSecondsByIdTransaction, getSecondByIds } from '@/function/cim/seconds';
import {insertCurrentFlowTransaction, deleteCurrentFlowByIdTransaction, getCurrentFlowByIds, } from '@/function/cim/currentFlow';
import {insertVoltageTransaction, deleteVoltageByIdTransaction, getVoltageByIds} from '@/function/cim/voltage';
import {insertPercentTransaction, getPercentByIds, deletePercentByIdTransaction} from "@/function/cim/percent"
import {insertActivePowerTransaction, getActivePowerByIds, deleteActivePowerByIdTransaction} from '@/function/cim/activePower';
import {insertApparentPowerTransaction, getApparentPowerByIds, deleteApparentPowerByIdTransaction} from '@/function/cim/apparentPower';
import {insertFrequencyTransaction, deleteFrequencyByIdTransaction, getFrequencyByIds} from '@/function/cim/frequency';
import {insertMassTransaction, deleteMassByIdTransaction} from '@/function/cim/mass'
import {insertVolumeTransaction, deleteVolumeByIdTransaction} from '@/function/cim/volume'
import {insertTemperatureTransaction, deleteTemperatureByIdTransaction, getTemperatureByIds} from '@/function/cim/temperature'
import {insertAssetTransaction, deleteAssetByIdTransaction, getAssetById} from '@/function/cim/asset'
import {insertZeroSequenceImpedanceTransaction, deleteZeroSequenceImpedanceTransaction, getZeroSequenceImpedanceByTransformerInfoId} from '@/function/cim/zeroSequenceImpedance'
import {insertZeroSequenceImpedanceTableTransaction, getZeroSequenceImpedanceTableByZeroSequenceImpedanceId, deleteZeroSequenceImpedanceTableTransaction, getZeroSequenceImpedanceTableByTransformerEndIdAndZeroSequenceImpedance} from '@/function/cim/zeroSequenceImpedanceTable'
import {insertVoltageRatingTransaction, deleteVoltageRatingTransaction, getVoltageRatingByTransformerEndId} from "@/function/cim/voltageRating"
import {insertCoolingPowerRatingTransaction, getCoolingPowerRatingByPowerTransformerInfoId, deleteCoolingPowerRatingTransaction} from "@/function/cim/coolingPowerRating"
import {insertCurrentRatingTransaction, getCurrentRatingByRatedPower, deleteCurrentRatingByIdTransaction} from "@/function/cim/currentRating"
import {insertBaseVoltageTransaction, deleteBaseVoltageByIdTransaction, getBaseVoltageByIds} from "@/function/cim/baseVoltage"
import {insertBasePowerTransaction, deleteBasePowerByIdTransaction, getBasePowerByIds} from "@/function/cim/basePower"
import {insertShortCircuitTestTransaction, getShortCircuitTestByTransformerEndInfoId, deleteShortCircuitTestByIdTransaction} from "@/function/cim/shortCircuitTest"
import {insertSCTTransformerEndInfoTransaction, getSCTTransformerEndInfoByShortCircuitTestId, deleteSCTTransformerEndInfoByIdTransaction} from "@/function/cim/shortCircuitTestTransformerEndInfo"
import {insertShortCircuitRatingTransaction, deleteShortCircuitRatingByIdTransaction, getShortCircuitRatingByPowerTransformerInfoId} from '@/function/cim/shortCircuitRating'

import TransformerEntity from '@/views/Entity/Transformer/index';

export const insertTransformerEntity = async (old_entity,entity) => {
    const unitTypes = ['percent', 'voltage', 'currentFlow', 'seconds', 'activePower', 'apparentPower', 'mass', 'volume', 'temperature', 'frequency', 'baseVoltage', 'basePower']
    const tableTypes = ['oldTransformerEndInfo', 'voltageRating', 'coolingPowerRating', 'currentRating', 'shortCircuitTest', 'shortCircuitTestTransformerEndInfo', 'zeroSequenceImpedanceTable']
    try {
        if(entity.asset.mrid === null || entity.asset.mrid === '') {
            const result = {
                success: false,
                error: new Error("MRID is required for Transformer Entity"),
                message: '',
            }
            return result;
        } else {
            backupAllFilesInDir(null, null, entity.asset.mrid);
            const syncResult = syncFilesWithDeletion(JSON.parse(entity.attachment.path), null, entity.asset.mrid);
            if (!syncResult.success) {
                restoreFiles(null, null, entity.asset.mrid);
                const result = {
                    success: false,
                    error: new Error("MRID is required for Transformer Entity"),
                    message: '',
                }
                return result;
            }
            await runAsync('BEGIN TRANSACTION');
            const toDeleteUnit = {}
            for(const unitType of unitTypes) {
                const newIds = entity[unitType].map(v => v.mrid).filter(id => id); // bỏ null/empty
                const oldIds = old_entity[unitType].map(v => v.mrid).filter(id => id);

                const toAdd = entity[unitType].filter(v => v.mrid && !oldIds.includes(v.mrid));
                const toDelete = old_entity[unitType].filter(v => v.mrid && !newIds.includes(v.mrid));
                toDeleteUnit[unitType] = toDelete;
                const toUpdate = entity[unitType].filter(v => v.mrid && oldIds.includes(v.mrid));
                for (const unit of toAdd) {
                    await insertUnit(unitType, unit, db);
                }
                for (const unit of toUpdate) {
                    await insertUnit(unitType, unit, db);
                }
            }
            await insertOldPowerTransformerInfoTransaction(entity.oldPowerTransformerInfo, db);
            await insertLifecycleDateTransaction(entity.lifecycleDate, db);
            await insertProductAssetModelTransaction(entity.productAssetModel, db);
            await insertAssetTransaction(entity.asset, db);
            await insertAssetPsrTransaction(entity.assetPsr, db);
            await insertZeroSequenceImpedanceTransaction(entity.zeroSequenceImpedance, db);
            await insertShortCircuitRatingTransaction(entity.shortCircuitRating, db);


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

            //table
            let toDeleteTable = {}
            for(const tableType of tableTypes) {
                const newIds = entity[tableType].map(v => v.mrid).filter(id => id); // bỏ null/empty
                const oldIds = old_entity[tableType].map(v => v.mrid).filter(id => id);

                const toAdd = entity[tableType].filter(v => v.mrid && !oldIds.includes(v.mrid));
                const toDelete = old_entity[tableType].filter(v => v.mrid && !newIds.includes(v.mrid));
                toDeleteTable[tableType] = toDelete;
                const toUpdate = entity[tableType].filter(v => v.mrid && oldIds.includes(v.mrid));
                for (const table of toAdd) {
                    await insertTable(tableType, table, db);
                }
                for (const table of toUpdate) {
                    await insertTable(tableType, table, db);
                }
            }

            for(const tableType of [...tableTypes].reverse()) {
                for(const t of toDeleteTable[tableType]) {
                    await deleteTable(tableType, t.mrid, db);
                }
            }

            for(const unitType of [...unitTypes].reverse()) {
                for(const u of toDeleteUnit[unitType]) {
                    await deleteUnit(unitType, u.mrid, db);
                }
            }

            await runAsync('COMMIT');
            deleteBackupFiles(null, entity.asset.mrid);
            return { success: true, data: entity, message: 'Transformer entity inserted successfully' };
        }
    } catch (error) {
        restoreFiles(null, null, entity.asset.mrid);
        deleteBackupFiles(null, entity.asset.mrid);
        console.error('Error retrieving transformer entity:', error);
        await runAsync('ROLLBACK');
        return { success: false, error, message: 'Error retrieving transformer entity' };
    }
}

export const getTransformerEntityById = async (id, psrId) => {
    try {
        if(id == null || id === '') {
            return { success: false, error: new Error('Invalid ID') };
        } else {
            var frequencyIds = []
            var voltageIds = []
            var apparentPowerIds = []
            var temperatureIds = []
            var currentFlowIds = []
            var secondIds = []
            var percentIDs = []
            var baseVoltageIds = []
            var basePowerIds = []
            var activePowerIds = []


            const entity = new TransformerEntity()
            const dataTransformer = await getAssetById(id);
            if(dataTransformer.success) {
                entity.asset = dataTransformer.data;
                const dataAssetPsr = await getAssetPsrByAssetIdAndPsrId(entity.asset.mrid, psrId);
                if(dataAssetPsr.success) {
                    entity.assetPsr = dataAssetPsr.data;
                }
                const dataLifecycleDate = await getLifecycleDateById(entity.asset.lifecycle_date);
                if(dataLifecycleDate.success) {
                    entity.lifecycleDate = dataLifecycleDate.data;
                }
                const dataAttachment = await getAttachmentByForeignIdAndType(entity.asset.mrid, 'asset');
                if (dataAttachment.success) {
                    entity.attachment = dataAttachment.data;
                }
                const dataOldTransformerInfo = await getOldPowerTransformerInfoById(entity.asset.asset_info);
                if(dataOldTransformerInfo.success) {
                    entity.oldPowerTransformerInfo = dataOldTransformerInfo.data;
                    frequencyIds.push(entity.oldPowerTransformerInfo.rated_frequency)
                    temperatureIds.push(entity.oldPowerTransformerInfo.impedance_temperature)
                }

                const dataProductAssetModel = await getProductAssetModelById(entity.asset.product_asset_model);
                if(dataProductAssetModel.success) {
                    entity.productAssetModel = dataProductAssetModel.data;
                }

                const dataOldTransformerEndInfo = await getOldTransformerEndInfoByPowerTransformerInfoId(entity.asset.asset_info);
                if(dataOldTransformerEndInfo.success) {
                    entity.oldTransformerEndInfo = dataOldTransformerEndInfo.data;
                }

                for(const dataEndInfo of entity.oldTransformerEndInfo) {
                    const dataVoltageRating = await getVoltageRatingByTransformerEndId(dataEndInfo.mrid);
                    if(dataVoltageRating.success) {
                        for(const rating of dataVoltageRating.data) {
                            voltageIds.push(rating.rated_u);
                            voltageIds.push(rating.rated_ln);
                            voltageIds.push(rating.insulation_u);
                        }
                        entity.voltageRating = entity.voltageRating.concat(dataVoltageRating.data)
                    }
                }

                const dataCoolingPowerRating = await getCoolingPowerRatingByPowerTransformerInfoId(entity.oldPowerTransformerInfo.mrid);
                if(dataCoolingPowerRating.success) {
                    entity.coolingPowerRating = dataCoolingPowerRating.data;
                    for(const powerRating of entity.coolingPowerRating) {
                        apparentPowerIds.push(powerRating.power_rating);
                        temperatureIds.push(powerRating.temp_rise_wind);
                    }
                }

                for(const powerRating of entity.coolingPowerRating) {
                    const dataCurrentRating = await getCurrentRatingByRatedPower(powerRating.power_rating);
                    if(dataCurrentRating.success) {
                        for(const currentRating of dataCurrentRating.data) {
                            currentFlowIds.push(currentRating.value);
                        }
                        entity.currentRating = entity.currentRating.concat(dataCurrentRating.data)
                    }
                }

                const dataShortCircuitRating = await getShortCircuitRatingByPowerTransformerInfoId(entity.oldPowerTransformerInfo.mrid);
                if(dataShortCircuitRating.success) {
                    entity.shortCircuitRating = dataShortCircuitRating.data;
                    secondIds.push(entity.shortCircuitRating.duration_seconds)
                    currentFlowIds.push(entity.shortCircuitRating.short_circuit_current)
                }

                for(const shortCircuitTest of entity.oldTransformerEndInfo) {
                    const dataShortCircuitTest = await getShortCircuitTestByTransformerEndInfoId(shortCircuitTest.mrid);
                    if(dataShortCircuitTest.success) {
                        for(const sct of dataShortCircuitTest.data) {
                            percentIDs.push(sct.voltage)
                            baseVoltageIds.push(sct.base_voltage)
                            basePowerIds.push(sct.base_power)
                            activePowerIds.push(sct.loss)
                        }
                        entity.shortCircuitTest = entity.shortCircuitTest.concat(dataShortCircuitTest.data)
                    }
                }

                for(const shortCircuitTest of entity.shortCircuitTest) {
                    const dataSCTTransformerEndInfo = await getSCTTransformerEndInfoByShortCircuitTestId(shortCircuitTest.mrid);
                    if(dataSCTTransformerEndInfo.success) {
                        entity.shortCircuitTestTransformerEndInfo = entity.shortCircuitTestTransformerEndInfo.concat(dataSCTTransformerEndInfo.data)
                    }
                }

                const dataZeroSequenceImpedance = await getZeroSequenceImpedanceByTransformerInfoId(entity.oldPowerTransformerInfo.mrid);
                if(dataZeroSequenceImpedance.success) {
                    entity.zeroSequenceImpedance = dataZeroSequenceImpedance.data;
                    baseVoltageIds.push(entity.zeroSequenceImpedance.base_voltage)
                    basePowerIds.push(entity.zeroSequenceImpedance.base_power)
                }

                const dataZeroSequenceImpedanceTable = await getZeroSequenceImpedanceTableByZeroSequenceImpedanceId(entity.zeroSequenceImpedance.mrid);
                if(dataZeroSequenceImpedanceTable.success) {
                    entity.zeroSequenceImpedanceTable = dataZeroSequenceImpedanceTable.data;
                    for(const zero of entity.zeroSequenceImpedanceTable) {
                        percentIDs.push(zero.zero)
                    }
                }

                const dataFrequency = await getFrequencyByIds(frequencyIds);
                if(dataFrequency.success) {
                    entity.frequency = dataFrequency.data;
                }

                const dataTemperature = await getTemperatureByIds(temperatureIds);
                if(dataTemperature.success) {
                    entity.temperature = dataTemperature.data;
                }

                const dataSeconds = await getSecondByIds(secondIds);
                if(dataSeconds.success) {
                    entity.seconds = dataSeconds.data;
                }

                const dataCurrentFlow = await getCurrentFlowByIds(currentFlowIds);
                if(dataCurrentFlow.success) {
                    entity.currentFlow = dataCurrentFlow.data;
                }

                const dataPercent = await getPercentByIds(percentIDs);
                if(dataPercent.success) {
                    entity.percent = dataPercent.data;
                }

                const dataActivePower = await getActivePowerByIds(activePowerIds);
                if(dataActivePower.success) {
                    entity.activePower = dataActivePower.data;
                }

                const dataBaseVoltage = await getBaseVoltageByIds(baseVoltageIds);
                if(dataBaseVoltage.success) {
                    entity.baseVoltage = dataBaseVoltage.data;
                }

                for(const baseVoltage of entity.baseVoltage) {
                    voltageIds.push(baseVoltage.nominal_voltage)
                }

                const dataBasePower = await await getBasePowerByIds(basePowerIds);
                if(dataBasePower.success) {
                    entity.basePower = dataBasePower.data;
                }

                for(const basePower of entity.basePower) {
                    apparentPowerIds.push(basePower.base_power)
                }

                const dataVoltage = await getVoltageByIds(voltageIds);
                if(dataVoltage.success) {
                    entity.voltage = dataVoltage.data;
                }

                const dataApprentPower = await getApparentPowerByIds(apparentPowerIds);
                if(dataApprentPower.success) {
                    entity.apparentPower = dataApprentPower.data;
                }

                return {
                    success: true,
                    data: entity,
                    message: 'Transformer entity retrieved successfully'
                }
            } else {
                return { success: false, error: dataTransformer.error, message: dataTransformer.message };
            }
        }
    } catch (error) {
        console.error("Error retrieving Transformer entity by ID:", error);
        return { success: false, error, message: 'Error retrieving Transformer entity by ID' };
    }
}

export const deleteTransformerEntity = async (data) => {
    try {
        if(data.asset == null || data.asset.mrid == null || data.asset.mrid === '') {
            return { success: false, error: new Error('Invalid ID') };
        } else {
            try {
                await runAsync('BEGIN TRANSACTION');
                if(data.attachment && data.attachment.id) {
                    const pathData = JSON.parse(data.attachment.path || '[]')
                    if (Array.isArray(pathData) && pathData.length > 0) {
                        syncFilesWithDeletion(pathData, null, data.mrid);
                    }
                }
                if( data.attachment.id) {
                    await deleteAttachmentByIdTransaction(data.attachment.id, db);
                }
                if(data.assetPsr && data.assetPsr.mrid) {
                    await deleteAssetPsrTransaction(data.assetPsr.mrid, db);
                }
                for(const shortCircuitTestTransformerEndInfo of data.shortCircuitTestTransformerEndInfo) {
                    if(shortCircuitTestTransformerEndInfo.mrid) {
                        await deleteSCTTransformerEndInfoByIdTransaction(shortCircuitTestTransformerEndInfo.mrid, db);
                    }
                }
                for(const shortCircuitTest of data.shortCircuitTest) {
                    if(shortCircuitTest.mrid) {
                        await deleteShortCircuitTestByIdTransaction(shortCircuitTest.mrid, db);
                    }
                }
                for(const zeroSequenceImpedanceTable of data.zeroSequenceImpedanceTable) {
                    if(zeroSequenceImpedanceTable.mrid) {
                        await deleteZeroSequenceImpedanceTableTransaction(zeroSequenceImpedanceTable.mrid, db);
                    }
                }
                if(data.zeroSequenceImpedance && data.zeroSequenceImpedance.mrid) {
                    await deleteZeroSequenceImpedanceTransaction(data.zeroSequenceImpedance.mrid, db);
                }
                if(data.shortCircuitRating && data.shortCircuitRating.mrid) {
                    await deleteShortCircuitRatingByIdTransaction(data.shortCircuitRating.mrid, db);
                }
                for(const currentRating of data.currentRating) {
                    if(currentRating.mrid) {
                        await deleteCurrentRatingByIdTransaction(currentRating.mrid, db);
                    }
                }
                for(const coolingPowerRating of data.coolingPowerRating) {
                    if(coolingPowerRating.mrid) {
                        await deleteCoolingPowerRatingTransaction(coolingPowerRating.mrid, db);
                    }
                }
                for(const voltageRating of data.voltageRating) {
                    if(voltageRating.mrid) {
                        await deleteVoltageRatingTransaction(voltageRating.mrid, db);
                    }
                }
                for(const oldTransformerEndInfo of data.oldTransformerEndInfo) {
                    if(oldTransformerEndInfo.mrid) {
                        await deleteOldTransformerEndInfoTransaction(oldTransformerEndInfo.mrid, db);
                    }
                }
                if(data.asset.mrid) {
                    await deleteAssetByIdTransaction(data.asset.mrid, db);
                }
                if(data.oldPowerTransformerInfo && data.oldPowerTransformerInfo.mrid) {
                    await deleteOldPowerTransformerInfoTransaction(data.oldPowerTransformerInfo.mrid, db);
                }
                if(data.lifecycleDate && data.lifecycleDate.mrid) {
                    await deleteLifecycleDateByIdTransaction(data.lifecycleDate.mrid, db);
                }
                if(data.productAssetModel && data.productAssetModel.mrid) {
                    await deleteProductAssetModelByIdTransaction(data.productAssetModel.mrid, db);
                }
                for(const basePower of data.basePower) {
                    if(basePower.mrid) {
                        await deleteBasePowerByIdTransaction(basePower.mrid, db);
                    }
                }
                for(const baseVoltage of data.baseVoltage) {
                    if(baseVoltage.mrid) {
                        await deleteBaseVoltageByIdTransaction(baseVoltage.mrid, db);
                    }
                }
                for (const voltage of data.voltage) {
                    if (voltage.mrid) {
                        await deleteVoltageByIdTransaction(voltage.mrid, db);
                    }
                }
                for (const seconds of data.seconds) {
                    if (seconds.mrid) {
                        await deleteSecondsByIdTransaction(seconds.mrid, db);
                    }
                }
                for (const currentFlow of data.currentFlow) {
                    if (currentFlow.mrid) {
                        await deleteCurrentFlowByIdTransaction(currentFlow.mrid, db);
                    }
                }
                for (const percent of data.percent) {
                    if (percent.mrid) {
                        await deletePercentByIdTransaction(percent.mrid, db);
                    }
                }
                for (const activePower of data.activePower) {
                    if (activePower.mrid) {
                        await deleteActivePowerByIdTransaction(activePower.mrid, db);
                    }
                }
                for (const apparentPower of data.apparentPower) {
                    if (apparentPower.mrid) {
                        await deleteApparentPowerByIdTransaction(apparentPower.mrid, db);
                    }
                }
                for (const frequency of data.frequency) {
                    if (frequency.mrid) {
                        await deleteFrequencyByIdTransaction(frequency.mrid, db);
                    }
                }
                for (const temperature of data.temperature) {
                    if (temperature.mrid) {
                        await deleteTemperatureByIdTransaction(temperature.mrid, db);
                    }
                }
                for (const mass of data.mass) {
                    if (mass.mrid) {
                        await deleteMassByIdTransaction(mass.mrid, db);
                    }
                }
                for (const volume of data.volume) {
                    if (volume.mrid) {
                        await deleteVolumeByIdTransaction(volume.mrid, db);
                    }
                }
                await runAsync('COMMIT');
                if(data.attachment && data.attachment.id) {
                    deleteDirectory(null, data.asset.mrid);
                }
                return { success: true, message: 'Transformer entity deleted successfully' };
            } catch (error) {
                await runAsync('ROLLBACK');
                console.error('Error deleting Transformer entity:', error);
                return { success: false, error, message: 'Error deleting Transformer entity' };
            }
        }
    } catch (error) {
        console.error('Error deleting Transformer entity:', error);
        return { success: false, error, message: 'Error deleting Transformer entity' };
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

const insertUnit = async (unit, data, dbsql) => {
    if(unit == 'voltage') {
        await insertVoltageTransaction(data, dbsql);
    } else if(unit == 'currentFlow') {
        await insertCurrentFlowTransaction(data, dbsql);
    } else if(unit == 'seconds') {
        await insertSecondsTransaction(data, dbsql);
    } else if(unit == 'activePower') {
        await insertActivePowerTransaction(data, dbsql);
    } else if(unit == 'apparentPower') {
        await insertApparentPowerTransaction(data, dbsql);
    } else if(unit == 'mass') {
        await insertMassTransaction(data, dbsql);
    } else if(unit == 'volume') {
        await insertVolumeTransaction(data, dbsql);
    } else if(unit == 'temperature') {
        await insertTemperatureTransaction(data, dbsql);
    } else if(unit == 'frequency') {
        await insertFrequencyTransaction(data, dbsql);
    } else if(unit == 'baseVoltage') {
        await insertBaseVoltageTransaction(data, dbsql)
    } else if(unit == 'basePower') {
        await insertBasePowerTransaction(data, dbsql)
    } else if(unit == 'percent') {
        await insertPercentTransaction(data, dbsql)
    }
}

const deleteUnit = async (unit, data, dbsql) => {
    if(unit == 'voltage') {
        await deleteVoltageByIdTransaction(data, dbsql);
    } else if(unit == 'currentFlow') {
        await deleteCurrentFlowByIdTransaction(data, dbsql);
    } else if(unit == 'seconds') {
        await deleteSecondsByIdTransaction(data, dbsql);
    } else if(unit == 'activePower') {
        await deleteActivePowerByIdTransaction(data, dbsql);
    } else if(unit == 'apparentPower') {
        await deleteApparentPowerByIdTransaction(data, dbsql);
    } else if(unit == 'mass') {
        await deleteMassByIdTransaction(data, dbsql);
    } else if(unit == 'volume') {
        await deleteVolumeByIdTransaction(data, dbsql);
    } else if(unit == 'temperature') {
        await deleteTemperatureByIdTransaction(data, dbsql);
    } else if(unit == 'frequency') {
        await deleteFrequencyByIdTransaction(data, dbsql);
    } else if(unit == 'baseVoltage') {
        await deleteBaseVoltageByIdTransaction(data, dbsql)
    } else if(unit == 'basePower') {
        await deleteBasePowerByIdTransaction(data, dbsql)
    } else if(unit == 'percent') {
        await deletePercentByIdTransaction(data, dbsql)
    }
}

const insertTable = async (table, data, dbsql) => {
    if(table == 'oldTransformerEndInfo') {
        await insertOldTransformerEndInfoTransaction(data, dbsql);
    }else if(table == 'voltageRating') {
        await insertVoltageRatingTransaction(data, dbsql);
    }else if(table == 'coolingPowerRating') {
        await insertCoolingPowerRatingTransaction(data, dbsql);
    }else if(table == 'currentRating') {
        await insertCurrentRatingTransaction(data, dbsql);
    }else if(table == 'shortCircuitTest') {
        await insertShortCircuitTestTransaction(data, dbsql);
    }else if(table == 'shortCircuitTestTransformerEndInfo') {
        await insertSCTTransformerEndInfoTransaction(data, dbsql);
    }else if(table == 'zeroSequenceImpedanceTable') {
        await insertZeroSequenceImpedanceTableTransaction(data, dbsql);
    }
}

const deleteTable = async (table, data, dbsql) => {
    if(table == 'oldTransformerEndInfo') {
        await deleteOldTransformerEndInfoTransaction(data, dbsql);
    }else if(table == 'voltageRating') {
        await deleteVoltageRatingTransaction(data, dbsql);
    }else if(table == 'coolingPowerRating') {
        await deleteCoolingPowerRatingTransaction(data, dbsql)
    }else if(table == 'currentRating') {
        await deleteCurrentRatingByIdTransaction(data, dbsql);
    }else if(table == 'shortCircuitTest') {
        await deleteShortCircuitTestByIdTransaction(data, dbsql);
    }else if(table == 'shortCircuitTestTransformerEndInfo') {
        await deleteSCTTransformerEndInfoByIdTransaction(data, dbsql);
    }else if(table == 'zeroSequenceImpedanceTable') {
        await deleteZeroSequenceImpedanceTableTransaction(data, dbsql);
    }
}