import db from '../../datacontext/index'
import path from 'path'
import * as attachmentContext from '../../attachmentcontext/index'
import { uploadAttachmentTransaction, backupAllFilesInDir, deleteBackupFiles, restoreFiles, syncFilesWithDeletion, getAttachmentByForeignIdAndType, deleteAttachmentByIdTransaction, deleteDirectory } from '@/function/entity/attachment'
import {insertOldPowerTransformerInfoTransaction, getOldPowerTransformerInfoById, deleteOldPowerTransformerInfoTransaction} from '@/function/cim/oldPowerTransformerInfo'
import {insertOldTransformerEndInfoTransaction, getOldTransformerEndInfoById, deleteOldTransformerEndInfoTransaction} from '@/function/cim/oldTransformerEndInfo'
import {insertAssetPsrTransaction, getAssetPsrById, getAssetPsrByAssetIdAndPsrId, deleteAssetPsrTransaction} from '@/function/entity/assetPsr'
import {insertProductAssetModelTransaction, getProductAssetModelById, deleteProductAssetModelByIdTransaction} from '@/function/cim/productAssetModel';
import {insertLifecycleDateTransaction, getLifecycleDateById, deleteLifecycleDateByIdTransaction} from '@/function/cim/lifecycleDate';
import { insertSecondsTransaction, getSecondById, deleteSecondsByIdTransaction } from '@/function/cim/seconds';
import {insertCurrentFlowTransaction, getCurrentFlowById, deleteCurrentFlowByIdTransaction, } from '@/function/cim/currentFlow';
import {insertVoltageTransaction, getVoltageById, deleteVoltageByIdTransaction} from '@/function/cim/voltage';
import {insertPercentTransaction, getPercentById, deletePercentByIdTransaction} from "@/function/cim/percent"
import {insertActivePowerTransaction, getActivePowerById, deleteActivePowerByIdTransaction} from '@/function/cim/activePower';
import {insertApparentPowerTransaction, getApparentPowerById, deleteApparentPowerByIdTransaction} from '@/function/cim/apparentPower';
import {insertFrequencyTransaction, getFrequencyById, deleteFrequencyByIdTransaction} from '@/function/cim/frequency';
import {insertMassTransaction, deleteMassByIdTransaction, getMassById} from '@/function/cim/mass'
import {insertVolumeTransaction, deleteVolumeByIdTransaction, getVolumeById} from '@/function/cim/volume'
import {insertTemperatureTransaction, deleteTemperatureByIdTransaction, getTemperatureById} from '@/function/cim/temperature'
import {insertAssetTransaction, deleteAssetByIdTransaction, getAssetById} from '@/function/cim/asset'
import {insertZeroSequenceImpedanceTransaction, getZeroSequenceImpedanceById, deleteZeroSequenceImpedanceByIdTransaction} from '@/function/cim/zeroSequenceImpedance'
import {insertZeroSequenceImpedanceTableTransaction, getZeroSequenceImpedanceTableById, deleteZeroSequenceImpedanceTableTransaction} from '@/function/cim/zeroSequenceImpedanceTable'
import {insertVoltageRatingTransaction, getVoltageRatingById, deleteVoltageRatingByIdTransaction} from "@/function/cim/voltageRating"
import {insertCoolingPowerRatingTransaction, getCoolingPowerRatingById, deleteCoolingPowerRatingTransaction} from "@/function/cim/coolingPowerRating"
import {insertCurrentRatingTransaction, getCurrentRatingById, deleteCurrentRatingByIdTransaction} from "@/function/cim/currentRating"
import {insertBaseVoltageTransaction, getBaseVoltageById, deleteBaseVoltageByIdTransaction} from "@/function/cim/baseVoltage"
import {insertBasePowerTransaction, getBasePowerById, deleteBasePowerByIdTransaction} from "@/function/cim/basePower"
import {insertShortCircuitTestTransaction, getShortCircuitTestById, deleteShortCircuitTestByIdTransaction} from "@/function/cim/shortCircuitTest"
import {insertSCTTransformerEndInfoTransaction, getSCTTransformerEndInfoById, getSCTTransformerEndInfoByShortCircuitTestId, deleteSCTTransformerEndInfoByIdTransaction} from "@/function/cim/shortCircuitTestTransformerEndInfo"

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
            const entity = new TransformerEntity()
            const dataTransformer = await getAssetById(id);
            if(dataTransformer.success) {
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
        if(data.surgeArrester == null || data.surgeArrester.mrid == null || data.surgeArrester.mrid === '') {
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
                for (const oldSurgeArresterInfo of data.oldSurgeArresterInfo) {
                    if (oldSurgeArresterInfo.mrid) {
                        await deleteOldSurgeArresterInfoByIdTransaction(oldSurgeArresterInfo.mrid, db);
                    }
                }
                if(data.surgeArrester.mrid) {
                    await deleteSurgeArresterTransaction(data.surgeArrester.mrid, db);
                }
                if(data.lifecycleDate && data.lifecycleDate.mrid) {
                    await deleteLifecycleDateByIdTransaction(data.lifecycleDate.mrid, db);
                }
                if(data.productAssetModel && data.productAssetModel.mrid) {
                    await deleteProductAssetModelByIdTransaction(data.productAssetModel.mrid, db);
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
                await runAsync('COMMIT');
                if(data.attachment && data.attachment.id) {
                    deleteDirectory(null, data.surgeArrester.mrid);
                }
                return { success: true, message: 'Surge Arrester entity deleted successfully' };
            } catch (error) {
                await runAsync('ROLLBACK');
                console.error('Error deleting Surge Arrester entity:', error);
                return { success: false, error, message: 'Error deleting Surge Arrester entity' };
            }
        }
    } catch (error) {
        console.error('Error deleting Surge Arrester entity:', error);
        return { success: false, error, message: 'Error deleting Surge Arrester entity' };
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
    } else if(unit == 'second') {
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
    } else if(unit == 'second') {
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
        await deleteVoltageRatingByIdTransaction(data, dbsql);
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