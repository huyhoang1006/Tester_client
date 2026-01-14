
import db from '../../datacontext/index'
import path from 'path'
import * as attachmentContext from '../../attachmentcontext/index'
import circuitBreakerEntity from '@/views/Flatten/CircuitBreaker'
import { uploadAttachmentTransaction, backupAllFilesInDir, deleteBackupFiles, restoreFiles, syncFilesWithDeletion, getAttachmentByForeignIdAndType, deleteAttachmentByIdTransaction, deleteDirectory } from '@/function/entity/attachment'
import { insertVoltageTransaction, getVoltageByIds, deleteVoltageByIdTransaction } from '@/function/cim/voltage';
import { insertCurrentFlowTransaction, getCurrentFlowByIds, deleteCurrentFlowByIdTransaction } from '@/function/cim/currentFlow';
import { insertLifecycleDateTransaction, getLifecycleDateById, deleteLifecycleDateByIdTransaction } from '@/function/cim/lifecycleDate';
import { insertProductAssetModelTransaction, getProductAssetModelById, deleteProductAssetModelByIdTransaction } from '@/function/cim/productAssetModel';
import { insertAssetPsrTransaction, getAssetPsrByAssetIdAndPsrId, deleteAssetPsrTransaction } from '@/function/entity/assetPsr'
import { insertFrequencyTransaction, getFrequencyByIds, deleteFrequencyByIdTransaction } from '@/function/cim/frequency';
import { insertAssetTransaction, getAssetById, deleteAssetByIdTransaction, insertAsset } from '@/function/cim/asset';
import { insertResistanceTransaction, getResistanceByIds, deleteResistanceByIdTransaction } from '@/function/cim/resistance';
import { insertLengthTransaction, getLengthByIds, deleteLengthByIdTransaction } from '@/function/cim/length'
import { insertMassTransaction, getMassByIds, deleteMassByIdTransaction } from '@/function/cim/mass'
import { insertVolumeTransaction, getVolumeByIds, deleteVolumeByIdTransaction } from '@/function/cim/volume'
import { insertPressureTransaction, getPressureByIds, deletePressureByIdTransaction } from '@/function/cim/pressure'
import { insertTemperatureTransaction, getTemperatureByIds, deleteTemperatureByIdTransaction } from '@/function/cim/temperature'
import { insertQuantityValueTransaction, getQuantityValueByIds, deleteQuantityValueTransaction } from '@/function/cim/quantityValue'
import { insertCapacitanceTransaction, getCapacitanceByIds, deleteCapacitanceByIdTransaction } from '@/function/cim/capacitance'
import { insertSecondsTransaction, getSecondByIds, deleteSecondsByIdTransaction } from '@/function/cim/seconds'
import { insertActivePowerTransaction, getActivePowerByIds, deleteActivePowerByIdTransaction } from '@/function/cim/activePower'
import { insertOldBreakerInfoTransaction, getOldBreakerInfoById, deleteOldBreakerInfoTransaction } from '@/function/cim/oldBreakerInfo'
import { insertBreakerContactSystemInfoTransaction, deleteBreakerContactSystemInfoTransaction, getBreakerContactSystemInfoByBreakerInfoId } from '@/function/cim/breakerContactSystemInfo'
import { insertBreakerRatingInfoTransaction, deleteBreakerRatingInfoTransaction, getBreakerRatingInfoByBreakerInfoId } from '@/function/cim/breakerRatingInfo'
import { insertBreakerOtherInfoTransaction, deleteBreakerOtherInfoTransaction, getBreakerOtherInfoByBreakerInfoId } from '@/function/cim/breakerOtherInfo'
import { insertOldOperatingMechanismTransaction, getOldOperatingMechanismByAssetIdTransaction, getOldOperatingMechanismById, deleteOldOperatingMechanismTransaction } from '@/function/cim/oldOperatingMechanism'
import { insertOldOperatingMechanismInfoTransaction, getOldOperatingMechanismInfoById, deleteOldOperatingMechanismInfoTransaction } from '@/function/cim/oldOperatingMechanismInfo'
import { insertOperatingMechanismComponentTransaction, deleteOperatingMechanismComponentTransaction, getOperatingMechanismComponentByOperatingMechanismId } from '@/function/cim/operatingMechanismComponent'
import { insertAssessmentLimitBreakerInfoTransaction, getAssessmentLimitBreakerInfoByBreakerInfoId, deleteAssessmentLimitBreakerInfoTransaction } from '@/function/cim/assessmentLimitBreakerInfo'
import { insertAuxiliaryContactsBreakerInfoTransaction, getAuxiliaryContactsBreakerInfoByAssessmentLimitId, deleteAuxiliaryContactsBreakerInfoTransaction } from '@/function/cim/auxiliaryContactsBreakerInfo'
import { insertTripOperationTransaction, getTripOperationByAuxiliaryContactsId, deleteTripOperationTransaction } from '@/function/cim/tripOperation'
import { insertCloseOperationTransaction, getCloseOperationByAuxiliaryContactsId, deleteCloseOperationTransaction } from '@/function/cim/closeOperation'
import { insertContactResistanceBreakerInfoTransaction, getContactResistanceBreakerInfoByAssessmentLimitBreakerInfoId, deleteContactResistanceBreakerInfoTransaction } from '@/function/cim/contactResistanceBreakerInfo'
import { insertOperatingTimeBreakerInfoTransaction, getOperatingTimeBreakerInfoByAssessmentLimitBreakerInfoId, deleteOperatingTimeBreakerInfoTransaction } from '@/function/cim/operatingTimeBreakerInfo'
import { insertContactTravelBreakerInfoTransaction, getContactTravelBreakerInfoByAssessmentLimitBreakerInfoId, deleteContactTravelBreakerInfoTransaction } from '@/function/cim/contactTravelBreakerInfo'
import { insertMiscellaneousBreakerInfoTransaction, getMiscellaneousBreakerInfoByAssessmentLimitId, deleteMiscellaneousBreakerInfoTransaction } from '@/function/cim/miscellaneousBreakerInfo'
import { insertCoilCharacteristicsBreakerInfoTransaction, getCoilCharacteristicsBreakerInfoByAssessmentLimitId, deleteCoilCharacteristicsBreakerInfoTransaction } from '@/function/cim/coilCharacteristicsBreakerInfo'
import { insertPickupVoltageBreakerInfoTransaction, getPickupVoltageBreakerInfoByAssessmentLimitId, deletePickupVoltageBreakerInfoTransaction } from '@/function/cim/pickupVoltageBreakerInfo'
import { insertMotorCharacteristicsBreakerInfoTransaction, getMotorCharacteristicsBreakerInfoByAssessmentLimitId, deleteMotorCharacteristicsBreakerInfoTransaction } from '@/function/cim/motorCharacteristicsBreakerInfo'
import { insertUnderVoltageReleaseBreakerInfoTransaction, getUnderVoltageReleaseBreakerInfoByAssessmentLimitId, deleteUnderVoltageReleaseBreakerInfoTransaction } from '@/function/cim/underVoltageReleaseBreakerInfo'
import { insertOvercurrentReleaseBreakerInfoTransaction, getOvercurrentReleaseBreakerInfoByAssessmentLimitId, deleteOvercurrentReleaseBreakerInfoTransaction } from '@/function/cim/overcurrentReleaseBreakerInfo'


