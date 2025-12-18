
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
            const dataBreaker = await getAssetById(id);
            if (dataBreaker.success) {
                entity.asset = dataBreaker.data;

                const dataAssetPsr = await getAssetPsrByAssetIdAndPsrId(entity.asset.mrid, psrId);
                if (dataAssetPsr.success) {
                    entity.assetPsr = dataAssetPsr.data;
                }

                const dataLifecycleDate = await getLifecycleDateById(entity.asset.lifecycle_date);
                if (dataLifecycleDate.success) {
                    entity.lifecycleDate = dataLifecycleDate.data;
                }

                const dataAttachment = await getAttachmentByForeignIdAndType(entity.asset.mrid, 'asset');
                if (dataAttachment.success) {
                    entity.attachment = dataAttachment.data;
                }

                const dataOldBreakerInfo = await getOldBreakerInfoById(entity.asset.asset_info);
                if (dataOldBreakerInfo.success) {
                    entity.oldBreakerInfo = dataOldBreakerInfo.data;
                }

                const productAssetModelId = entity.oldBreakerInfo.product_asset_model;
                const dataProductAssetModel = await getProductAssetModelById(productAssetModelId);
                if (dataProductAssetModel.success) {
                    entity.productAssetModel = dataProductAssetModel.data;
                }

                resistanceIds.push(entity.oldBreakerInfo.pir_value)
                capacitanceIds.push(entity.oldBreakerInfo.capacitor_value)
                frequencyIds.push(entity.oldBreakerInfo.rated_frequency)
                voltageIds.push(entity.oldBreakerInfo.rated_voltage)
                currentFlowIds.push(entity.oldBreakerInfo.rated_current)

                const dataBreakerRatingInfo = await getBreakerRatingInfoByBreakerInfoId(entity.oldBreakerInfo.mrid);
                if (dataBreakerRatingInfo.success) {
                    entity.breakerRatingInfo = dataBreakerRatingInfo.data;
                }

                currentFlowIds.push(entity.breakerRatingInfo.rated_short_circuit_breaking_current)
                activePowerIds.push(entity.breakerRatingInfo.rated_power_opening)
                activePowerIds.push(entity.breakerRatingInfo.rated_power_closing)
                secondIds.push(entity.breakerRatingInfo.short_circuit_nominal_duration)
                secondIds.push(entity.oldBreakerInfo.rated_interrupting_time)
                activePowerIds.push(entity.breakerRatingInfo.rated_power_motor_charge)
                voltageIds.push(entity.breakerRatingInfo.rated_insulation_level)

                const dataBreakerContactSystemInfo = await getBreakerContactSystemInfoByBreakerInfoId(entity.oldBreakerInfo.mrid);
                if (dataBreakerContactSystemInfo.success) {
                    entity.breakerContactSystemInfo = dataBreakerContactSystemInfo.data;
                }

                secondIds.push(entity.breakerContactSystemInfo.damping_time)
                lengthIds.push(entity.breakerContactSystemInfo.nominal_total_travel)
                lengthIds.push(entity.breakerContactSystemInfo.nozzle_length)

                const dataBreakerOtherInfo = await getBreakerOtherInfoByBreakerInfoId(entity.oldBreakerInfo.mrid);
                if (dataBreakerOtherInfo.success) {
                    entity.breakerOtherInfo = dataBreakerOtherInfo.data;
                }

                pressureIds.push(entity.breakerOtherInfo.rated_gas_pressure)
                massIds.push(entity.breakerOtherInfo.weight_of_gas)
                massIds.push(entity.breakerOtherInfo.total_weight_with_gas)
                volumeIds.push(entity.breakerOtherInfo.volume_of_gas)
                temperatureIds.push(entity.breakerOtherInfo.rated_gas_temperature)

                const dataOldOperatingMechanism = await getOldOperatingMechanismByAssetIdTransaction(entity.asset.mrid);
                if (dataOldOperatingMechanism.success) {
                    entity.oldOperatingMechanism = dataOldOperatingMechanism.data;
                }

                const dataLifecycleDateOperatingMechanism = await getLifecycleDateById(entity.oldOperatingMechanism.lifecycle_date);
                if (dataLifecycleDateOperatingMechanism.success) {
                    entity.operatingLifecycleDate = dataLifecycleDateOperatingMechanism.data;
                }

                const dataOperatingProductAssetModel = await getProductAssetModelById(entity.oldOperatingMechanism.product_asset_model);
                if (dataOperatingProductAssetModel.success) {
                    entity.operatingProductAssetModel = dataOperatingProductAssetModel.data;
                }

                const dataOldOperatingMechanismInfo = await getOldOperatingMechanismInfoById(entity.oldOperatingMechanism.asset_info);
                if (dataOldOperatingMechanismInfo.success) {
                    entity.oldOperatingMechanismInfo = dataOldOperatingMechanismInfo.data;
                }

                voltageIds.push(entity.oldOperatingMechanismInfo.rated_auxiliary_circuit_voltage)
                currentFlowIds.push(entity.oldOperatingMechanismInfo.rated_auxiliary_circuit_current)
                frequencyIds.push(entity.oldOperatingMechanismInfo.rated_auxiliary_circuit_frequency)
                voltageIds.push(entity.oldOperatingMechanismInfo.rated_motor_voltage)
                currentFlowIds.push(entity.oldOperatingMechanismInfo.rated_motor_current)
                frequencyIds.push(entity.oldOperatingMechanismInfo.rated_motor_frequency)
                pressureIds.push(entity.oldOperatingMechanismInfo.rated_operating_pressure)
                temperatureIds.push(entity.oldOperatingMechanismInfo.rated_operating_pressure_temperature)

                const dataOperatingMechanismComponent = await getOperatingMechanismComponentByOperatingMechanismId(entity.oldOperatingMechanism.mrid);
                if (dataOperatingMechanismComponent.success) {
                    entity.operatingMechanismComponent = dataOperatingMechanismComponent.data;
                    for (const component of entity.operatingMechanismComponent) {
                        frequencyIds.push(component.rated_frequency)
                        voltageIds.push(component.rated_voltage)
                        currentFlowIds.push(component.rated_current)
                    }
                }

                const dataAssessmentLimitBreakerInfo = await getAssessmentLimitBreakerInfoByBreakerInfoId(entity.oldBreakerInfo.mrid);
                if (dataAssessmentLimitBreakerInfo.success) {
                    entity.assessmentLimitBreakerInfo = dataAssessmentLimitBreakerInfo.data;
                }

                const dataAuxiliaryContactsBreakerInfo = await getAuxiliaryContactsBreakerInfoByAssessmentLimitId(entity.assessmentLimitBreakerInfo.mrid);
                if (dataAuxiliaryContactsBreakerInfo.success) {
                    entity.auxiliaryContactsBreakerInfo = dataAuxiliaryContactsBreakerInfo.data;
                }

                const dataContactResistance = await getContactResistanceBreakerInfoByAssessmentLimitBreakerInfoId(entity.assessmentLimitBreakerInfo.mrid);
                if (dataContactResistance.success) {
                    entity.contactResistanceBreakerInfo = dataContactResistance.data;
                    for (const resistance of entity.contactResistanceBreakerInfo) {
                        resistanceIds.push(resistance.r_min)
                        resistanceIds.push(resistance.r_max)
                        resistanceIds.push(resistance.r_ref)
                        resistanceIds.push(resistance.r_dev)
                    }
                }

                const dataOperatingTime = await getOperatingTimeBreakerInfoByAssessmentLimitBreakerInfoId(entity.assessmentLimitBreakerInfo.mrid);
                if (dataOperatingTime.success) {
                    entity.operatingTimeBreakerInfo = dataOperatingTime.data;
                    for (const time of entity.operatingTimeBreakerInfo) {
                        secondIds.push(time.t_min)
                        secondIds.push(time.t_max)
                        secondIds.push(time.t_ref)
                        secondIds.push(time.t_dev_position)
                        secondIds.push(time.t_dev_negative)
                    }
                }

                const dataContactTravel = await getContactTravelBreakerInfoByAssessmentLimitBreakerInfoId(entity.assessmentLimitBreakerInfo.mrid);
                if (dataContactTravel.success) {
                    entity.contactTravelBreakerInfo = dataContactTravel.data;
                    for (const travel of entity.contactTravelBreakerInfo) {
                        lengthIds.push(travel.d_min)
                        lengthIds.push(travel.d_max)
                        lengthIds.push(travel.d_ref)
                        lengthIds.push(travel.d_dev)
                    }
                }

                const dataTripOperation = await getTripOperationByAuxiliaryContactsId(entity.auxiliaryContactsBreakerInfo.mrid);
                if (dataTripOperation.success) {
                    entity.tripOperation = dataTripOperation.data;
                    for (const trip of entity.tripOperation) {
                        secondIds.push(trip.t_min)
                        secondIds.push(trip.t_max)
                        secondIds.push(trip.t_ref)
                        secondIds.push(trip.t_dev)
                    }
                }

                const dataCloseOperation = await getCloseOperationByAuxiliaryContactsId(entity.auxiliaryContactsBreakerInfo.mrid);
                if (dataCloseOperation.success) {
                    entity.closeOperation = dataCloseOperation.data;
                    for (const close of entity.closeOperation) {
                        secondIds.push(close.t_min)
                        secondIds.push(close.t_max)
                        secondIds.push(close.t_ref)
                        secondIds.push(close.t_dev)
                    }
                }

                const dataMiscellaneous = await getMiscellaneousBreakerInfoByAssessmentLimitId(entity.assessmentLimitBreakerInfo.mrid);
                if (dataMiscellaneous.success) {
                    entity.miscellaneousBreakerInfo = dataMiscellaneous.data;
                    for (const misc of entity.miscellaneousBreakerInfo) {
                        quantityIds.push(misc.min)
                        quantityIds.push(misc.max)
                        quantityIds.push(misc.ref)
                        quantityIds.push(misc.dev)
                    }
                }

                const dataCoilCharacteristics = await getCoilCharacteristicsBreakerInfoByAssessmentLimitId(entity.assessmentLimitBreakerInfo.mrid)
                if (dataCoilCharacteristics.success) {
                    entity.coilCharacteristicsBreakerInfo = dataCoilCharacteristics.data;
                    for (const coil of entity.coilCharacteristicsBreakerInfo) {
                        quantityIds.push(coil.min)
                        quantityIds.push(coil.max)
                        quantityIds.push(coil.ref)
                        quantityIds.push(coil.dev_negative)
                        quantityIds.push(coil.dev_positive)

                    }
                }

                const dataPickupVoltage = await getPickupVoltageBreakerInfoByAssessmentLimitId(entity.assessmentLimitBreakerInfo.mrid)
                if (dataPickupVoltage.success) {
                    entity.pickupVoltageBreakerInfo = dataPickupVoltage.data;
                    for (const pickup of entity.pickupVoltageBreakerInfo) {
                        voltageIds.push(pickup.v_min)
                        voltageIds.push(pickup.v_max)
                        voltageIds.push(pickup.v_ref)
                        voltageIds.push(pickup.v_dev)
                    }
                }

                const dataMotorCharacteristics = await getMotorCharacteristicsBreakerInfoByAssessmentLimitId(entity.assessmentLimitBreakerInfo.mrid)
                if (dataMotorCharacteristics.success) {
                    entity.motorCharacteristicsBreakerInfo = dataMotorCharacteristics.data;
                    for (const motor of entity.motorCharacteristicsBreakerInfo) {
                        quantityIds.push(motor.min)
                        quantityIds.push(motor.max)
                        quantityIds.push(motor.ref)
                        quantityIds.push(motor.dev)
                    }
                }

                const dataUnderVoltageRelease = await getUnderVoltageReleaseBreakerInfoByAssessmentLimitId(entity.assessmentLimitBreakerInfo.mrid)
                if (dataUnderVoltageRelease.success) {
                    entity.underVoltageReleaseBreakerInfo = dataUnderVoltageRelease.data;
                    for (const under of entity.underVoltageReleaseBreakerInfo) {
                        voltageIds.push(under.min)
                        voltageIds.push(under.max)
                        voltageIds.push(under.ref)
                        voltageIds.push(under.dev)
                    }
                }

                const dataOvercurrentRelease = await getOvercurrentReleaseBreakerInfoByAssessmentLimitId(entity.assessmentLimitBreakerInfo.mrid)
                if (dataOvercurrentRelease.success) {
                    entity.overcurrentReleaseBreakerInfo = dataOvercurrentRelease.data;
                    for (const over of entity.overcurrentReleaseBreakerInfo) {
                        currentFlowIds.push(over.min)
                        currentFlowIds.push(over.max)
                        currentFlowIds.push(over.ref)
                        currentFlowIds.push(over.dev)
                    }
                }

                const dataVoltage = await getVoltageByIds(voltageIds);
                if (dataVoltage.success) {
                    entity.voltage = dataVoltage.data;
                }

                const dataCurrentFlow = await getCurrentFlowByIds(currentFlowIds);
                if (dataCurrentFlow.success) {
                    entity.currentFlow = dataCurrentFlow.data;
                }

                const dataSecond = await getSecondByIds(secondIds);
                if (dataSecond.success) {
                    entity.second = dataSecond.data;
                }

                const dataResistance = await getResistanceByIds(resistanceIds);
                if (dataResistance.success) {
                    entity.resistance = dataResistance.data;
                }

                const dataCapacitance = await getCapacitanceByIds(capacitanceIds);
                if (dataCapacitance.success) {
                    entity.capacitance = dataCapacitance.data;
                }

                const dataActivePower = await getActivePowerByIds(activePowerIds);
                if (dataActivePower.success) {
                    entity.activePower = dataActivePower.data;
                }

                const dataLength = await getLengthByIds(lengthIds);
                if (dataLength.success) {
                    entity.length = dataLength.data;
                }

                const dataMass = await getMassByIds(massIds);
                if (dataMass.success) {
                    entity.mass = dataMass.data;
                }

                const dataVolume = await getVolumeByIds(volumeIds);
                if (dataVolume.success) {
                    entity.volume = dataVolume.data;
                }

                const dataTemperature = await getTemperatureByIds(temperatureIds);
                if (dataTemperature.success) {
                    entity.temperature = dataTemperature.data;
                }

                const dataFrequency = await getFrequencyByIds(frequencyIds);
                if (dataFrequency.success) {
                    entity.frequency = dataFrequency.data;
                }

                const dataQuantity = await getQuantityValueByIds(quantityIds);
                if (dataQuantity.success) {
                    entity.quantity = dataQuantity.data;
                }

                const dataPressure = await getPressureByIds(pressureIds);
                if (dataPressure.success) {
                    entity.pressure = dataPressure.data;
                }

                return {
                    success: true,
                    data: entity,
                    message: 'Breaker entity retrieved successfully'
                }
            } else {
                return { success: false, error: dataBreaker.error, message: dataBreaker.message };
            }
        }
    } catch (error) {
        console.error("Error retrieving breaker entity by ID:", error);
        return { success: false, error, message: 'Error retrieving breaker entity by ID' };
    }
}

