
import db from '../../datacontext/index'
import path from 'path'
import * as attachmentContext from '../../attachmentcontext/index'
import { uploadAttachmentTransaction, backupAllFilesInDir, deleteBackupFiles, restoreFiles, syncFilesWithDeletion, getAttachmentByForeignIdAndType, deleteAttachmentByIdTransaction, deleteDirectory } from '@/function/entity/attachment'
import { insertVoltageTransaction, getVoltageByIds, deleteVoltageByIdTransaction } from '@/function/cim/voltage';
import { insertCurrentFlowTransaction, getCurrentFlowByIds, deleteCurrentFlowByIdTransaction } from '@/function/cim/currentFlow';
import { insertLifecycleDateTransaction, getLifecycleDateById, deleteLifecycleDateByIdTransaction } from '@/function/cim/lifecycleDate';
import { insertProductAssetModelTransaction, getProductAssetModelById, deleteProductAssetModelByIdTransaction } from '@/function/cim/productAssetModel';
import { insertAssetPsrTransaction, getAssetPsrByAssetIdAndPsrId, deleteAssetPsrTransaction } from '@/function/entity/assetPsr'
import { insertFrequencyTransaction, getFrequencyById, deleteFrequencyByIdTransaction } from '@/function/cim/frequency';
import { insertAssetTransaction, getAssetById, deleteAssetByIdTransaction, insertAsset } from '@/function/cim/asset';
import { insertResistanceTransaction, getResistanceById, deleteResistanceByIdTransaction } from '@/function/cim/resistance';
import {insertLengthTransaction, getLengthById, deleteLengthByIdTransaction} from '@/function/cim/length'
import {insertMassTransaction, getMassById, deleteMassByIdTransaction} from '@/function/cim/mass'
import {insertVolumeTransaction, getVolumeById, deleteVolumeByIdTransaction} from '@/function/cim/volume'
import {insertPressureTransaction, getPressureById, deletePressureByIdTransaction} from '@/function/cim/pressure'
import {insertTemperatureTransaction, getTemperatureById, deleteTemperatureByIdTransaction} from '@/function/cim/temperature'
import {insertQuantityValueTransaction, getQuantityValueById, deleteQuantityValueTransaction} from '@/function/cim/quantityValue'
import {insertCapacitanceTransaction, getCapacitanceById, deleteCapacitanceByIdTransaction} from '@/function/cim/capacitance'
import {insertSecondsTransaction, getSecondById, deleteSecondsByIdTransaction } from '@/function/cim/seconds'
import {insertActivePowerTransaction, getActivePowerById, deleteActivePowerByIdTransaction} from '@/function/cim/activePower'
import {insertOldBreakerInfoTransaction, getOldBreakerInfoById, deleteOldBreakerInfoTransaction } from '@/function/cim/oldBreakerInfo'
import {insertBreakerContactSystemInfoTransaction, getBreakerContactSystemInfoById, deleteBreakerContactSystemInfoTransaction, getBreakerContactSystemInfoByBreakerInfoId } from '@/function/cim/breakerContactSystemInfo'
import {insertBreakerRatingInfoTransaction, getBreakerRatingInfoById, deleteBreakerRatingInfoTransaction, getBreakerRatingInfoByBreakerInfoId} from '@/function/cim/breakerRatingInfo'
import {insertBreakerOtherInfoTransaction, getBreakerOtherInfoById, deleteBreakerOtherInfoTransaction, getBreakerOtherInfoByBreakerInfoId} from '@/function/cim/breakerOtherInfo'
import {insertOldOperatingMechanismTransaction, getOldOperatingMechanismByAssetIdTransaction ,getOldOperatingMechanismById, deleteOldOperatingMechanismTransaction} from '@/function/cim/oldOperatingMechanism'
import {insertOldOperatingMechanismInfoTransaction, getOldOperatingMechanismInfoById, deleteOldOperatingMechanismInfoTransaction} from '@/function/cim/oldOperatingMechanismInfo'
import {insertOperatingMechanismComponentTransaction, getOperatingMechanismComponentById, deleteOperatingMechanismComponentTransaction} from '@/function/cim/operatingMechanismComponent'
import { insertAssessmentLimitBreakerInfoTransaction, getAssessmentLimitBreakerInfoById, getAssessmentLimitBreakerInfoByBreakerInfoId, deleteAssessmentLimitBreakerInfoByIdTransaction} from '@/function/cim/assessmentLimitBreakerInfo'
import { insertAuxiliaryContactsBreakerInfoTransaction, getAuxiliaryContactsBreakerInfoById, getAuxiliaryContactsBreakerInfoByAssessmentLimitId, deleteAuxiliaryContactsBreakerInfoTransaction} from '@/function/cim/auxiliaryContactsBreakerInfo'
import { insertTripOperationTransaction, getTripOperationById, getTripOperationByAuxiliaryContactsId, deleteTripOperationTransaction} from '@/function/cim/tripOperation'
import { insertCloseOperationTransaction, getCloseOperationById, getCloseOperationByAuxiliaryContactsId, deleteCloseOperationTransaction} from '@/function/cim/closeOperation'
import {insertContactResistanceBreakerInfoTransaction, getContactResistanceBreakerInfoById, getContactResistanceBreakerInfoByAssessmentLimitBreakerInfoId, deleteContactResistanceBreakerInfoTransaction } from '@/function/cim/contactResistanceBreakerInfo'
import {insertOperatingTimeBreakerInfoTransaction, getOperatingTimeBreakerInfoById, getOperatingTimeBreakerInfoByAssessmentLimitBreakerInfoId, deleteOperatingTimeBreakerInfoTransaction} from '@/function/cim/operatingTimeBreakerInfo'
import {insertContactTravelBreakerInfoTransaction, getContactTravelBreakerInfoById, getContactTravelBreakerInfoByAssessmentLimitBreakerInfoId, deleteContactTravelBreakerInfoTransaction} from '@/function/cim/contactTravelBreakerInfo'
import {insertMiscellaneousBreakerInfoTransaction, getMiscellaneousBreakerInfoById, getMiscellaneousBreakerInfoByAssessmentLimitId, deleteMiscellaneousBreakerInfoTransaction} from '@/function/cim/miscellaneousBreakerInfo'
import {insertCoilCharacteristicsBreakerInfoTransaction, getCoilCharacteristicsBreakerInfoById, getCoilCharacteristicsBreakerInfoByAssessmentLimitId, deleteCoilCharacteristicsBreakerInfoTransaction} from '@/function/cim/coilCharacteristicsBreakerInfo'
import {insertPickupVoltageBreakerInfoTransaction, getPickupVoltageBreakerInfoById, getPickupVoltageBreakerInfoByAssessmentLimitId, deletePickupVoltageBreakerInfoTransaction} from '@/function/cim/pickupVoltageBreakerInfo'
import {insertMotorCharacteristicsBreakerInfoTransaction, getMotorCharacteristicsBreakerInfoById, getMotorCharacteristicsBreakerInfoByAssessmentLimitId, deleteMotorCharacteristicsBreakerInfoTransaction} from '@/function/cim/motorCharacteristicsBreakerInfo'
import {insertUnderVoltageReleaseBreakerInfoTransaction, getUnderVoltageReleaseBreakerInfoById, getUnderVoltageReleaseBreakerInfoByAssessmentLimitId, deleteUnderVoltageReleaseBreakerInfoTransaction} from '@/function/cim/underVoltageReleaseBreakerInfo'
import {insertOvercurrentReleaseBreakerInfoTransaction, getOvercurrentReleaseBreakerInfoById, getOvercurrentReleaseBreakerInfoByAssessmentLimitId, deleteOvercurrentReleaseBreakerInfoTransaction} from '@/function/cim/overcurrentReleaseBreakerInfo'