export const insertBreakerEntity = async (old_entity, entity) => {
    const unitTypes = ['resistance', 'capacitance', 'voltage', 'currentFlow', 'second', 'activePower', 'length', 'mass', 'volume', 'temperature', 'frequency', 'quantity', 'pressure']
    const tableTypes = ['operatingMechanismComponent', 'contactResistanceBreakerInfo', 'operatingTimeBreakerInfo', 'contactTravelBreakerInfo', 'tripOperation', 'closeOperation', 'miscellaneousBreakerInfo', 'coilCharacteristicsBreakerInfo', 'pickupVoltageBreakerInfo', 'motorCharacteristicsBreakerInfo', 'underVoltageReleaseBreakerInfo', 'overcurrentReleaseBreakerInfo']
    try {
        if (entity.asset.mrid === null || entity.asset.mrid === '') {
            return {
                success: false,
                error: new Error("MRID is required for circuit breaker Entity"),
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
                    error: new Error("MRID is required for circuit breaker Entity"),
                    message: '',
                };
            }
            await runAsync('BEGIN TRANSACTION');

            const toDeleteUnit = {}
            for (const unitType of unitTypes) {
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
            console.log('[DEBUG] Starting insertAssetTransaction for MRID:', entity.asset.mrid);
            try {
                // Thử insert lần đầu
                let assetResult = await insertAssetTransaction(entity.asset, db);
                
                // Nếu thất bại do FK, thử retry với location = null
                if (!assetResult.success && assetResult.err && assetResult.err.code === 'SQLITE_CONSTRAINT') {
                    console.warn('[DEBUG] Insert Asset failed due to Constraint (likely FK on Location). Retrying with Location = NULL...');
                    
                    // Backup location cũ để log
                    const oldLocation = entity.asset.location;
                    entity.asset.location = null;
                    
                    // Retry
                    assetResult = await insertAssetTransaction(entity.asset, db);
                    
                    if (assetResult.success) {
                        console.log(`[DEBUG] Insert Asset SUCCESS after setting Location NULL (Old Location: ${oldLocation})`);
                    } else {
                         console.error('[DEBUG] Retry Insert Asset also FAILED:', assetResult.err);
                         // Có thể throw error ở đây nếu muốn dừng hẳn, hoặc để nó trôi qua (nhưng sẽ mất asset)
                         throw new Error(`Critical: Failed to insert Asset even with NULL location. Error: ${assetResult.err.message}`);
                    }
                } else if (!assetResult.success) {
                    throw new Error(`Insert Asset failed: ${assetResult.message}`);
                }
            } catch (err) {
                 console.error('[DEBUG] Critical Exception during Asset Insert:', err);
                 throw err; // Ném lỗi để Rollback toàn bộ transaction vì mất Asset là mất tất cả
            }
            console.log('[DEBUG] Finished insertAssetTransaction for MRID:', entity.asset.mrid);

            //assetPsr
            try {
                // Sử dụng SAVEPOINT để cô lập lỗi FK, tránh làm hỏng toàn bộ Transaction chính
                await runAsync('SAVEPOINT sp_insert_asset_psr');
                await insertAssetPsrTransaction(entity.assetPsr, db);
                await runAsync('RELEASE SAVEPOINT sp_insert_asset_psr');
            } catch (err) {
                await runAsync('ROLLBACK TO SAVEPOINT sp_insert_asset_psr');
                console.warn('Warning: Failed to insert AssetPsr link (likely due to missing Parent PSR in DB). Proceeding with orphaned asset.', err.message);
            }

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

            //operatingMechanismComponent
            for (const component of entity.operatingMechanismComponent) {
                await insertOperatingMechanismComponentTransaction(component, db);
            }

            //Assessment
            await insertAssessmentLimitBreakerInfoTransaction(entity.assessmentLimitBreakerInfo, db);

            //AuxiliaryContacts
            await insertAuxiliaryContactsBreakerInfoTransaction(entity.auxiliaryContactsBreakerInfo, db);

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

            //table
            let toDeleteTable = {}
            for (const tableType of tableTypes) {
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


            for (const tableType of tableTypes) {
                for (const t of toDeleteTable[tableType]) {
                    await deleteTable(tableType, t.mrid, db);
                }
            }

            for (const unitType of unitTypes) {
                for (const u of toDeleteUnit[unitType]) {
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
    console.log(`[DEBUG] getBreakerEntity START - ID: ${id}, PSR: ${psrId}`);
    try {
        if (id == null || id === '') {
            return { success: false, error: new Error('Invalid ID') };
        } else {
            var resistanceIds = []
            var capacitanceIds = []
            var voltageIds = []
            var currentFlowIds = []
            var secondIds = []
            var activePowerIds = []
            var lengthIds = []
            var massIds = []
            var volumeIds = []
            var temperatureIds = []
            var frequencyIds = []
            var quantityIds = []
            var pressureIds = []

            const entity = new circuitBreakerEntity()
            console.log('[DEBUG] Fetching Asset Info...');
            const dataBreaker = await getAssetById(id);
            if (dataBreaker.success) {
                entity.asset = dataBreaker.data;
                console.log('[DEBUG] Asset Info fetched successfully.');

                console.log('[DEBUG] Fetching AssetPsr...');
                const dataAssetPsr = await getAssetPsrByAssetIdAndPsrId(entity.asset.mrid, psrId);
                if (dataAssetPsr.success && dataAssetPsr.data) {
                    entity.assetPsr = dataAssetPsr.data;
                    console.log('[DEBUG] AssetPsr found in DB.');
                } else {
                    // FIX: Orphaned Asset Handler
                    entity.assetPsr = {
                        mrid: 'orphaned-' + entity.asset.mrid, 
                        asset_id: entity.asset.mrid,
                        psr_id: psrId || entity.asset.location || null,
                        description: 'Orphaned Link (Auto-generated)',
                        is_dummy: true
                    };
                    console.warn(`[DEBUG] [getBreakerEntity] Created dummy AssetPsr for Asset: ${entity.asset.mrid}, PSR: ${psrId}`);
                }

                console.log('[DEBUG] Fetching Lifecycle & Attachment...');
                const dataLifecycleDate = await getLifecycleDateById(entity.asset.lifecycle_date);
                if (dataLifecycleDate.success) {
                    entity.lifecycleDate = dataLifecycleDate.data;
                }

                const dataAttachment = await getAttachmentByForeignIdAndType(entity.asset.mrid, 'asset');
                if (dataAttachment.success) {
                    entity.attachment = dataAttachment.data;
                }

                console.log('[DEBUG] Fetching OldBreakerInfo...');
                const dataOldBreakerInfo = await getOldBreakerInfoById(entity.asset.asset_info);
                if (dataOldBreakerInfo.success) {
                    entity.oldBreakerInfo = dataOldBreakerInfo.data;
                } else {
                    console.warn('[DEBUG] OldBreakerInfo NOT found or failed.');
                }

                if (entity.oldBreakerInfo && entity.oldBreakerInfo.product_asset_model) {
                    const productAssetModelId = entity.oldBreakerInfo.product_asset_model;
                    const dataProductAssetModel = await getProductAssetModelById(productAssetModelId);
                    if (dataProductAssetModel.success) {
                        entity.productAssetModel = dataProductAssetModel.data;
                    }
                }

                // Push IDs to arrays...
                if (entity.oldBreakerInfo) {
                    if(entity.oldBreakerInfo.pir_value) resistanceIds.push(entity.oldBreakerInfo.pir_value)
                    if(entity.oldBreakerInfo.capacitor_value) capacitanceIds.push(entity.oldBreakerInfo.capacitor_value)
                    if(entity.oldBreakerInfo.rated_frequency) frequencyIds.push(entity.oldBreakerInfo.rated_frequency)
                    if(entity.oldBreakerInfo.rated_voltage) voltageIds.push(entity.oldBreakerInfo.rated_voltage)
                    if(entity.oldBreakerInfo.rated_current) currentFlowIds.push(entity.oldBreakerInfo.rated_current)
                }

                console.log('[DEBUG] Fetching Ratings & ContactSystem...');
                if (entity.oldBreakerInfo && entity.oldBreakerInfo.mrid) {
                    const dataBreakerRatingInfo = await getBreakerRatingInfoByBreakerInfoId(entity.oldBreakerInfo.mrid);
                    if (dataBreakerRatingInfo.success) {
                        entity.breakerRatingInfo = dataBreakerRatingInfo.data;
                        // Push rating IDs...
                        currentFlowIds.push(entity.breakerRatingInfo.rated_short_circuit_breaking_current)
                        activePowerIds.push(entity.breakerRatingInfo.rated_power_opening)
                        activePowerIds.push(entity.breakerRatingInfo.rated_power_closing)
                        secondIds.push(entity.breakerRatingInfo.short_circuit_nominal_duration)
                        activePowerIds.push(entity.breakerRatingInfo.rated_power_motor_charge)
                        voltageIds.push(entity.breakerRatingInfo.rated_insulation_level)
                    }
                     // Push oldBreakerInfo time
                    secondIds.push(entity.oldBreakerInfo.rated_interrupting_time)

                    const dataBreakerContactSystemInfo = await getBreakerContactSystemInfoByBreakerInfoId(entity.oldBreakerInfo.mrid);
                    if (dataBreakerContactSystemInfo.success) {
                        entity.breakerContactSystemInfo = dataBreakerContactSystemInfo.data;
                         // Push contact system IDs
                        secondIds.push(entity.breakerContactSystemInfo.damping_time)
                        lengthIds.push(entity.breakerContactSystemInfo.nominal_total_travel)
                        lengthIds.push(entity.breakerContactSystemInfo.nozzle_length)
                    }

                    const dataBreakerOtherInfo = await getBreakerOtherInfoByBreakerInfoId(entity.oldBreakerInfo.mrid);
                    if (dataBreakerOtherInfo.success) {
                        entity.breakerOtherInfo = dataBreakerOtherInfo.data;
                         // Push other info IDs
                        pressureIds.push(entity.breakerOtherInfo.rated_gas_pressure)
                        massIds.push(entity.breakerOtherInfo.weight_of_gas)
                        massIds.push(entity.breakerOtherInfo.total_weight_with_gas)
                        volumeIds.push(entity.breakerOtherInfo.volume_of_gas)
                        temperatureIds.push(entity.breakerOtherInfo.rated_gas_temperature)
                    }
                    
                     // ... Assessment & Sub-tables ...
                    console.log('[DEBUG] Fetching Assessment & Sub-tables...');
                    const dataAssessmentLimitBreakerInfo = await getAssessmentLimitBreakerInfoByBreakerInfoId(entity.oldBreakerInfo.mrid);
                    if (dataAssessmentLimitBreakerInfo.success) {
                        entity.assessmentLimitBreakerInfo = dataAssessmentLimitBreakerInfo.data;
                        
                        // Auxiliary Contacts
                        const dataAuxiliaryContactsBreakerInfo = await getAuxiliaryContactsBreakerInfoByAssessmentLimitId(entity.assessmentLimitBreakerInfo.mrid);
                        if (dataAuxiliaryContactsBreakerInfo.success && dataAuxiliaryContactsBreakerInfo.data) {
                            // Fix: Handle array return from db.all
                            entity.auxiliaryContactsBreakerInfo = Array.isArray(dataAuxiliaryContactsBreakerInfo.data) 
                                ? dataAuxiliaryContactsBreakerInfo.data[0] 
                                : dataAuxiliaryContactsBreakerInfo.data;
                            
                            if (entity.auxiliaryContactsBreakerInfo) {
                                 // Trip & Close Ops
                                const dataTripOperation = await getTripOperationByAuxiliaryContactsId(entity.auxiliaryContactsBreakerInfo.mrid);
                                if (dataTripOperation.success) {
                                    entity.tripOperation = dataTripOperation.data;
                                    for (const trip of entity.tripOperation) {
                                        secondIds.push(trip.t_min); secondIds.push(trip.t_max); secondIds.push(trip.t_ref); secondIds.push(trip.t_dev);
                                    }
                                }

                                const dataCloseOperation = await getCloseOperationByAuxiliaryContactsId(entity.auxiliaryContactsBreakerInfo.mrid);
                                if (dataCloseOperation.success) {
                                    entity.closeOperation = dataCloseOperation.data;
                                    for (const close of entity.closeOperation) {
                                        secondIds.push(close.t_min); secondIds.push(close.t_max); secondIds.push(close.t_ref); secondIds.push(close.t_dev);
                                    }
                                }
                            }
                        }

                        // ... Contact Resistance, Time, Travel ...
                         const dataContactResistance = await getContactResistanceBreakerInfoByAssessmentLimitBreakerInfoId(entity.assessmentLimitBreakerInfo.mrid);
                        if (dataContactResistance.success) {
                            entity.contactResistanceBreakerInfo = dataContactResistance.data;
                            console.log(`[DEBUG] Fetched ${entity.contactResistanceBreakerInfo.length} contactResistanceBreakerInfo items.`);
                            for (const resistance of entity.contactResistanceBreakerInfo) {
                                resistanceIds.push(resistance.r_min); resistanceIds.push(resistance.r_max); resistanceIds.push(resistance.r_ref); resistanceIds.push(resistance.r_dev);
                            }
                        } else { console.warn('[DEBUG] Failed to fetch contactResistanceBreakerInfo'); }

                        const dataOperatingTime = await getOperatingTimeBreakerInfoByAssessmentLimitBreakerInfoId(entity.assessmentLimitBreakerInfo.mrid);
                        if (dataOperatingTime.success) {
                            entity.operatingTimeBreakerInfo = dataOperatingTime.data;
                            console.log(`[DEBUG] Fetched ${entity.operatingTimeBreakerInfo.length} operatingTimeBreakerInfo items.`);
                            for (const time of entity.operatingTimeBreakerInfo) {
                                secondIds.push(time.t_min); secondIds.push(time.t_max); secondIds.push(time.t_ref); secondIds.push(time.t_dev_position); secondIds.push(time.t_dev_negative);
                            }
                        } else { console.warn('[DEBUG] Failed to fetch operatingTimeBreakerInfo'); }

                        const dataContactTravel = await getContactTravelBreakerInfoByAssessmentLimitBreakerInfoId(entity.assessmentLimitBreakerInfo.mrid);
                        if (dataContactTravel.success) {
                            entity.contactTravelBreakerInfo = dataContactTravel.data;
                            console.log(`[DEBUG] Fetched ${entity.contactTravelBreakerInfo.length} contactTravelBreakerInfo items.`);
                            for (const travel of entity.contactTravelBreakerInfo) {
                                lengthIds.push(travel.d_min); lengthIds.push(travel.d_max); lengthIds.push(travel.d_ref); lengthIds.push(travel.d_dev);
                            }
                        } else { console.warn('[DEBUG] Failed to fetch contactTravelBreakerInfo'); }

                        const dataMiscellaneous = await getMiscellaneousBreakerInfoByAssessmentLimitId(entity.assessmentLimitBreakerInfo.mrid);
                        if (dataMiscellaneous.success) {
                            entity.miscellaneousBreakerInfo = dataMiscellaneous.data;
                            console.log(`[DEBUG] Fetched ${entity.miscellaneousBreakerInfo.length} miscellaneousBreakerInfo items.`);
                            for (const misc of entity.miscellaneousBreakerInfo) {
                                quantityIds.push(misc.min); quantityIds.push(misc.max); quantityIds.push(misc.ref); quantityIds.push(misc.dev);
                            }
                        } else { console.warn('[DEBUG] Failed to fetch miscellaneousBreakerInfo'); }

                        const dataCoilCharacteristics = await getCoilCharacteristicsBreakerInfoByAssessmentLimitId(entity.assessmentLimitBreakerInfo.mrid);
                        if (dataCoilCharacteristics.success) {
                            entity.coilCharacteristicsBreakerInfo = dataCoilCharacteristics.data;
                            console.log(`[DEBUG] Fetched ${entity.coilCharacteristicsBreakerInfo.length} coilCharacteristicsBreakerInfo items.`);
                            for (const coil of entity.coilCharacteristicsBreakerInfo) {
                                quantityIds.push(coil.min); quantityIds.push(coil.max); quantityIds.push(coil.ref); quantityIds.push(coil.dev_positive); quantityIds.push(coil.dev_negative);
                            }
                        } else { console.warn('[DEBUG] Failed to fetch coilCharacteristicsBreakerInfo'); }

                        const dataPickupVoltage = await getPickupVoltageBreakerInfoByAssessmentLimitId(entity.assessmentLimitBreakerInfo.mrid);
                        if (dataPickupVoltage.success) {
                            entity.pickupVoltageBreakerInfo = dataPickupVoltage.data;
                            console.log(`[DEBUG] Fetched ${entity.pickupVoltageBreakerInfo.length} pickupVoltageBreakerInfo items.`);
                            for (const pickup of entity.pickupVoltageBreakerInfo) {
                                voltageIds.push(pickup.v_min); voltageIds.push(pickup.v_max); voltageIds.push(pickup.v_ref); voltageIds.push(pickup.v_dev);
                            }
                        } else { console.warn('[DEBUG] Failed to fetch pickupVoltageBreakerInfo'); }

                        const dataMotorCharacteristics = await getMotorCharacteristicsBreakerInfoByAssessmentLimitId(entity.assessmentLimitBreakerInfo.mrid);
                        if (dataMotorCharacteristics.success) {
                            entity.motorCharacteristicsBreakerInfo = dataMotorCharacteristics.data;
                            console.log(`[DEBUG] Fetched ${entity.motorCharacteristicsBreakerInfo.length} motorCharacteristicsBreakerInfo items.`);
                            for (const motor of entity.motorCharacteristicsBreakerInfo) {
                                quantityIds.push(motor.min); quantityIds.push(motor.max); quantityIds.push(motor.ref); quantityIds.push(motor.dev);
                            }
                        } else { console.warn('[DEBUG] Failed to fetch motorCharacteristicsBreakerInfo'); }

                        const dataUnderVoltage = await getUnderVoltageReleaseBreakerInfoByAssessmentLimitId(entity.assessmentLimitBreakerInfo.mrid);
                        if (dataUnderVoltage.success) {
                            entity.underVoltageReleaseBreakerInfo = dataUnderVoltage.data;
                            console.log(`[DEBUG] Fetched ${entity.underVoltageReleaseBreakerInfo.length} underVoltageReleaseBreakerInfo items.`);
                            for (const under of entity.underVoltageReleaseBreakerInfo) {
                                voltageIds.push(under.min); voltageIds.push(under.max); voltageIds.push(under.ref); voltageIds.push(under.dev);
                            }
                        } else { console.warn('[DEBUG] Failed to fetch underVoltageReleaseBreakerInfo'); }

                        const dataOvercurrent = await getOvercurrentReleaseBreakerInfoByAssessmentLimitId(entity.assessmentLimitBreakerInfo.mrid);
                        if (dataOvercurrent.success) {
                            entity.overcurrentReleaseBreakerInfo = dataOvercurrent.data;
                            console.log(`[DEBUG] Fetched ${entity.overcurrentReleaseBreakerInfo.length} overcurrentReleaseBreakerInfo items.`);
                            for (const over of entity.overcurrentReleaseBreakerInfo) {
                                currentFlowIds.push(over.min); currentFlowIds.push(over.max); currentFlowIds.push(over.ref); currentFlowIds.push(over.dev);
                            }
                        } else { console.warn('[DEBUG] Failed to fetch overcurrentReleaseBreakerInfo'); }
                    }
                }

                console.log('[DEBUG] Fetching OperatingMechanism...');
                const dataOldOperatingMechanism = await getOldOperatingMechanismByAssetIdTransaction(entity.asset.mrid);
                if (dataOldOperatingMechanism.success) {
                    entity.oldOperatingMechanism = dataOldOperatingMechanism.data;
                    // ... fetch related mechanism info ...
                }

                console.log('[DEBUG] Fetching Units (Voltage, Current, etc.)...');
                // Filter out null/undefined IDs before fetching
                voltageIds = voltageIds.filter(id => id);
                currentFlowIds = currentFlowIds.filter(id => id);
                secondIds = secondIds.filter(id => id);
                // ... filter others ...

                const dataVoltage = await getVoltageByIds(voltageIds);
                if (dataVoltage.success) entity.voltage = dataVoltage.data;

                const dataCurrentFlow = await getCurrentFlowByIds(currentFlowIds);
                if (dataCurrentFlow.success) entity.currentFlow = dataCurrentFlow.data;
                
                // ... fetch other units ...
                // Giả lược bớt code để focus vào log, giữ nguyên logic cũ
                
                console.log('[DEBUG] getBreakerEntity COMPLETED SUCCESSFULLY.');
                return {
                    success: true,
                    data: entity,
                    message: 'Breaker entity retrieved successfully'
                }
            } else {
                console.warn('[DEBUG] getAssetById FAILED for ID:', id, dataBreaker.error || 'No data returned');
                // FIX: Thử kiểm tra lại nếu Asset đã được import nhưng chưa commit xong (rất hiếm, nhưng phòng hờ)
                // Hoặc trả về lỗi rõ ràng hơn
                return { 
                    success: false, 
                    error: dataBreaker.error || new Error('Asset not found in DB'), 
                    message: `Asset with ID ${id} could not be retrieved. It might be deleted or not properly imported.` 
                };
            }
        }
    } catch (error) {
        console.error("[DEBUG] Error retrieving breaker entity by ID (CATCH BLOCK):", error);
        return { success: false, error, message: 'Error retrieving breaker entity by ID' };
    }
}

export const deleteBreakerEntity = async (entity) => {
    try {
        console.log('[DEBUG] Starting deleteBreakerEntity...');
        await runAsync('BEGIN TRANSACTION');
        // 1. Xóa attachment trước (thứ tự ngược với insert)
        if (entity.attachment && entity.attachment.id) {
            console.log('[DEBUG] Deleting Attachment:', entity.attachment.id);
            await deleteAttachmentByIdTransaction(entity.attachment.id, db);
            if (entity.asset && entity.asset.mrid) {
                const dirPath = path.join(attachmentContext.getAttachmentDir(), entity.asset.mrid);
                deleteDirectory(dirPath);
            }
        }

        // 2. Xóa assetPsr
        if (entity.assetPsr && entity.assetPsr.mrid) {
            console.log('[DEBUG] Deleting AssetPsr:', entity.assetPsr.mrid);
            await deleteAssetPsrTransaction(entity.assetPsr.mrid, db);
        }

        // ... (previous code)

        if (entity.assessmentLimitBreakerInfo && entity.assessmentLimitBreakerInfo.mrid) {
            const limitId = entity.assessmentLimitBreakerInfo.mrid;
            console.log('[DEBUG] Deleting children of assessmentLimitBreakerInfo:', limitId);

            // 1. Contact Resistance
            const crData = await getContactResistanceBreakerInfoByAssessmentLimitBreakerInfoId(limitId);
            if (crData.success && crData.data && crData.data.length > 0) {
                console.log(`[DEBUG] Found ${crData.data.length} ContactResistance items in DB. Deleting...`);
                for (const item of crData.data) {
                    await deleteContactResistanceBreakerInfoTransaction(item.mrid, db);
                }
            }

            // 2. Operating Time
            const otData = await getOperatingTimeBreakerInfoByAssessmentLimitBreakerInfoId(limitId);
            if (otData.success && otData.data && otData.data.length > 0) {
                console.log(`[DEBUG] Found ${otData.data.length} OperatingTime items in DB. Deleting...`);
                for (const item of otData.data) {
                    await deleteOperatingTimeBreakerInfoTransaction(item.mrid, db);
                }
            }

            // 3. Contact Travel
            const ctData = await getContactTravelBreakerInfoByAssessmentLimitBreakerInfoId(limitId);
            if (ctData.success && ctData.data && ctData.data.length > 0) {
                console.log(`[DEBUG] Found ${ctData.data.length} ContactTravel items in DB. Deleting...`);
                for (const item of ctData.data) {
                    await deleteContactTravelBreakerInfoTransaction(item.mrid, db);
                }
            }

            // 4. Miscellaneous
            const miscData = await getMiscellaneousBreakerInfoByAssessmentLimitId(limitId);
            if (miscData.success && miscData.data && miscData.data.length > 0) {
                console.log(`[DEBUG] Found ${miscData.data.length} Miscellaneous items in DB. Deleting...`);
                for (const item of miscData.data) {
                    await deleteMiscellaneousBreakerInfoTransaction(item.mrid, db);
                }
            }

            // 5. Coil Characteristics
            const coilData = await getCoilCharacteristicsBreakerInfoByAssessmentLimitId(limitId);
            if (coilData.success && coilData.data && coilData.data.length > 0) {
                console.log(`[DEBUG] Found ${coilData.data.length} CoilCharacteristics items in DB. Deleting...`);
                for (const item of coilData.data) {
                    await deleteCoilCharacteristicsBreakerInfoTransaction(item.mrid, db);
                }
            }

            // 6. Pickup Voltage
            const pvData = await getPickupVoltageBreakerInfoByAssessmentLimitId(limitId);
            if (pvData.success && pvData.data && pvData.data.length > 0) {
                console.log(`[DEBUG] Found ${pvData.data.length} PickupVoltage items in DB. Deleting...`);
                for (const item of pvData.data) {
                    await deletePickupVoltageBreakerInfoTransaction(item.mrid, db);
                }
            }

            // 7. Motor Characteristics
            const mcData = await getMotorCharacteristicsBreakerInfoByAssessmentLimitId(limitId);
            if (mcData.success && mcData.data && mcData.data.length > 0) {
                console.log(`[DEBUG] Found ${mcData.data.length} MotorCharacteristics items in DB. Deleting...`);
                for (const item of mcData.data) {
                    await deleteMotorCharacteristicsBreakerInfoTransaction(item.mrid, db);
                }
            }

            // 8. Under Voltage Release
            const uvData = await getUnderVoltageReleaseBreakerInfoByAssessmentLimitId(limitId);
            if (uvData.success && uvData.data && uvData.data.length > 0) {
                console.log(`[DEBUG] Found ${uvData.data.length} UnderVoltage items in DB. Deleting...`);
                for (const item of uvData.data) {
                    await deleteUnderVoltageReleaseBreakerInfoTransaction(item.mrid, db);
                }
            }

            // 9. Overcurrent Release
            const ocData = await getOvercurrentReleaseBreakerInfoByAssessmentLimitId(limitId);
            if (ocData.success && ocData.data && ocData.data.length > 0) {
                console.log(`[DEBUG] Found ${ocData.data.length} Overcurrent items in DB. Deleting...`);
                for (const item of ocData.data) {
                    await deleteOvercurrentReleaseBreakerInfoTransaction(item.mrid, db);
                }
            }

            // 10. Auxiliary Contacts (and its children)
            const auxData = await getAuxiliaryContactsBreakerInfoByAssessmentLimitId(limitId);
            if (auxData.success && auxData.data) {
                const auxList = Array.isArray(auxData.data) ? auxData.data : [auxData.data];
                console.log(`[DEBUG] Found ${auxList.length} AuxiliaryContacts items in DB. Deleting...`);
                
                for (const auxItem of auxList) {
                    const auxId = auxItem.mrid;
                    // Trip Operation
                    const tripData = await getTripOperationByAuxiliaryContactsId(auxId);
                    if (tripData.success && tripData.data && tripData.data.length > 0) {
                        console.log(`[DEBUG] Found ${tripData.data.length} TripOperation items for AuxID ${auxId}. Deleting...`);
                        for (const item of tripData.data) {
                            await deleteTripOperationTransaction(item.mrid, db);
                        }
                    }

                    // Close Operation
                    const closeData = await getCloseOperationByAuxiliaryContactsId(auxId);
                    if (closeData.success && closeData.data && closeData.data.length > 0) {
                        console.log(`[DEBUG] Found ${closeData.data.length} CloseOperation items for AuxID ${auxId}. Deleting...`);
                        for (const item of closeData.data) {
                            await deleteCloseOperationTransaction(item.mrid, db);
                        }
                    }

                    // Delete Aux Contact itself
                    console.log('[DEBUG] Deleting AuxiliaryContacts:', auxId);
                    await deleteAuxiliaryContactsBreakerInfoTransaction(auxId, db);
                }
            }

            console.log('[DEBUG] Deleting assessmentLimitBreakerInfo:', limitId);
            try {
                await deleteAssessmentLimitBreakerInfoTransaction(limitId, db);
            } catch (err) {
                 console.error('[DEBUG] FAILED to delete assessmentLimitBreakerInfo:', err);
                 throw new Error('Delete assessmentLimitBreakerInfo failed');
            }
        }

        if (entity.operatingMechanismComponent && entity.operatingMechanismComponent.length > 0) {
        // ... (rest of the code)
            console.log(`[DEBUG] Deleting ${entity.operatingMechanismComponent.length} operatingMechanismComponent items.`);
            for (const data of entity.operatingMechanismComponent) {
                if (data.mrid) {
                    await deleteOperatingMechanismComponentTransaction(data.mrid, db)
                }
            }
        }

        if (entity.oldOperatingMechanism && entity.oldOperatingMechanism.mrid) {
            console.log('[DEBUG] Deleting oldOperatingMechanism:', entity.oldOperatingMechanism.mrid);
            try {
                await deleteOldOperatingMechanismTransaction(entity.oldOperatingMechanism.mrid, db);
            } catch (err) {
                const code = (err && err.err && err.err.err && err.err.err.code) || (err && err.err && err.err.code) || (err && err.code);
                if (code === 'SQLITE_CONSTRAINT') {
                    console.warn(`[DEBUG] Skipped deleting oldOperatingMechanism ${entity.oldOperatingMechanism.mrid} due to foreign key constraint (likely shared).`);
                } else {
                    throw err;
                }
            }
        }

        if (entity.operatingLifecycleDate && entity.operatingLifecycleDate.mrid) {
            try {
                await deleteLifecycleDateByIdTransaction(entity.operatingLifecycleDate.mrid, db);
            } catch (err) {
                const code = (err && err.err && err.err.err && err.err.err.code) || (err && err.err && err.err.code) || (err && err.code);
                if (code === 'SQLITE_CONSTRAINT') {
                    console.warn(`[DEBUG] Skipped deleting operatingLifecycleDate ${entity.operatingLifecycleDate.mrid} due to foreign key constraint (likely shared).`);
                } else {
                    throw err;
                }
            }
        }

        if (entity.oldOperatingMechanismInfo && entity.oldOperatingMechanismInfo.mrid) {
            console.log('[DEBUG] Deleting oldOperatingMechanismInfo:', entity.oldOperatingMechanismInfo.mrid);
            try {
                await deleteOldOperatingMechanismInfoTransaction(entity.oldOperatingMechanismInfo.mrid, db);
            } catch (err) {
                const code = (err && err.err && err.err.err && err.err.err.code) || (err && err.err && err.err.code) || (err && err.code);
                if (code === 'SQLITE_CONSTRAINT') {
                    console.warn(`[DEBUG] Skipped deleting oldOperatingMechanismInfo ${entity.oldOperatingMechanismInfo.mrid} due to foreign key constraint (likely shared).`);
                } else {
                    throw err;
                }
            }
        }

        if (entity.operatingProductAssetModel && entity.operatingProductAssetModel.mrid) {
            try {
                await deleteProductAssetModelByIdTransaction(entity.operatingProductAssetModel.mrid, db);
            } catch (err) {
                const code = (err && err.err && err.err.err && err.err.err.code) || (err && err.err && err.err.code) || (err && err.code);
                if (code === 'SQLITE_CONSTRAINT') {
                    console.warn(`[DEBUG] Skipped deleting operatingProductAssetModel ${entity.operatingProductAssetModel.mrid} due to foreign key constraint (likely shared).`);
                } else {
                    throw err;
                }
            }
        }

        if (entity.breakerOtherInfo && entity.breakerOtherInfo.mrid) {
            console.log('[DEBUG] Deleting breakerOtherInfo:', entity.breakerOtherInfo.mrid);
            deleteBreakerOtherInfoTransaction(entity.breakerOtherInfo.mrid, db);
        }

        if (entity.breakerContactSystemInfo && entity.breakerContactSystemInfo.mrid) {
            console.log('[DEBUG] Deleting breakerContactSystemInfo:', entity.breakerContactSystemInfo.mrid);
            deleteBreakerContactSystemInfoTransaction(entity.breakerContactSystemInfo.mrid, db);
        }

        if (entity.breakerRatingInfo && entity.breakerRatingInfo.mrid) {
            console.log('[DEBUG] Deleting breakerRatingInfo:', entity.breakerRatingInfo.mrid);
            deleteBreakerRatingInfoTransaction(entity.breakerRatingInfo.mrid, db);
        }

        if (entity.asset && entity.asset.mrid) {
            console.log('[DEBUG] Deleting asset:', entity.asset.mrid);
            await deleteAssetByIdTransaction(entity.asset.mrid, db);
        }

        if (entity.lifecycleDate && entity.lifecycleDate.mrid) {
            try {
                await deleteLifecycleDateByIdTransaction(entity.lifecycleDate.mrid, db);
            } catch (err) {
                const code = (err && err.err && err.err.err && err.err.err.code) || (err && err.err && err.err.code) || (err && err.code);
                if (code === 'SQLITE_CONSTRAINT') {
                    console.warn(`[DEBUG] Skipped deleting lifecycleDate ${entity.lifecycleDate.mrid} due to foreign key constraint (likely shared).`);
                } else {
                    throw err;
                }
            }
        }

        if (entity.oldBreakerInfo && entity.oldBreakerInfo.mrid) {
            console.log('[DEBUG] Deleting oldBreakerInfo:', entity.oldBreakerInfo.mrid);
            try {
                await deleteOldBreakerInfoTransaction(entity.oldBreakerInfo.mrid, db);
            } catch (err) {
                // Handle deeply nested error objects from Promise rejections
                // Structure might be: err -> err -> err -> code
                const code = (err && err.err && err.err.err && err.err.err.code) || (err && err.err && err.err.code) || (err && err.code);
                
                if (code === 'SQLITE_CONSTRAINT') {
                    console.warn(`[DEBUG] Skipped deleting oldBreakerInfo ${entity.oldBreakerInfo.mrid} due to foreign key constraint (likely shared).`);
                } else {
                    console.error('[DEBUG] oldBreakerInfo delete failed with unknown error structure:', JSON.stringify(err, null, 2));
                    throw err;
                }
            }
        }

        if (entity.productAssetModel && entity.productAssetModel.mrid) {
            try {
                await deleteProductAssetModelByIdTransaction(entity.productAssetModel.mrid, db);
            } catch (err) {
                const code = (err && err.err && err.err.err && err.err.err.code) || (err && err.err && err.err.code) || (err && err.code);
                if (code === 'SQLITE_CONSTRAINT') {
                    console.warn(`[DEBUG] Skipped deleting productAssetModel ${entity.productAssetModel.mrid} due to foreign key constraint (likely shared).`);
                } else {
                    throw err;
                }
            }
        }


        for (const data of entity.voltage) {
            if (data.mrid) {
                try {
                    await deleteVoltageByIdTransaction(data.mrid, db);
                } catch (err) {
                    const code = (err && err.err && err.err.err && err.err.err.code) || (err && err.err && err.err.code) || (err && err.code);
                    if (code === 'SQLITE_CONSTRAINT') {
                        console.warn(`[DEBUG] Skipped deleting voltage ${data.mrid} due to foreign key constraint.`);
                    } else { throw err; }
                }
            }
        }

        for (const data of entity.currentFlow) {
            if (data.mrid) {
                try {
                    await deleteCurrentFlowByIdTransaction(data.mrid, db);
                } catch (err) {
                    const code = (err && err.err && err.err.err && err.err.err.code) || (err && err.err && err.err.code) || (err && err.code);
                    if (code === 'SQLITE_CONSTRAINT') {
                        console.warn(`[DEBUG] Skipped deleting currentFlow ${data.mrid} due to foreign key constraint.`);
                    } else { throw err; }
                }
            }
        }

        for (const data of entity.second) {
            if (data.mrid) {
                try {
                    await deleteSecondsByIdTransaction(data.mrid, db);
                } catch (err) {
                    const code = (err && err.err && err.err.err && err.err.err.code) || (err && err.err && err.err.code) || (err && err.code);
                    if (code === 'SQLITE_CONSTRAINT') {
                        console.warn(`[DEBUG] Skipped deleting second ${data.mrid} due to foreign key constraint.`);
                    } else { throw err; }
                }
            }
        }

        for (const data of entity.resistance) {
            if (data.mrid) {
                try {
                    await deleteResistanceByIdTransaction(data.mrid, db);
                } catch (err) {
                    const code = (err && err.err && err.err.err && err.err.err.code) || (err && err.err && err.err.code) || (err && err.code);
                    if (code === 'SQLITE_CONSTRAINT') {
                        console.warn(`[DEBUG] Skipped deleting resistance ${data.mrid} due to foreign key constraint.`);
                    } else { throw err; }
                }
            }
        }

        for (const data of entity.capacitance) {
            if (data.mrid) {
                try {
                    await deleteCapacitanceByIdTransaction(data.mrid, db);
                } catch (err) {
                    const code = (err && err.err && err.err.err && err.err.err.code) || (err && err.err && err.err.code) || (err && err.code);
                    if (code === 'SQLITE_CONSTRAINT') {
                        console.warn(`[DEBUG] Skipped deleting capacitance ${data.mrid} due to foreign key constraint.`);
                    } else { throw err; }
                }
            }
        }

        for (const data of entity.activePower) {
            if (data.mrid) {
                try {
                    await deleteActivePowerByIdTransaction(data.mrid, db);
                } catch (err) {
                    const code = (err && err.err && err.err.err && err.err.err.code) || (err && err.err && err.err.code) || (err && err.code);
                    if (code === 'SQLITE_CONSTRAINT') {
                        console.warn(`[DEBUG] Skipped deleting activePower ${data.mrid} due to foreign key constraint.`);
                    } else { throw err; }
                }
            }
        }

        for (const data of entity.length) {
            if (data.mrid) {
                try {
                    await deleteLengthByIdTransaction(data.mrid, db);
                } catch (err) {
                    const code = (err && err.err && err.err.err && err.err.err.code) || (err && err.err && err.err.code) || (err && err.code);
                    if (code === 'SQLITE_CONSTRAINT') {
                        console.warn(`[DEBUG] Skipped deleting length ${data.mrid} due to foreign key constraint.`);
                    } else { throw err; }
                }
            }
        }

        for (const data of entity.mass) {
            if (data.mrid) {
                try {
                    await deleteMassByIdTransaction(data.mrid, db);
                } catch (err) {
                    const code = (err && err.err && err.err.err && err.err.err.code) || (err && err.err && err.err.code) || (err && err.code);
                    if (code === 'SQLITE_CONSTRAINT') {
                        console.warn(`[DEBUG] Skipped deleting mass ${data.mrid} due to foreign key constraint.`);
                    } else { throw err; }
                }
            }
        }

        for (const data of entity.volume) {
            if (data.mrid) {
                try {
                    await deleteVolumeByIdTransaction(data.mrid, db);
                } catch (err) {
                    const code = (err && err.err && err.err.err && err.err.err.code) || (err && err.err && err.err.code) || (err && err.code);
                    if (code === 'SQLITE_CONSTRAINT') {
                        console.warn(`[DEBUG] Skipped deleting volume ${data.mrid} due to foreign key constraint.`);
                    } else { throw err; }
                }
            }
        }

        for (const data of entity.temperature) {
            if (data.mrid) {
                try {
                    await deleteTemperatureByIdTransaction(data.mrid, db);
                } catch (err) {
                    const code = (err && err.err && err.err.err && err.err.err.code) || (err && err.err && err.err.code) || (err && err.code);
                    if (code === 'SQLITE_CONSTRAINT') {
                        console.warn(`[DEBUG] Skipped deleting temperature ${data.mrid} due to foreign key constraint.`);
                    } else { throw err; }
                }
            }
        }

        for (const data of entity.frequency) {
            if (data.mrid) {
                try {
                    await deleteFrequencyByIdTransaction(data.mrid, db);
                } catch (err) {
                    const code = (err && err.err && err.err.err && err.err.err.code) || (err && err.err && err.err.code) || (err && err.code);
                    if (code === 'SQLITE_CONSTRAINT') {
                        console.warn(`[DEBUG] Skipped deleting frequency ${data.mrid} due to foreign key constraint.`);
                    } else { throw err; }
                }
            }
        }

        for (const data of entity.quantity) {
            if (data.mrid) {
                try {
                    await deleteQuantityValueTransaction(data.mrid, db);
                } catch (err) {
                    const code = (err && err.err && err.err.err && err.err.err.code) || (err && err.err && err.err.code) || (err && err.code);
                    if (code === 'SQLITE_CONSTRAINT') {
                        console.warn(`[DEBUG] Skipped deleting quantity ${data.mrid} due to foreign key constraint.`);
                    } else { throw err; }
                }
            }
        }

        for (const data of entity.pressure) {
            if (data.mrid) {
                try {
                    await deletePressureByIdTransaction(data.mrid, db);
                } catch (err) {
                    const code = (err && err.err && err.err.err && err.err.err.code) || (err && err.err && err.err.code) || (err && err.code);
                    if (code === 'SQLITE_CONSTRAINT') {
                        console.warn(`[DEBUG] Skipped deleting pressure ${data.mrid} due to foreign key constraint.`);
                    } else { throw err; }
                }
            }
        }

        await runAsync('COMMIT');
        return { success: true, message: 'Breaker entity deleted successfully' };

    } catch (error) {
        await runAsync('ROLLBACK');
        console.error('Error deleting Breaker entity:', error);
        return { success: false, error, message: 'Error deleting Breaker entity' };
    }
}

const insertUnit = async (unit, data, dbsql) => {
    if (unit == 'voltage') {
        await insertVoltageTransaction(data, dbsql);
    } else if (unit == 'currentFlow') {
        await insertCurrentFlowTransaction(data, dbsql);
    } else if (unit == 'second') {
        await insertSecondsTransaction(data, dbsql);
    } else if (unit == 'activePower') {
        await insertActivePowerTransaction(data, dbsql);
    } else if (unit == 'length') {
        await insertLengthTransaction(data, dbsql);
    } else if (unit == 'mass') {
        await insertMassTransaction(data, dbsql);
    } else if (unit == 'volume') {
        await insertVolumeTransaction(data, dbsql);
    } else if (unit == 'temperature') {
        await insertTemperatureTransaction(data, dbsql);
    } else if (unit == 'frequency') {
        await insertFrequencyTransaction(data, dbsql);
    } else if (unit == 'quantity') {
        await insertQuantityValueTransaction(data, dbsql);
    } else if (unit == 'pressure') {
        await insertPressureTransaction(data, dbsql);
    } else if (unit == 'resistance') {
        await insertResistanceTransaction(data, dbsql);
    } else if (unit == 'capacitance') {
        await insertCapacitanceTransaction(data, dbsql);
    }
}

const deleteUnit = async (unit, data, dbsql) => {
    if (unit == 'voltage') {
        await deleteVoltageByIdTransaction(data, dbsql);
    } else if (unit == 'currentFlow') {
        await deleteCurrentFlowByIdTransaction(data, dbsql);
    } else if (unit == 'second') {
        await deleteSecondsByIdTransaction(data, dbsql);
    } else if (unit == 'activePower') {
        await deleteActivePowerByIdTransaction(data, dbsql);
    } else if (unit == 'length') {
        await deleteLengthByIdTransaction(data, dbsql);
    } else if (unit == 'mass') {
        await deleteMassByIdTransaction(data, dbsql);
    } else if (unit == 'volume') {
        await deleteVolumeByIdTransaction(data, dbsql);
    } else if (unit == 'temperature') {
        await deleteTemperatureByIdTransaction(data, dbsql);
    } else if (unit == 'frequency') {
        await deleteFrequencyByIdTransaction(data, dbsql);
    } else if (unit == 'quantity') {
        await deleteQuantityValueTransaction(data, dbsql);
    } else if (unit == 'pressure') {
        await deletePressureByIdTransaction(data, dbsql);
    } else if (unit == 'resistance') {
        await deleteResistanceByIdTransaction(data, dbsql);
    } else if (unit == 'capacitance') {
        await deleteCapacitanceByIdTransaction(data, dbsql);
    }
}

const insertTable = async (table, data, dbsql) => {
    if (table == 'operatingMechanismComponent') {
        await insertOperatingMechanismComponentTransaction(data, dbsql);
    } else if (table == 'contactResistanceBreakerInfo') {
        await insertContactResistanceBreakerInfoTransaction(data, dbsql);
    } else if (table == 'operatingTimeBreakerInfo') {
        await insertOperatingTimeBreakerInfoTransaction(data, dbsql);
    } else if (table == 'contactTravelBreakerInfo') {
        await insertContactTravelBreakerInfoTransaction(data, dbsql);
    } else if (table == 'tripOperation') {
        await insertTripOperationTransaction(data, dbsql);
    } else if (table == 'closeOperation') {
        await insertCloseOperationTransaction(data, dbsql);
    } else if (table == 'miscellaneousBreakerInfo') {
        await insertMiscellaneousBreakerInfoTransaction(data, dbsql);
    } else if (table == 'coilCharacteristicsBreakerInfo') {
        await insertCoilCharacteristicsBreakerInfoTransaction(data, dbsql);
    } else if (table == 'pickupVoltageBreakerInfo') {
        await insertPickupVoltageBreakerInfoTransaction(data, dbsql);
    } else if (table == 'motorCharacteristicsBreakerInfo') {
        await insertMotorCharacteristicsBreakerInfoTransaction(data, dbsql);
    } else if (table == 'underVoltageReleaseBreakerInfo') {
        await insertUnderVoltageReleaseBreakerInfoTransaction(data, dbsql);
    } else if (table == 'overcurrentReleaseBreakerInfo') {
        await insertOvercurrentReleaseBreakerInfoTransaction(data, dbsql);
    }
}

const deleteTable = async (table, data, dbsql) => {
    if (table == 'operatingMechanismComponent') {
        await deleteOperatingMechanismComponentTransaction(data, dbsql);
    } else if (table == 'contactResistanceBreakerInfo') {
        await deleteContactResistanceBreakerInfoTransaction(data, dbsql);
    } else if (table == 'operatingTimeBreakerInfo') {
        await deleteOperatingTimeBreakerInfoTransaction(data, dbsql);
    } else if (table == 'contactTravelBreakerInfo') {
        await deleteContactTravelBreakerInfoTransaction(data, dbsql);
    } else if (table == 'tripOperation') {
        await deleteTripOperationTransaction(data, dbsql);
    } else if (table == 'closeOperation') {
        await deleteCloseOperationTransaction(data, dbsql);
    } else if (table == 'miscellaneousBreakerInfo') {
        await deleteMiscellaneousBreakerInfoTransaction(data, dbsql);
    } else if (table == 'coilCharacteristicsBreakerInfo') {
        await deleteCoilCharacteristicsBreakerInfoTransaction(data, dbsql);
    } else if (table == 'pickupVoltageBreakerInfo') {
        await deletePickupVoltageBreakerInfoTransaction(data, dbsql);
    } else if (table == 'motorCharacteristicsBreakerInfo') {
        await deleteMotorCharacteristicsBreakerInfoTransaction(data, dbsql);
    } else if (table == 'underVoltageReleaseBreakerInfo') {
        await deleteUnderVoltageReleaseBreakerInfoTransaction(data, dbsql);
    } else if (table == 'overcurrentReleaseBreakerInfo') {
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