export const deleteBreakerEntity = async (entity) => {
    try {
        await runAsync('BEGIN TRANSACTION');
        // 1. Xóa attachment trước (thứ tự ngược với insert)
        if (entity.attachment && entity.attachment.id) {
            await deleteAttachmentByIdTransaction(entity.attachment.id, db);
            if (entity.asset && entity.asset.mrid) {
                const dirPath = path.join(attachmentContext.getAttachmentDir(), entity.asset.mrid);
                deleteDirectory(dirPath);
            }
        }

        // 2. Xóa assetPsr
        if (entity.assetPsr && entity.assetPsr.mrid) {
            await deleteAssetPsrTransaction(entity.assetPsr.mrid, db);
        }

        for (const data of entity.contactResistanceBreakerInfo) {
            if (data.mrid) {
                await deleteContactResistanceBreakerInfoTransaction(data.mrid, db);
            }
        }

        for (const data of entity.operatingTimeBreakerInfo) {
            if (data.mrid) {
                await deleteOperatingTimeBreakerInfoTransaction(data.mrid, db);
            }
        }

        for (const data of entity.contactTravelBreakerInfo) {
            if (data.mrid) {
                await deleteContactTravelBreakerInfoTransaction(data.mrid, db);
            }
        }

        for (const data of entity.tripOperation) {
            if (data.mrid) {
                await deleteTripOperationTransaction(data.mrid, db);
            }
        }

        for (const data of entity.closeOperation) {
            if (data.mrid) {
                await deleteCloseOperationTransaction(data.mrid, db);
            }
        }

        if (entity.auxiliaryContactsBreakerInfo && entity.auxiliaryContactsBreakerInfo.mrid) {
            await deleteAuxiliaryContactsBreakerInfoTransaction(entity.auxiliaryContactsBreakerInfo.mrid, db);
        }

        for (const data of entity.miscellaneousBreakerInfo) {
            if (data.mrid) {
                await deleteMiscellaneousBreakerInfoTransaction(data.mrid, db);
            }
        }

        for (const data of entity.coilCharacteristicsBreakerInfo) {
            if (data.mrid) {
                await deleteCoilCharacteristicsBreakerInfoTransaction(data.mrid, db);
            }
        }

        for (const data of entity.pickupVoltageBreakerInfo) {
            if (data.mrid) {
                await deletePickupVoltageBreakerInfoTransaction(data.mrid, db);
            }
        }

        for (const data of entity.motorCharacteristicsBreakerInfo) {
            if (data.mrid) {
                await deleteMotorCharacteristicsBreakerInfoTransaction(data.mrid, db);
            }
        }

        for (const data of entity.underVoltageReleaseBreakerInfo) {
            if (data.mrid) {
                await deleteUnderVoltageReleaseBreakerInfoTransaction(data.mrid, db);
            }
        }

        for (const data of entity.overcurrentReleaseBreakerInfo) {
            if (data.mrid) {
                await deleteOvercurrentReleaseBreakerInfoTransaction(data.mrid, db);
            }
        }

        if (entity.assessmentLimitBreakerInfo && entity.assessmentLimitBreakerInfo.mrid) {
            await deleteAssessmentLimitBreakerInfoTransaction(entity.assessmentLimitBreakerInfo.mrid, db);
        }

        for (const data of entity.operatingMechanismComponent) {
            if (data.mrid) {
                await deleteOperatingMechanismComponentTransaction(data.mrid, db)
            }
        }

        if (entity.oldOperatingMechanism && entity.oldOperatingMechanism.mrid) {
            await deleteOldOperatingMechanismTransaction(entity.oldOperatingMechanism.mrid, db);
        }

        if (entity.operatingLifecycleDate && entity.operatingLifecycleDate.mrid) {
            await deleteLifecycleDateByIdTransaction(entity.operatingLifecycleDate.mrid, db);
        }

        if (entity.oldOperatingMechanismInfo && entity.oldOperatingMechanismInfo.mrid) {
            await deleteOldOperatingMechanismInfoTransaction(entity.oldOperatingMechanismInfo.mrid, db);
        }

        if (entity.operatingProductAssetModel && entity.operatingProductAssetModel.mrid) {
            await deleteProductAssetModelByIdTransaction(entity.operatingProductAssetModel.mrid, db);
        }

        if (entity.breakerOtherInfo && entity.breakerOtherInfo.mrid) {
            deleteBreakerOtherInfoTransaction(entity.breakerOtherInfo.mrid, db);
        }

        if (entity.breakerContactSystemInfo && entity.breakerContactSystemInfo.mrid) {
            deleteBreakerContactSystemInfoTransaction(entity.breakerContactSystemInfo.mrid, db);
        }

        if (entity.breakerRatingInfo && entity.breakerRatingInfo.mrid) {
            deleteBreakerRatingInfoTransaction(entity.breakerRatingInfo.mrid, db);
        }

        if (entity.asset && entity.asset.mrid) {
            await deleteAssetByIdTransaction(entity.asset.mrid, db);
        }

        if (entity.lifecycleDate && entity.lifecycleDate.mrid) {
            await deleteLifecycleDateByIdTransaction(entity.lifecycleDate.mrid, db);
        }

        if (entity.oldBreakerInfo && entity.oldBreakerInfo.mrid) {
            await deleteOldBreakerInfoTransaction(entity.oldBreakerInfo.mrid, db);
        }

        if (entity.productAssetModel && entity.productAssetModel.mrid) {
            await deleteProductAssetModelByIdTransaction(entity.productAssetModel.mrid, db);
        }

        for (const data of entity.voltage) {
            if (data.mrid) {
                await deleteVoltageByIdTransaction(data.mrid, db);
            }
        }

        for (const data of entity.currentFlow) {
            if (data.mrid) {
                await deleteCurrentFlowByIdTransaction(data.mrid, db);
            }
        }

        for (const data of entity.second) {
            if (data.mrid) {
                await deleteSecondsByIdTransaction(data.mrid, db);
            }
        }

        for (const data of entity.resistance) {
            if (data.mrid) {
                await deleteResistanceByIdTransaction(data.mrid, db);
            }
        }

        for (const data of entity.capacitance) {
            if (data.mrid) {
                await deleteCapacitanceByIdTransaction(data.mrid, db);
            }
        }

        for (const data of entity.activePower) {
            if (data.mrid) {
                await deleteActivePowerByIdTransaction(data.mrid, db);
            }
        }

        for (const data of entity.length) {
            if (data.mrid) {
                await deleteLengthByIdTransaction(data.mrid, db);
            }
        }

        for (const data of entity.mass) {
            if (data.mrid) {
                await deleteMassByIdTransaction(data.mrid, db);
            }
        }

        for (const data of entity.volume) {
            if (data.mrid) {
                await deleteVolumeByIdTransaction(data.mrid, db);
            }
        }

        for (const data of entity.temperature) {
            if (data.mrid) {
                await deleteTemperatureByIdTransaction(data.mrid, db);
            }
        }

        for (const data of entity.frequency) {
            if (data.mrid) {
                await deleteFrequencyByIdTransaction(data.mrid, db);
            }
        }

        for (const data of entity.quantity) {
            if (data.mrid) {
                await deleteQuantityValueTransaction(data.mrid, db);
            }
        }

        for (const data of entity.pressure) {
            if (data.mrid) {
                await deletePressureByIdTransaction(data.mrid, db);
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