export const insertBreakerEntity = async (old_entity, entity) => {
    const unitTypes = ['resistance', 'capacitance', 'voltage', 'currentFlow', 'second', 'activePower', 'length', 'mass', 'volume', 'temperature', 'frequency', 'quantity', 'pressure']
    const tableTypes = ['operatingMechanismComponent', 'contactResistanceBreakerInfo', 'operatingTimeBreakerInfo', 'contactTravelBreakerInfo', 'tripOperation', 'closeOperation', 'miscellaneousBreakerInfo', 'coilCharacteristicsBreakerInfo', 'pickupVoltageBreakerInfo', 'motorCharacteristicsBreakerInfo', 'underVoltageReleaseBreakerInfo', 'overcurrentReleaseBreakerInfo']
    try {
        if (entity.asset.mrid === null || entity.asset.mrid === '') {
            return {
                success: false,
                error: new Error("MRID is required for Capacitor Entity"),
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

            //lifecycledate
            await insertLifecycleDateTransaction(entity.lifecycleDate, db);
            await insertLifecycleDateTransaction(entity.operatingLifecycleDate, db);

            //productAssetModel
            await insertProductAssetModelTransaction(entity.productAssetModel, db);
            await insertProductAssetModelTransaction(entity.operatingProductAssetModel, db);

            //assetInfo
            await insertOldBreakerInfoTransaction(entity.oldBreakerInfo, db);

            //asset
            await insertAssetTransaction(entity.asset, db);

            //assetPsr
            await insertAssetPsrTransaction(entity.assetPsr, db);

            //ratings
            await insertBreakerRatingInfoTransaction(entity.breakerRatingInfo, db);

            //contactSystem
            await insertBreakerContactSystemInfoTransaction(entity.breakerContactSystemInfo, db);

            //other
            await insertBreakerOtherInfoTransaction(entity.breakerOtherInfo, db);

            //operatingMechanismInfo
            await insertOldOperatingMechanismInfoTransaction(entity.oldOperatingMechanismInfo, db);

            //operatingMechanism
            await insertOldOperatingMechanismTransaction(entity.oldOperatingMechanism, db);
            
            //Assessment
            await insertAssessmentLimitBreakerInfoTransaction(entity.assessmentLimitBreakerInfo, db);
            
            //AuxiliaryContacts
            await insertAuxiliaryContactsBreakerInfoTransaction(entity.auxiliaryContactsBreakerInfo, db);

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


            for(const tableType of tableTypes) {
                for(const t of toDeleteTable[tableType]) {
                    await deleteTable(tableType, t.mrid, db);
                }
            }

            for(const unitType of unitTypes) {
                for(const u of toDeleteUnit[unitType]) {
                    await deleteUnit(unitType, u.mrid, db);
                }
            }
            
            await runAsync('COMMIT');
            deleteBackupFiles(null, entity.asset.mrid);
            return { success: true, data: entity, message: 'Breaker entity inserted successfully' };
        }
    } catch (error) {
        restoreFiles(null, null, entity.asset.mrid);
        deleteBackupFiles(null, entity.asset.mrid);
        await runAsync('ROLLBACK');
        console.error(error);
        return { success: false, error, message: `Error saving breaker entity: ${error.message || 'Unknown error'}` };
    }
}

export const getBreakerEntity = async (id, psrId) => {

    return {
        success: true,
        data: [],
        message: 'get Breaker entity successfully',
    };
}

export const deleteBreakerEntity = async (entity) => {
    return {
        success: true,
        data: entity,
        message: 'delete Breaker entity successfully',
    };
}

const insertUnit = async (unit, data, dbsql) => {
    if(unit == 'voltage') {
        await insertVoltageTransaction(data, dbsql);
    } else if(unit == 'currentFlow') {
        await insertCurrentFlowTransaction(data, dbsql);
    } else if(unit == 'second') {
        await insertSecondsTransaction(data, dbsql);
    } else if(unit == 'activePower') {
        await insertActivePowerTransaction(data, dbsql);
    } else if(unit == 'length') {
        await insertLengthTransaction(data, dbsql);
    } else if(unit == 'mass') {
        await insertMassTransaction(data, dbsql);
    } else if(unit == 'volume') {
        await insertVolumeTransaction(data, dbsql);
    } else if(unit == 'temperature') {
        await insertTemperatureTransaction(data, dbsql);
    } else if(unit == 'frequency') {
        await insertFrequencyTransaction(data, dbsql);
    } else if(unit == 'quantity') {
        await insertQuantityValueTransaction(data, dbsql);
    } else if(unit == 'pressure') {
        await insertPressureTransaction(data, dbsql);
    } else if(unit == 'resistance') {
        await insertResistanceTransaction(data, dbsql);
    } else if(unit == 'capacitance') {
        await insertCapacitanceTransaction(data, dbsql);
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
    } else if(unit == 'length') {
        await deleteLengthByIdTransaction(data, dbsql);
    } else if(unit == 'mass') {
        await deleteMassByIdTransaction(data, dbsql);
    } else if(unit == 'volume') {
        await deleteVolumeByIdTransaction(data, dbsql);
    } else if(unit == 'temperature') {
        await deleteTemperatureByIdTransaction(data, dbsql);
    } else if(unit == 'frequency') {
        await deleteFrequencyByIdTransaction(data, dbsql);
    } else if(unit == 'quantity') {
        await deleteQuantityValueTransaction(data, dbsql);
    } else if(unit == 'pressure') {
        await deletePressureByIdTransaction(data, dbsql);
    } else if(unit == 'resistance') {
        await deleteResistanceByIdTransaction(data, dbsql);
    } else if(unit == 'capacitance') {
        await deleteCapacitanceByIdTransaction(data, dbsql);
    }
}

const insertTable = async (table, data, dbsql) => {
    if(table == 'operatingMechanismComponent') {
        await insertOperatingMechanismComponentTransaction(data, dbsql);
    }else if(table == 'contactResistanceBreakerInfo') {
        await insertContactResistanceBreakerInfoTransaction(data, dbsql);
    }else if(table == 'operatingTimeBreakerInfo') {
        await insertOperatingTimeBreakerInfoTransaction(data, dbsql);
    }else if(table == 'contactTravelBreakerInfo') {
        await insertContactTravelBreakerInfoTransaction(data, dbsql);
    }else if(table == 'tripOperation') {
        await insertTripOperationTransaction(data, dbsql);
    }else if(table == 'closeOperation') {
        await insertCloseOperationTransaction(data, dbsql);
    }else if(table == 'miscellaneousBreakerInfo') {
        await insertMiscellaneousBreakerInfoTransaction(data, dbsql);
    }else if(table == 'coilCharacteristicsBreakerInfo') {
        await insertCoilCharacteristicsBreakerInfoTransaction(data, dbsql);
    }else if(table == 'pickupVoltageBreakerInfo') {
        await insertPickupVoltageBreakerInfoTransaction(data, dbsql);
    }else if(table == 'motorCharacteristicsBreakerInfo') {
        await insertMotorCharacteristicsBreakerInfoTransaction(data, dbsql);
    }else if(table == 'underVoltageReleaseBreakerInfo') {
        await insertUnderVoltageReleaseBreakerInfoTransaction(data, dbsql);
    }else if(table == 'overcurrentReleaseBreakerInfo') {
        await insertOvercurrentReleaseBreakerInfoTransaction(data, dbsql);
    }
}

const deleteTable = async (table, data, dbsql) => {
    if(table == 'operatingMechanismComponent') {
        await deleteOperatingMechanismComponentTransaction(data, dbsql);
    } else if(table == 'contactResistanceBreakerInfo') {
        await deleteContactResistanceBreakerInfoTransaction(data, dbsql);
    } else if(table == 'operatingTimeBreakerInfo') {
        await deleteOperatingTimeBreakerInfoTransaction(data, dbsql);
    } else if(table == 'contactTravelBreakerInfo') {
        await deleteContactTravelBreakerInfoTransaction(data, dbsql);
    } else if(table == 'tripOperation') {
        await deleteTripOperationTransaction(data, dbsql);
    } else if(table == 'closeOperation') {
        await deleteCloseOperationTransaction(data, dbsql);
    } else if(table == 'miscellaneousBreakerInfo') {
        await deleteMiscellaneousBreakerInfoTransaction(data, dbsql);
    } else if(table == 'coilCharacteristicsBreakerInfo') {
        await deleteCoilCharacteristicsBreakerInfoTransaction(data, dbsql);
    } else if(table == 'pickupVoltageBreakerInfo') {
        await deletePickupVoltageBreakerInfoTransaction(data, dbsql);
    } else if(table == 'motorCharacteristicsBreakerInfo') {
        await deleteMotorCharacteristicsBreakerInfoTransaction(data, dbsql);
    } else if(table == 'underVoltageReleaseBreakerInfo') {
        await deleteUnderVoltageReleaseBreakerInfoTransaction(data, dbsql);
    } else if(table == 'overcurrentReleaseBreakerInfo') {
        await deleteOvercurrentReleaseBreakerInfoTransaction(data, dbsql);
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