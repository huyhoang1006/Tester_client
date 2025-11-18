/* eslint-disable */
import CircuitBreakerEntity from "../../Entity/CircuitBreaker"
import CircuitBreakerDto from "../../Dto/CircuitBreaker"
import Resistance from "@/views/Cim/Resistance";
import Capacitance from "@/views/Cim/Capacitance";
import Frequency from "../../Cim/Frequency";
import Voltage from "../../Cim/Voltage";
import CurrentFlow from "../../Cim/CurrentFlow";
import Temperature from "../../Cim/Temperature";
import Seconds from "../../Cim/Seconds";
import ActivePower from "../../Cim/ActivePower";
import Length from '../../Cim/Length'
import Mass from '../../Cim/Mass'
import Volume from '../../Cim/Volume'
import Pressure from '../../Cim/Pressure'
import QuantityValue from '../../Cim/QuantityValue'
import OperatingMechanismComponent from "../../Cim/OperatingMechanismComponent";
import ContactResistanceBreakerInfo from "../../Cim/ContactResistanceBreakerInfo"
import OperatingTimeBreakerInfo from "../../Cim/OperatingTimeBreakerInfo"
import ContactTravelBreakerInfo from "../../Cim/ContactTravelBreakerInfo"
import TripOperation from "../../Cim/TripOperation"
import CloseOperation from "../../Cim/CloseOperation"
import MiscellaneousBreakerInfo from "../../Cim/MiscellaneousBreakerInfo"
import CoilCharacteristicsBreakerInfo from "../../Cim/CoilCharacteristicsBreakerInfo"
import PickupVoltageBreakerInfo from "../../Cim/PickupVoltageBreakerInfo"
import MotorCharacteristicsBreakerInfo from "../../Cim/MotorCharacteristicsBreakerInfo"
import UnderVoltageReleaseBreakerInfo from "../../Cim/UnderVoltageReleaseBreakerInfo"
import OvercurrentReleaseBreakerInfo from "../../Cim/OvercurrentReleaseBreakerInfo"

import * as breaker_constant from "../../AssetView/CircuitBreaker/components/assessment"


export function mapDtoToEntity(dto) {
    const entity = new CircuitBreakerEntity()
    entity.asset.mrid = dto.properties.mrid || null;
    entity.asset.kind = dto.properties.kind || null;
    entity.asset.type = dto.properties.type || null;
    entity.asset.serial_number = dto.properties.serial_no || null;
    entity.asset.asset_info = dto.assetInfoId || null;
    entity.asset.product_asset_model = dto.productAssetModelId || null;
    entity.productAssetModel.manufacturer = dto.properties.manufacturer || null;
    entity.productAssetModel.mrid = dto.productAssetModelId || null;
    entity.oldBreakerInfo.manufacturer_type = dto.properties.manufacturer_type || null;
    entity.oldBreakerInfo.product_asset_model = dto.productAssetModelId || null;
    entity.asset.country_of_origin = dto.properties.country_of_origin || null;
    entity.oldBreakerInfo.mrid = dto.assetInfoId || null;
    entity.asset.name = dto.properties.apparatus_id || null;
    entity.asset.description = dto.properties.comment || null;
    entity.asset.location = dto.locationId || null;

    /** ---------- Lifecycle ---------- */
    entity.lifecycleDate.mrid = dto.lifecycleDateId || null;
    entity.lifecycleDate.manufactured_date = dto.properties.manufacturer_year || null;
    entity.asset.lifecycle_date = dto.lifecycleDateId || null;

    /** ---------- assetPsr ---------- */
    entity.assetPsr.mrid = dto.assetPsrId || null;
    entity.assetPsr.asset_id = dto.properties.mrid || null;
    entity.assetPsr.psr_id = dto.psrId || null;

    /** ---------- attachment ---------- */
    entity.attachment.mrid = dto.attachmentId || null;
    entity.attachment = dto.attachment || null;

    entity.oldBreakerInfo.phase_number = dto.circuitBreaker.numberOfPhases || null
    entity.oldBreakerInfo.number_of_interrupters_per_phase = dto.circuitBreaker.interruptersPerPhase || null
    entity.oldBreakerInfo.pole_operation = dto.circuitBreaker.poleOperation || null
    entity.oldBreakerInfo.pir = dto.circuitBreaker.hasPIR || null

    entity.oldBreakerInfo.pir_value = dto.circuitBreaker.pirValue.mrid || null;
    const resistance = new Resistance()
    mappingUnit(resistance, dto.circuitBreaker.pirValue);
    entity.resistance.push(resistance);

    entity.oldBreakerInfo.grading_capacitors = dto.circuitBreaker.hasGradingCapacitors || null
    
    entity.oldBreakerInfo.capacitor_value = dto.circuitBreaker.capacitorValue.mrid || null;
    const capacitance = new Capacitance()
    mappingUnit(capacitance, dto.circuitBreaker.capacitorValue);
    entity.capacitance.push(capacitance);

    entity.oldBreakerInfo.interrupting_medium = dto.circuitBreaker.interruptingMedium || null
    entity.oldBreakerInfo.tank_type = dto.circuitBreaker.tankType || null

    //rating
    entity.breakerRatingInfo.mrid = dto.breakerRatingInfoId || null
    entity.oldBreakerInfo.rated_frequency = dto.ratings.rated_frequency.mrid || null;
    if(dto.ratings.rated_frequency.value != 'Custom') {
        const frequency = new Frequency()
        mappingUnit(frequency, dto.ratings.rated_frequency);
        entity.frequency.push(frequency);
    } else {
        const frequency = new Frequency()
        mappingUnit(frequency, dto.ratings.rated_frequency_custom);
        entity.frequency.push(frequency);
    }

    entity.oldBreakerInfo.rated_voltage = dto.ratings.rated_voltage_ll.mrid || null;
    const voltage = new Voltage()
    mappingUnit(voltage, dto.ratings.rated_voltage_ll);
    entity.voltage.push(voltage);

    entity.oldBreakerInfo.rated_current = dto.ratings.rated_current.mrid || null;
    const current = new CurrentFlow()
    mappingUnit(current, dto.ratings.rated_current);
    entity.currentFlow.push(current);

    entity.breakerRatingInfo.rated_short_circuit_breaking_current = dto.ratings.rated_short_circuit_breaking_current.mrid || null
    const shortCircuitBreakingCurrent = new CurrentFlow()
    mappingUnit(shortCircuitBreakingCurrent, dto.ratings.rated_short_circuit_breaking_current);
    entity.currentFlow.push(shortCircuitBreakingCurrent);

    entity.breakerRatingInfo.short_circuit_nominal_duration = dto.ratings.short_circuit_nominal_duration.mrid || null
    const shortCircuitNominalDuration = new Seconds()
    mappingUnit(shortCircuitNominalDuration, dto.ratings.short_circuit_nominal_duration);
    entity.second.push(shortCircuitNominalDuration);

    entity.breakerRatingInfo.rated_insulation_level = dto.ratings.rated_insulation_level.mrid || null
    const insulationLevel = new Voltage()
    mappingUnit(insulationLevel, dto.ratings.rated_insulation_level);
    entity.voltage.push(insulationLevel);

    entity.oldBreakerInfo.rated_interrupting_time = dto.ratings.rated_interrupting_time.mrid || null
    const ratedInterruptingTime = new Seconds()
    mappingUnit(ratedInterruptingTime, dto.ratings.rated_interrupting_time);
    entity.second.push(ratedInterruptingTime);

    entity.breakerRatingInfo.interrupting_duty_cycle = dto.ratings.interrupting_duty_cycle || null
    entity.breakerRatingInfo.breaker_info_id = dto.assetInfoId || null

    entity.breakerRatingInfo.rated_power_closing = dto.ratings.rated_power_at_closing.mrid || null
    const ratedPowerClosing = new ActivePower()
    mappingUnit(ratedPowerClosing, dto.ratings.rated_power_at_closing);
    entity.activePower.push(ratedPowerClosing);

    entity.breakerRatingInfo.rated_power_opening = dto.ratings.rated_power_at_opening.mrid || null
    const ratedPowerOpening = new ActivePower()
    mappingUnit(ratedPowerOpening, dto.ratings.rated_power_at_opening);
    entity.activePower.push(ratedPowerOpening);

    entity.breakerRatingInfo.rated_power_motor_charge = dto.ratings.rated_power_at_motor_charge.mrid || null
    const ratedPowerMotorCharge = new ActivePower()
    mappingUnit(ratedPowerMotorCharge, dto.ratings.rated_power_at_motor_charge);
    entity.activePower.push(ratedPowerMotorCharge);

    entity.breakerContactSystemInfo.mrid = dto.breakerContactSystemInfoId || null
    entity.breakerContactSystemInfo.breaker_info_id = dto.assetInfoId || null

    entity.breakerContactSystemInfo.nominal_total_travel = dto.contactSystem.nominal_total_travel.mrid || null
    const nominalTotalTravel = new Length()
    mappingUnit(nominalTotalTravel, dto.contactSystem.nominal_total_travel);
    entity.length.push(nominalTotalTravel);
    
    entity.breakerContactSystemInfo.damping_time = dto.contactSystem.damping_time.mrid || null
    const dampingTime = new Seconds()
    mappingUnit(dampingTime, dto.contactSystem.damping_time);
    entity.second.push(dampingTime);

    entity.breakerContactSystemInfo.nozzle_length = dto.contactSystem.nozzle_length.mrid || null
    const nozzleLength = new Length()
    mappingUnit(nozzleLength, dto.contactSystem.nozzle_length);
    entity.length.push(nozzleLength);

    entity.breakerOtherInfo.mrid = dto.breakerOtherInfoId || null
    entity.breakerOtherInfo.breaker_info_id = dto.assetInfoId || null

    entity.breakerOtherInfo.total_weight_with_gas = dto.others.total_weight_with_gas.mrid || null
    const totalWeightWithGas = new Mass()
    mappingUnit(totalWeightWithGas, dto.others.total_weight_with_gas);
    entity.mass.push(totalWeightWithGas);

    entity.breakerOtherInfo.weight_of_gas = dto.others.weight_of_gas.mrid || null
    const weightOfGas = new Mass()
    mappingUnit(weightOfGas, dto.others.weight_of_gas);
    entity.mass.push(weightOfGas);

    entity.breakerOtherInfo.volume_of_gas = dto.others.volume_of_gas.mrid || null
    const volumeOfGas = new Volume()
    mappingUnit(volumeOfGas, dto.others.volume_of_gas);
    entity.volume.push(volumeOfGas);

    entity.breakerOtherInfo.rated_gas_pressure = dto.others.rated_gas_pressure.mrid || null
    const ratedGasPressure = new Pressure()
    mappingUnit(ratedGasPressure, dto.others.rated_gas_pressure);
    entity.pressure.push(ratedGasPressure);

    entity.breakerOtherInfo.rated_gas_temperature = dto.others.rated_gas_temperature.mrid || null
    const ratedGasTemperature = new Temperature()
    mappingUnit(ratedGasTemperature, dto.others.rated_gas_temperature);
    entity.temperature.push(ratedGasTemperature);

    entity.oldOperatingMechanism.mrid = dto.operatingMechanismId || null
    entity.oldOperatingMechanism.asset_id = dto.properties.mrid || null;
    entity.oldOperatingMechanism.asset_info = dto.operatingMechanismInfoId || null;
    entity.oldOperatingMechanism.type = dto.operating.type || null;
    entity.oldOperatingMechanism.description = dto.operating.comment || null;
    entity.oldOperatingMechanism.serial_number = dto.operating.serial_no || null;
    entity.oldOperatingMechanism.product_asset_model = dto.operatingMechanismProductAssetModelId || null;
    entity.operatingProductAssetModel.mrid = dto.operatingMechanismProductAssetModelId || null;
    entity.operatingProductAssetModel.manufacturer = dto.operating.manufacturer || null;
    entity.oldOperatingMechanismInfo.mrid = dto.operatingMechanismInfoId || null;
    entity.oldOperatingMechanismInfo.product_asset_model = dto.operatingMechanismProductAssetModelId || null;
    entity.oldOperatingMechanismInfo.manufacturer_type = dto.operating.manufacturer_type || null;

    /** ---------- Lifecycle operating ---------- */
    entity.operatingLifecycleDate.mrid = dto.operatingMechanismLifecycleDateId || null;
    entity.operatingLifecycleDate.manufactured_date = dto.operating.manufacturer_year || null;
    entity.oldOperatingMechanism.lifecycle_date = dto.operatingMechanismLifecycleDateId || null;

    entity.oldOperatingMechanism.number_of_trip_coil = dto.operating.number_of_trip_coil || null;
    entity.oldOperatingMechanism.number_of_close_coil = dto.operating.number_of_close_coil || null;


    entity.oldOperatingMechanismInfo.auxiliary_circuit_power_type = dto.operating.auxiliary_circuits.power || null;
    entity.oldOperatingMechanismInfo.rated_auxiliary_circuit_current = dto.operating.auxiliary_circuits.rated_current.mrid || null;
    const ratedAuxiliaryCircuitCurrent = new CurrentFlow()
    mappingUnit(ratedAuxiliaryCircuitCurrent, dto.operating.auxiliary_circuits.rated_current);
    entity.currentFlow.push(ratedAuxiliaryCircuitCurrent);

    entity.oldOperatingMechanismInfo.rated_auxiliary_circuit_voltage = dto.operating.auxiliary_circuits.rated_voltage.mrid || null;
    const ratedAuxiliaryCircuitVoltage = new Voltage()
    mappingUnit(ratedAuxiliaryCircuitVoltage, dto.operating.auxiliary_circuits.rated_voltage);
    entity.voltage.push(ratedAuxiliaryCircuitVoltage);

    entity.oldOperatingMechanismInfo.rated_auxiliary_circuit_frequency = dto.operating.auxiliary_circuits.frequency.mrid || null;
    const ratedAuxiliaryCircuitFrequency = new Frequency()
    mappingUnit(ratedAuxiliaryCircuitFrequency, dto.operating.auxiliary_circuits.frequency);
    entity.frequency.push(ratedAuxiliaryCircuitFrequency);

    entity.oldOperatingMechanismInfo.motor_power_type = dto.operating.motor.power || null;
    entity.oldOperatingMechanismInfo.rated_motor_current = dto.operating.motor.rated_current.mrid || null;
    const ratedMotorCurrent = new CurrentFlow()
    mappingUnit(ratedMotorCurrent, dto.operating.motor.rated_current);
    entity.currentFlow.push(ratedMotorCurrent);

    entity.oldOperatingMechanismInfo.rated_motor_voltage = dto.operating.motor.rated_voltage.mrid || null;
    const ratedMotorVoltage = new Voltage()
    mappingUnit(ratedMotorVoltage, dto.operating.motor.rated_voltage);
    entity.voltage.push(ratedMotorVoltage);

    entity.oldOperatingMechanismInfo.rated_motor_frequency = dto.operating.motor.frequency.mrid || null;
    const ratedMotorFrequency = new Frequency()
    mappingUnit(ratedMotorFrequency, dto.operating.motor.frequency);
    entity.frequency.push(ratedMotorFrequency);

    entity.oldOperatingMechanismInfo.rated_operating_pressure = dto.operating.rated_operating_pressure.mrid || null;
    const ratedOperatingPressure = new Pressure()
    mappingUnit(ratedOperatingPressure, dto.operating.rated_operating_pressure);
    entity.pressure.push(ratedOperatingPressure);

    entity.oldOperatingMechanismInfo.rated_operating_pressure_temperature = dto.operating.rated_operating_pressure_temperature.mrid || null;
    const ratedOperatingPressureTemperature = new Temperature()
    mappingUnit(ratedOperatingPressureTemperature, dto.operating.rated_operating_pressure_temperature);
    entity.temperature.push(ratedOperatingPressureTemperature);

    for(const i in dto.operating.trip_coil_component) {
        const tripCoilComponent = new OperatingMechanismComponent()
        tripCoilComponent.mrid = dto.operating.trip_coil_component[i].mrid || null
        tripCoilComponent.operating_mechanism_id = dto.operatingMechanismId || null
        tripCoilComponent.component = dto.operating.trip_coil_component[i].component || null

        tripCoilComponent.rated_current = dto.operating.trip_coil_component[i].rated_current.mrid || null
        const ratedCurrent = new CurrentFlow()
        mappingUnit(ratedCurrent, dto.operating.trip_coil_component[i].rated_current);
        entity.currentFlow.push(ratedCurrent);

        tripCoilComponent.rated_voltage = dto.operating.trip_coil_component[i].rated_voltage.mrid || null
        const ratedVoltage = new Voltage()
        mappingUnit(ratedVoltage, dto.operating.trip_coil_component[i].rated_voltage);
        entity.voltage.push(ratedVoltage);

        tripCoilComponent.rated_frequency = dto.operating.trip_coil_component[i].frequency.mrid || null
        const ratedFrequency = new Frequency()
        mappingUnit(ratedFrequency, dto.operating.trip_coil_component[i].frequency);
        entity.frequency.push(ratedFrequency);

        tripCoilComponent.power_type = dto.operating.trip_coil_component[i].power || null
        entity.operatingMechanismComponent.push(tripCoilComponent);
    }

    for(const i in dto.operating.close_coil_component) {
        const closeCoilComponent = new OperatingMechanismComponent()
        closeCoilComponent.mrid = dto.operating.close_coil_component[i].mrid || null
        closeCoilComponent.operating_mechanism_id = dto.operatingMechanismId || null
        closeCoilComponent.component = dto.operating.close_coil_component[i].component || null

        closeCoilComponent.rated_current = dto.operating.close_coil_component[i].rated_current.mrid || null
        const ratedCurrent = new CurrentFlow()
        mappingUnit(ratedCurrent, dto.operating.close_coil_component[i].rated_current);
        entity.currentFlow.push(ratedCurrent);

        closeCoilComponent.rated_voltage = dto.operating.close_coil_component[i].rated_voltage.mrid || null
        const ratedVoltage = new Voltage()
        mappingUnit(ratedVoltage, dto.operating.close_coil_component[i].rated_voltage);
        entity.voltage.push(ratedVoltage);

        closeCoilComponent.rated_frequency = dto.operating.close_coil_component[i].frequency.mrid || null
        const ratedFrequency = new Frequency()
        mappingUnit(ratedFrequency, dto.operating.close_coil_component[i].frequency);
        entity.frequency.push(ratedFrequency);

        closeCoilComponent.power_type = dto.operating.close_coil_component[i].power || null
        entity.operatingMechanismComponent.push(closeCoilComponent);
    }

    entity.assessmentLimitBreakerInfo.mrid = dto.assessmentLimitBreakerInfoId || null
    entity.assessmentLimitBreakerInfo.breaker_info_id = dto.assetInfoId || null
    entity.assessmentLimitBreakerInfo.limit_type = dto.assessmentLimits.limits || null
    
    //contact resistance
    const contactResistanceBreakerInfo = new ContactResistanceBreakerInfo()
    contactResistanceBreakerInfo.mrid = dto.assessmentLimits.contact_resistance.mrid || null
    contactResistanceBreakerInfo.parameter_name = dto.assessmentLimits.contact_resistance.name || null
    contactResistanceBreakerInfo.assessment_limit_breaker_info_id = dto.assessmentLimitBreakerInfoId || null
    contactResistanceBreakerInfo.r_min = dto.assessmentLimits.contact_resistance.abs.r_min.mrid || null
    const rMin = new Resistance()
    mappingUnit(rMin, dto.assessmentLimits.contact_resistance.abs.r_min);
    entity.resistance.push(rMin);
    contactResistanceBreakerInfo.r_max = dto.assessmentLimits.contact_resistance.abs.r_max.mrid || null
    const rMax = new Resistance()
    mappingUnit(rMax, dto.assessmentLimits.contact_resistance.abs.r_max);
    entity.resistance.push(rMax);
    contactResistanceBreakerInfo.r_ref = dto.assessmentLimits.contact_resistance.rel.r_ref.mrid || null
    const rRef = new Resistance()
    mappingUnit(rRef, dto.assessmentLimits.contact_resistance.rel.r_ref);
    entity.resistance.push(rRef);
    contactResistanceBreakerInfo.r_dev = dto.assessmentLimits.contact_resistance.rel.r_dev.mrid || null
    const rDev = new Resistance()
    mappingUnit(rDev, dto.assessmentLimits.contact_resistance.rel.r_dev);
    entity.resistance.push(rDev);
    entity.contactResistanceBreakerInfo.push(contactResistanceBreakerInfo);

    //operating time
    for(const i in breaker_constant.opening_times) {
        const operatingTimeBreakerInfo = new OperatingTimeBreakerInfo()
        operatingTimeBreakerInfo.mrid = dto.assessmentLimits.operating_time.abs[breaker_constant.opening_times[i].value].mrid || null
        operatingTimeBreakerInfo.parameter_name = breaker_constant.opening_times[i].label || null
        operatingTimeBreakerInfo.assessment_limit_breaker_info_id = dto.assessmentLimitBreakerInfoId || null
        operatingTimeBreakerInfo.t_min = dto.assessmentLimits.operating_time.abs[breaker_constant.opening_times[i].value].t_min.mrid || null
        const tMin = new Seconds()
        mappingUnit(tMin, dto.assessmentLimits.operating_time.abs[breaker_constant.opening_times[i].value].t_min);
        entity.second.push(tMin);
        operatingTimeBreakerInfo.t_max = dto.assessmentLimits.operating_time.abs[breaker_constant.opening_times[i].value].t_max.mrid || null
        const tMax = new Seconds()
        mappingUnit(tMax, dto.assessmentLimits.operating_time.abs[breaker_constant.opening_times[i].value].t_max);
        entity.second.push(tMax);
        operatingTimeBreakerInfo.t_ref = dto.assessmentLimits.operating_time.rel[breaker_constant.opening_times[i].value].t_ref.mrid || null
        const tRef = new Seconds()
        mappingUnit(tRef, dto.assessmentLimits.operating_time.rel[breaker_constant.opening_times[i].value].t_ref);
        entity.second.push(tRef);
        operatingTimeBreakerInfo.t_dev_position = dto.assessmentLimits.operating_time.rel[breaker_constant.opening_times[i].value].plus_t_dev.mrid || null
        const plusTDev = new Seconds()
        mappingUnit(plusTDev, dto.assessmentLimits.operating_time.rel[breaker_constant.opening_times[i].value].plus_t_dev)
        entity.second.push(plusTDev);
        operatingTimeBreakerInfo.t_dev_negative = dto.assessmentLimits.operating_time.rel[breaker_constant.opening_times[i].value].minus_t_dev.mrid || null
        const minusTDev = new Seconds()
        mappingUnit(minusTDev, dto.assessmentLimits.operating_time.rel[breaker_constant.opening_times[i].value].minus_t_dev)
        entity.second.push(minusTDev);

        entity.operatingTimeBreakerInfo.push(operatingTimeBreakerInfo);
    }

    //Contact travel
    for(const i in breaker_constant.contact_travel) {
        const contactTravelBreakerInfo = new ContactTravelBreakerInfo()
        contactTravelBreakerInfo.mrid = dto.assessmentLimits.contact_travel.abs[breaker_constant.contact_travel[i].value].mrid || null
        contactTravelBreakerInfo.parameter_name = breaker_constant.contact_travel[i].label || null
        contactTravelBreakerInfo.assessment_limit_breaker_info_id = dto.assessmentLimitBreakerInfoId || null
        contactTravelBreakerInfo.d_min = dto.assessmentLimits.contact_travel.abs[breaker_constant.contact_travel[i].value].d_min.mrid || null
        const dMin = new Length()
        mappingUnit(dMin, dto.assessmentLimits.contact_travel.abs[breaker_constant.contact_travel[i].value].d_min);
        entity.length.push(dMin);
        contactTravelBreakerInfo.d_max = dto.assessmentLimits.contact_travel.abs[breaker_constant.contact_travel[i].value].d_max.mrid || null
        const dMax = new Length()
        mappingUnit(dMax, dto.assessmentLimits.contact_travel.abs[breaker_constant.contact_travel[i].value].d_max);
        entity.length.push(dMax);
        contactTravelBreakerInfo.d_ref = dto.assessmentLimits.contact_travel.rel[breaker_constant.contact_travel[i].value].d_ref.mrid || null
        const dRef = new Length()
        mappingUnit(dRef, dto.assessmentLimits.contact_travel.rel[breaker_constant.contact_travel[i].value].d_ref);
        entity.length.push(dRef);
        contactTravelBreakerInfo.d_dev = dto.assessmentLimits.contact_travel.rel[breaker_constant.contact_travel[i].value].d_dev.mrid || null
        const dDev = new Length()
        mappingUnit(dDev, dto.assessmentLimits.contact_travel.rel[breaker_constant.contact_travel[i].value].d_dev)
        entity.length.push(dDev);

        entity.contactTravelBreakerInfo.push(contactTravelBreakerInfo);
    }

    //Auxiliary contacts
    entity.auxiliaryContactsBreakerInfo.mrid = dto.assessmentLimits.auxiliary_contacts.mrid || null
    entity.auxiliaryContactsBreakerInfo.assessment_limit_breaker_info_id = dto.assessmentLimitBreakerInfoId || null

    //Trip operation
    for(const i in breaker_constant.auxiliary_contact) {
        const tripOperation = new TripOperation()
        tripOperation.mrid = dto.assessmentLimits.auxiliary_contacts.trip_operation.abs[breaker_constant.auxiliary_contact[i].value].mrid || null
        tripOperation.parameter_name = breaker_constant.auxiliary_contact[i].label || null
        tripOperation.auxiliary_contacts_breaker_info_id = dto.assessmentLimits.auxiliary_contacts.mrid || null
        tripOperation.t_min = dto.assessmentLimits.auxiliary_contacts.trip_operation.abs[breaker_constant.auxiliary_contact[i].value].t_min.mrid || null
        const tMin = new Seconds()
        mappingUnit(tMin, dto.assessmentLimits.auxiliary_contacts.trip_operation.abs[breaker_constant.auxiliary_contact[i].value].t_min);
        entity.second.push(tMin);
        tripOperation.t_max = dto.assessmentLimits.auxiliary_contacts.trip_operation.abs[breaker_constant.auxiliary_contact[i].value].t_max.mrid || null
        const tMax = new Seconds()
        mappingUnit(tMax, dto.assessmentLimits.auxiliary_contacts.trip_operation.abs[breaker_constant.auxiliary_contact[i].value].t_max);
        entity.second.push(tMax);
        tripOperation.t_ref = dto.assessmentLimits.auxiliary_contacts.trip_operation.rel[breaker_constant.auxiliary_contact[i].value].t_ref.mrid || null
        const tRef = new Seconds()
        mappingUnit(tRef, dto.assessmentLimits.auxiliary_contacts.trip_operation.rel[breaker_constant.auxiliary_contact[i].value].t_ref);
        entity.second.push(tRef);
        tripOperation.t_dev = dto.assessmentLimits.auxiliary_contacts.trip_operation.rel[breaker_constant.auxiliary_contact[i].value].t_dev.mrid || null
        const tDev = new Seconds()
        mappingUnit(tDev, dto.assessmentLimits.auxiliary_contacts.trip_operation.rel[breaker_constant.auxiliary_contact[i].value].t_dev)
        entity.second.push(tDev);
        entity.tripOperation.push(tripOperation);
    }

    //close trip
    for(const i in breaker_constant.auxiliary_contact) {
        const closeOperation = new CloseOperation()
        closeOperation.mrid = dto.assessmentLimits.auxiliary_contacts.close_operation.abs[breaker_constant.auxiliary_contact[i].value].mrid || null
        closeOperation.parameter_name = breaker_constant.auxiliary_contact[i].label || null
        closeOperation.auxiliary_contacts_breaker_info_id = dto.assessmentLimits.auxiliary_contacts.mrid || null
        closeOperation.t_min = dto.assessmentLimits.auxiliary_contacts.close_operation.abs[breaker_constant.auxiliary_contact[i].value].t_min.mrid || null
        const tMin = new Seconds()
        mappingUnit(tMin, dto.assessmentLimits.auxiliary_contacts.close_operation.abs[breaker_constant.auxiliary_contact[i].value].t_min);
        entity.second.push(tMin);
        closeOperation.t_max = dto.assessmentLimits.auxiliary_contacts.close_operation.abs[breaker_constant.auxiliary_contact[i].value].t_max.mrid || null
        const tMax = new Seconds()
        mappingUnit(tMax, dto.assessmentLimits.auxiliary_contacts.close_operation.abs[breaker_constant.auxiliary_contact[i].value].t_max);
        entity.second.push(tMax);
        closeOperation.t_ref = dto.assessmentLimits.auxiliary_contacts.close_operation.rel[breaker_constant.auxiliary_contact[i].value].t_ref.mrid || null
        const tRef = new Seconds()
        mappingUnit(tRef, dto.assessmentLimits.auxiliary_contacts.close_operation.rel[breaker_constant.auxiliary_contact[i].value].t_ref);
        entity.second.push(tRef);
        closeOperation.t_dev = dto.assessmentLimits.auxiliary_contacts.close_operation.rel[breaker_constant.auxiliary_contact[i].value].t_dev.mrid || null
        const tDev = new Seconds()
        mappingUnit(tDev, dto.assessmentLimits.auxiliary_contacts.close_operation.rel[breaker_constant.auxiliary_contact[i].value].t_dev)
        entity.second.push(tDev);
        entity.closeOperation.push(closeOperation);
    }

    //Miscellaneous
    for(const i in breaker_constant.miscellaneous) {
        const miscellaneousBreakerInfo = new MiscellaneousBreakerInfo()
        miscellaneousBreakerInfo.mrid = dto.assessmentLimits.miscellaneous.abs[breaker_constant.miscellaneous[i].value].mrid || null
        miscellaneousBreakerInfo.parameter_name = breaker_constant.miscellaneous[i].label || null
        miscellaneousBreakerInfo.assessment_limit_breaker_info_id = dto.assessmentLimitBreakerInfoId || null
        miscellaneousBreakerInfo.min = dto.assessmentLimits.miscellaneous.abs[breaker_constant.miscellaneous[i].value].min.mrid || null
        const min = new QuantityValue()
        mappingUnit(min, dto.assessmentLimits.miscellaneous.abs[breaker_constant.miscellaneous[i].value].min);
        entity.quantity.push(min);
        miscellaneousBreakerInfo.max = dto.assessmentLimits.miscellaneous.abs[breaker_constant.miscellaneous[i].value].max.mrid || null
        const max = new QuantityValue()
        mappingUnit(max, dto.assessmentLimits.miscellaneous.abs[breaker_constant.miscellaneous[i].value].max);
        entity.quantity.push(max);
        miscellaneousBreakerInfo.ref = dto.assessmentLimits.miscellaneous.rel[breaker_constant.miscellaneous[i].value].ref.mrid || null
        const ref = new QuantityValue()
        mappingUnit(ref, dto.assessmentLimits.miscellaneous.rel[breaker_constant.miscellaneous[i].value].ref);
        entity.quantity.push(ref);
        miscellaneousBreakerInfo.dev = dto.assessmentLimits.miscellaneous.rel[breaker_constant.miscellaneous[i].value].dev.mrid || null
        const dev = new QuantityValue()
        mappingUnit(dev, dto.assessmentLimits.miscellaneous.rel[breaker_constant.miscellaneous[i].value].dev);
        entity.quantity.push(dev);
        entity.miscellaneousBreakerInfo.push(miscellaneousBreakerInfo);
    }

    //Coil Characteristics
    for(const i in breaker_constant.coil_characteristics) {
        const coilCharacteristicsBreakerInfo = new CoilCharacteristicsBreakerInfo()
        coilCharacteristicsBreakerInfo.mrid = dto.assessmentLimits.coil_characteristics.abs[breaker_constant.coil_characteristics[i].value].mrid || null
        coilCharacteristicsBreakerInfo.parameter_name = breaker_constant.coil_characteristics[i].label || null
        coilCharacteristicsBreakerInfo.assessment_limit_breaker_info_id = dto.assessmentLimitBreakerInfoId || null
        coilCharacteristicsBreakerInfo.min = dto.assessmentLimits.coil_characteristics.abs[breaker_constant.coil_characteristics[i].value].min.mrid || null
        const min = new QuantityValue()
        mappingUnit(min, dto.assessmentLimits.coil_characteristics.abs[breaker_constant.coil_characteristics[i].value].min);
        entity.quantity.push(min);
        coilCharacteristicsBreakerInfo.max = dto.assessmentLimits.coil_characteristics.abs[breaker_constant.coil_characteristics[i].value].max.mrid || null
        const max = new QuantityValue()
        mappingUnit(max, dto.assessmentLimits.coil_characteristics.abs[breaker_constant.coil_characteristics[i].value].max);
        entity.quantity.push(max);
        coilCharacteristicsBreakerInfo.ref = dto.assessmentLimits.coil_characteristics.rel[breaker_constant.coil_characteristics[i].value].ref.mrid || null
        const ref = new QuantityValue()
        mappingUnit(ref, dto.assessmentLimits.coil_characteristics.rel[breaker_constant.coil_characteristics[i].value].ref);
        entity.quantity.push(ref);
        coilCharacteristicsBreakerInfo.dev_negative = dto.assessmentLimits.coil_characteristics.rel[breaker_constant.coil_characteristics[i].value].minus_dev.mrid || null
        const devNegative = new QuantityValue()
        mappingUnit(devNegative, dto.assessmentLimits.coil_characteristics.rel[breaker_constant.coil_characteristics[i].value].minus_dev);
        entity.quantity.push(devNegative);
        coilCharacteristicsBreakerInfo.dev_positive = dto.assessmentLimits.coil_characteristics.rel[breaker_constant.coil_characteristics[i].value].plus_dev.mrid || null
        const devPositive = new QuantityValue()
        mappingUnit(devPositive, dto.assessmentLimits.coil_characteristics.rel[breaker_constant.coil_characteristics[i].value].plus_dev);
        entity.quantity.push(devPositive);

        entity.coilCharacteristicsBreakerInfo.push(coilCharacteristicsBreakerInfo);
    }

    //Pickup voltage
    for(const i in breaker_constant.pickup_voltage) {
        const pickupVoltageBreakerInfo = new PickupVoltageBreakerInfo()
        pickupVoltageBreakerInfo.mrid = dto.assessmentLimits.pickup_voltage.abs[breaker_constant.pickup_voltage[i].value].mrid || null
        pickupVoltageBreakerInfo.parameter_name = breaker_constant.pickup_voltage[i].label || null
        pickupVoltageBreakerInfo.assessment_limit_breaker_info_id = dto.assessmentLimitBreakerInfoId || null
        pickupVoltageBreakerInfo.v_min = dto.assessmentLimits.pickup_voltage.abs[breaker_constant.pickup_voltage[i].value].v_min.mrid || null
        const vMin = new Voltage()
        mappingUnit(vMin, dto.assessmentLimits.pickup_voltage.abs[breaker_constant.pickup_voltage[i].value].v_min);
        entity.voltage.push(vMin);
        pickupVoltageBreakerInfo.v_max = dto.assessmentLimits.pickup_voltage.abs[breaker_constant.pickup_voltage[i].value].v_max.mrid || null
        const vMax = new Voltage()
        mappingUnit(vMax, dto.assessmentLimits.pickup_voltage.abs[breaker_constant.pickup_voltage[i].value].v_max);
        entity.voltage.push(vMax);
        pickupVoltageBreakerInfo.v_ref = dto.assessmentLimits.pickup_voltage.rel[breaker_constant.pickup_voltage[i].value].v_ref.mrid || null
        const vRef = new Voltage()
        mappingUnit(vRef, dto.assessmentLimits.pickup_voltage.rel[breaker_constant.pickup_voltage[i].value].v_ref);
        entity.voltage.push(vRef);
        pickupVoltageBreakerInfo.v_dev = dto.assessmentLimits.pickup_voltage.rel[breaker_constant.pickup_voltage[i].value].v_dev.mrid || null
        const vDev = new Voltage()
        mappingUnit(vDev, dto.assessmentLimits.pickup_voltage.rel[breaker_constant.pickup_voltage[i].value].v_dev)
        entity.voltage.push(vDev);

        entity.pickupVoltageBreakerInfo.push(pickupVoltageBreakerInfo);
    }

    //Motor characteristics
    for(const i in breaker_constant.motor_characteristics) {
        const motorCharacteristicsBreakerInfo = new MotorCharacteristicsBreakerInfo()
        motorCharacteristicsBreakerInfo.mrid = dto.assessmentLimits.motor_characteristics.abs[breaker_constant.motor_characteristics[i].value].mrid || null
        motorCharacteristicsBreakerInfo.parameter_name = breaker_constant.motor_characteristics[i].label || null
        motorCharacteristicsBreakerInfo.assessment_limit_breaker_info_id = dto.assessmentLimitBreakerInfoId || null

        motorCharacteristicsBreakerInfo.min = dto.assessmentLimits.motor_characteristics.abs[breaker_constant.motor_characteristics[i].value].min.mrid || null
        const min = new QuantityValue()
        mappingUnit(min, dto.assessmentLimits.motor_characteristics.abs[breaker_constant.motor_characteristics[i].value].min);
        entity.quantity.push(min);

        motorCharacteristicsBreakerInfo.max = dto.assessmentLimits.motor_characteristics.abs[breaker_constant.motor_characteristics[i].value].max.mrid || null
        const max = new QuantityValue()
        mappingUnit(max, dto.assessmentLimits.motor_characteristics.abs[breaker_constant.motor_characteristics[i].value].max);
        entity.quantity.push(max);

        motorCharacteristicsBreakerInfo.ref = dto.assessmentLimits.motor_characteristics.rel[breaker_constant.motor_characteristics[i].value].ref.mrid || null
        const ref = new QuantityValue()
        mappingUnit(ref, dto.assessmentLimits.motor_characteristics.rel[breaker_constant.motor_characteristics[i].value].ref);
        entity.quantity.push(ref);

        motorCharacteristicsBreakerInfo.dev = dto.assessmentLimits.motor_characteristics.rel[breaker_constant.motor_characteristics[i].value].dev.mrid || null
        const dev = new QuantityValue()
        mappingUnit(dev, dto.assessmentLimits.motor_characteristics.rel[breaker_constant.motor_characteristics[i].value].dev)
        entity.quantity.push(dev);

        entity.motorCharacteristicsBreakerInfo.push(motorCharacteristicsBreakerInfo);
    }

    //Under-voltage release
    const underVoltageReleaseBreakerInfo = new UnderVoltageReleaseBreakerInfo()
    underVoltageReleaseBreakerInfo.mrid = dto.assessmentLimits.under_voltage_release.mrid || null
    underVoltageReleaseBreakerInfo.parameter_name = dto.assessmentLimits.under_voltage_release.name || null
    underVoltageReleaseBreakerInfo.assessment_limit_breaker_info_id = dto.assessmentLimitBreakerInfoId || null

    underVoltageReleaseBreakerInfo.min = dto.assessmentLimits.under_voltage_release.abs.uv_coil_trip_voltage.min.mrid || null
    const min = new Voltage()
    mappingUnit(min, dto.assessmentLimits.under_voltage_release.abs.uv_coil_trip_voltage.min);
    entity.voltage.push(min);

    underVoltageReleaseBreakerInfo.max = dto.assessmentLimits.under_voltage_release.abs.uv_coil_trip_voltage.max.mrid || null
    const max = new Voltage()
    mappingUnit(max, dto.assessmentLimits.under_voltage_release.abs.uv_coil_trip_voltage.max);
    entity.voltage.push(max);

    underVoltageReleaseBreakerInfo.ref = dto.assessmentLimits.under_voltage_release.rel.uv_coil_trip_voltage.ref.mrid || null
    const ref = new Voltage()
    mappingUnit(ref, dto.assessmentLimits.under_voltage_release.rel.uv_coil_trip_voltage.ref);
    entity.voltage.push(ref);

    underVoltageReleaseBreakerInfo.dev = dto.assessmentLimits.under_voltage_release.rel.uv_coil_trip_voltage.dev.mrid || null
    const dev = new Voltage()
    mappingUnit(dev, dto.assessmentLimits.under_voltage_release.rel.uv_coil_trip_voltage.dev)
    entity.voltage.push(dev);
    entity.underVoltageReleaseBreakerInfo.push(underVoltageReleaseBreakerInfo);

    //Overcurrent release
    const overcurrentReleaseBreakerInfo = new OvercurrentReleaseBreakerInfo()
    overcurrentReleaseBreakerInfo.mrid = dto.assessmentLimits.overcurrent_release.mrid || null
    overcurrentReleaseBreakerInfo.parameter_name = dto.assessmentLimits.overcurrent_release.name || null
    overcurrentReleaseBreakerInfo.assessment_limit_breaker_info_id = dto.assessmentLimitBreakerInfoId || null

    overcurrentReleaseBreakerInfo.min = dto.assessmentLimits.overcurrent_release.abs.oc_replay_trip_current.min.mrid || null
    const cMin = new CurrentFlow()
    mappingUnit(cMin, dto.assessmentLimits.overcurrent_release.abs.oc_replay_trip_current.min);
    entity.currentFlow.push(cMin);

    overcurrentReleaseBreakerInfo.max = dto.assessmentLimits.overcurrent_release.abs.oc_replay_trip_current.max.mrid || null
    const cMax = new CurrentFlow()
    mappingUnit(cMax, dto.assessmentLimits.overcurrent_release.abs.oc_replay_trip_current.max);
    entity.currentFlow.push(cMax);

    overcurrentReleaseBreakerInfo.ref = dto.assessmentLimits.overcurrent_release.rel.oc_replay_trip_current.ref.mrid || null
    const cRef = new CurrentFlow()
    mappingUnit(cRef, dto.assessmentLimits.overcurrent_release.rel.oc_replay_trip_current.ref);
    entity.currentFlow.push(cRef);

    overcurrentReleaseBreakerInfo.dev = dto.assessmentLimits.overcurrent_release.rel.oc_replay_trip_current.dev.mrid || null
    const cDev = new CurrentFlow()
    mappingUnit(cDev, dto.assessmentLimits.overcurrent_release.rel.oc_replay_trip_current.dev)
    entity.currentFlow.push(cDev);
    entity.overcurrentReleaseBreakerInfo.push(overcurrentReleaseBreakerInfo);
    return entity
}

export function mapEntityToDto(entity) {
    console.log(entity)
    const dto = new CircuitBreakerDto()
    dto.properties.mrid = entity.asset.mrid || ''
    dto.properties.kind = entity.asset.kind || ''
    dto.properties.type = entity.asset.type || ''
    dto.properties.apparatus_id = entity.asset.name || ''
    dto.properties.country_of_origin = entity.asset.country_of_origin || ''
    dto.properties.serial_no = entity.asset.serial_number || ''
    dto.productAssetModelId = entity.productAssetModel.mrid || ''
    dto.properties.manufacturer = entity.productAssetModel.manufacturer || ''
    dto.properties.manufacturer_type = entity.oldBreakerInfo.manufacturer_type || ''
    dto.lifecycleDateId = entity.lifecycleDate.mrid || ''
    dto.properties.manufacturer_year = entity.lifecycleDate.manufactured_date || ''
    dto.properties.comment = entity.asset.description || ''
    dto.locationId = entity.asset.location || ''
    dto.circuitBreaker.numberOfPhases = entity.oldBreakerInfo.phase_number || ''
    dto.circuitBreaker.interruptersPerPhase = entity.oldBreakerInfo.number_of_interrupters_per_phase || ''
    dto.circuitBreaker.poleOperation = entity.oldBreakerInfo.pole_operation || ''
    dto.assetPsrId = entity.assetPsr.mrid || ''
    dto.assetInfoId = entity.oldBreakerInfo.mrid || ''

    if (entity.oldBreakerInfo.pir == 1) {
        dto.circuitBreaker.hasPIR = true;
    } else {
        dto.circuitBreaker.hasPIR = false;
    }

    dto.circuitBreaker.pirValue.mrid = entity.oldBreakerInfo.pir_value || ''
    for(const data of entity.resistance) {
        if(data.mrid == dto.circuitBreaker.pirValue.mrid) {
            dto.circuitBreaker.pirValue.value = data.value || ''
            break
        }
    }
    
    if (entity.oldBreakerInfo.grading_capacitors == 1) {
        dto.circuitBreaker.hasGradingCapacitors = true;
    } else {
        dto.circuitBreaker.hasGradingCapacitors = false;
    }
    dto.circuitBreaker.capacitorValue.mrid = entity.oldBreakerInfo.capacitor_value || ''
    for(const data of entity.capacitance) {
        if(data.mrid == dto.circuitBreaker.capacitorValue.mrid) {
            dto.circuitBreaker.capacitorValue.value = data.value || ''
            break
        }
    }
    dto.circuitBreaker.interruptingMedium = entity.oldBreakerInfo.interrupting_medium || ''
    dto.circuitBreaker.tankType = entity.oldBreakerInfo.tank_type || ''

    dto.breakerRatingInfoId = entity.breakerRatingInfo.mrid || ''
    dto.ratings.rated_frequency.mrid = entity.oldBreakerInfo.rated_frequency || ''
    dto.ratings.rated_frequency_custom.mrid = entity.oldBreakerInfo.rated_frequency || ''
    for(const data of entity.frequency) {
        if(data.mrid == dto.ratings.rated_frequency.mrid) {
            if(['50', '60', '16.7'].includes(data.value)) {
                dto.ratings.rated_frequency.value = data.value || ''
            } else {
                dto.ratings.rated_frequency_custom.value = data.value || ''
                dto.ratings.rated_frequency.value = 'Custom' || ''
            }
        }
    }
    dto.ratings.rated_voltage_ll.mrid = entity.oldBreakerInfo.rated_voltage || ''
    for(const data of entity.voltage) {
        if(data.mrid == dto.ratings.rated_voltage_ll.mrid) {
            dto.ratings.rated_voltage_ll.value = data.value
            break
        }
    }
    dto.ratings.rated_current.mrid = entity.oldBreakerInfo.rated_current
    for(const data of entity.currentFlow) {
        if(data.mrid == dto.ratings.rated_current.mrid) {
            dto.ratings.rated_current.value = data.value
            break
        }
    }
    dto.ratings.rated_short_circuit_breaking_current.mrid = entity.breakerRatingInfo.rated_short_circuit_breaking_current
    for(const data of entity.currentFlow) {
        if(data.mrid == dto.ratings.rated_short_circuit_breaking_current.mrid) {
            dto.ratings.rated_short_circuit_breaking_current.value = data.value
            break
        }
    }
    dto.ratings.short_circuit_nominal_duration.mrid = entity.breakerRatingInfo.short_circuit_nominal_duration
    for(const data of entity.second) {
        if(data.mrid == dto.ratings.short_circuit_nominal_duration.mrid) {
            dto.ratings.short_circuit_nominal_duration.value = data.value
            break
        }
    }
    dto.ratings.rated_insulation_level.mrid = entity.breakerRatingInfo.rated_insulation_level
    for(const data of entity.voltage) {
        if(data.mrid == dto.ratings.rated_insulation_level.mrid) {
            dto.ratings.rated_insulation_level.value = data.value
            break
        }
    }
    dto.ratings.rated_interrupting_time.mrid = entity.oldBreakerInfo.rated_interrupting_time
    for(const data of entity.second) {
        if(data.mrid == dto.ratings.rated_interrupting_time.mrid) {
            dto.ratings.rated_interrupting_time.value = data.value
            break
        }
    }
    dto.ratings.interrupting_duty_cycle = entity.breakerRatingInfo.interrupting_duty_cycle
    dto.ratings.rated_power_at_closing.mrid = entity.breakerRatingInfo.rated_power_closing
    for(const data of entity.activePower) {
        if(data.mrid == dto.ratings.rated_power_at_closing.mrid) {
            dto.ratings.rated_power_at_closing.value = data.value
            break
        }
    }
    dto.ratings.rated_power_at_opening.mrid = entity.breakerRatingInfo.rated_power_opening
    for(const data of entity.activePower) {
        if(data.mrid == dto.ratings.rated_power_at_opening.mrid) {
            dto.ratings.rated_power_at_opening.value = data.value
            break
        }
    }

    dto.ratings.rated_power_at_motor_charge.mrid = entity.breakerRatingInfo.rated_power_motor_charge
    for(const data of entity.activePower) {
        if(data.mrid == dto.ratings.rated_power_at_motor_charge.mrid) {
            dto.ratings.rated_power_at_motor_charge.value = data.value
            break
        }
    }
    dto.breakerContactSystemInfoId = entity.breakerContactSystemInfo.mrid
    dto.contactSystem.nominal_total_travel.mrid = entity.breakerContactSystemInfo.nominal_total_travel
    for(const data of entity.length) {
        if(data.mrid == dto.contactSystem.nominal_total_travel.mrid) {
            dto.contactSystem.nominal_total_travel.value = data.value
            break
        }
    }

    dto.contactSystem.damping_time.mrid = entity.breakerContactSystemInfo.damping_time
    for(const data of entity.second) {
        if(data.mrid == dto.contactSystem.damping_time.mrid) {
            dto.contactSystem.damping_time.value = data.value
            break
        }
    }

    dto.contactSystem.nozzle_length.mrid = entity.breakerContactSystemInfo.nozzle_length
    for(const data of entity.length) {
        if(data.mrid == dto.contactSystem.nozzle_length.mrid) {
            dto.contactSystem.nozzle_length.value = data.value
            break
        }
    }

    dto.breakerOtherInfoId = entity.breakerOtherInfo.mrid
    dto.others.total_weight_with_gas.mrid = entity.breakerOtherInfo.total_weight_with_gas
    for(const data of entity.mass) {
        if(data.mrid == dto.others.total_weight_with_gas.mrid) {
            dto.others.total_weight_with_gas.value = data.value
            break
        }
    }
    dto.others.weight_of_gas.mrid = entity.breakerOtherInfo.weight_of_gas
    for(const data of entity.mass) {
        if(data.mrid == dto.others.weight_of_gas.mrid) {
            dto.others.weight_of_gas.value = data.value
            break
        }
    }
    dto.others.volume_of_gas.mrid = entity.breakerOtherInfo.volume_of_gas
    for(const data of entity.volume) {
        if(data.mrid == dto.others.volume_of_gas.mrid) {
            dto.others.volume_of_gas.value = data.value
            break
        }
    }
    dto.others.rated_gas_pressure.mrid = entity.breakerOtherInfo.rated_gas_pressure
    for(const data of entity.pressure) {
        if(data.mrid == dto.others.rated_gas_pressure.mrid) {
            dto.others.rated_gas_pressure.value = data.value
            break
        }
    }
    dto.others.rated_gas_temperature.mrid = entity.breakerOtherInfo.rated_gas_temperature
    for(const data of entity.temperature) {
        if(data.mrid == dto.others.rated_gas_temperature.mrid) {
            dto.others.rated_gas_temperature.value = data.value
            break
        }
    }

    dto.operatingMechanismId = entity.oldOperatingMechanism.mrid
    dto.operating.type = entity.oldOperatingMechanism.type
    dto.operating.serial_no = entity.oldOperatingMechanism.serial_number
    dto.operatingMechanismInfoId = entity.oldOperatingMechanismInfo.mrid
    dto.operating.manufacturer_type = entity.oldOperatingMechanismInfo.manufacturer_type
    dto.operatingMechanismLifecycleDateId = entity.operatingLifecycleDate.mrid
    dto.operating.manufacturer_year = entity.operatingLifecycleDate.manufactured_date
    dto.operatingMechanismProductAssetModelId = entity.operatingProductAssetModel.mrid
    dto.operating.manufacturer = entity.operatingProductAssetModel.manufacturer
    dto.operating.number_of_trip_coil = entity.oldOperatingMechanism.number_of_trip_coil
    dto.operating.number_of_close_coil = entity.oldOperatingMechanism.number_of_close_coil

    dto.operating.auxiliary_circuits.rated_voltage.mrid = entity.oldOperatingMechanismInfo.rated_auxiliary_circuit_voltage
    for(const data of entity.voltage) {
        if(data.mrid == dto.operating.auxiliary_circuits.rated_voltage.mrid) {
            dto.operating.auxiliary_circuits.rated_voltage.value = data.value
            break
        }
    }
    dto.operating.auxiliary_circuits.rated_current.mrid = entity.oldOperatingMechanismInfo.rated_auxiliary_circuit_current
    for(const data of entity.currentFlow) {
        if(data.mrid == dto.operating.auxiliary_circuits.rated_current.mrid) {
            dto.operating.auxiliary_circuits.rated_current.value = data.value
            break
        }
    }
    dto.operating.auxiliary_circuits.frequency.mrid = entity.oldOperatingMechanismInfo.rated_auxiliary_circuit_frequency
    for(const data of entity.frequency) {
        if(data.mrid == dto.operating.auxiliary_circuits.frequency.mrid) {
            dto.operating.auxiliary_circuits.frequency.value = data.value
            break
        }
    }
    dto.operating.auxiliary_circuits.power = entity.oldOperatingMechanismInfo.auxiliary_circuit_power_type
    dto.operating.motor.rated_voltage.mrid = entity.oldOperatingMechanismInfo.rated_motor_voltage
    for(const data of entity.voltage) {
        if(data.mrid == dto.operating.motor.rated_voltage.mrid) {
            dto.operating.motor.rated_voltage.value = data.value
            break
        }
    }
    dto.operating.motor.rated_current.mrid = entity.oldOperatingMechanismInfo.rated_motor_current
    for(const data of entity.currentFlow) {
        if(data.mrid == dto.operating.motor.rated_current.mrid) {
            dto.operating.motor.rated_current.value = data.value
            break
        }
    }
    dto.operating.motor.frequency.mrid = entity.oldOperatingMechanismInfo.rated_motor_frequency
    for(const data of entity.frequency) {
        if(data.mrid == dto.operating.motor.frequency.mrid) {
            dto.operating.motor.frequency.value = data.value
            break
        }
    }
    dto.operating.motor.power = entity.oldOperatingMechanismInfo.motor_power_type
    for(const data of entity.operatingMechanismComponent) {
        const dataComponent = {
            mrid: '',
            component : "",
            rated_voltage : {
                mrid: '',
                value: '',
                unit: 'V'
            },
            rated_current : {
                mrid: '',
                value: '',
                unit: 'A'
            },
            power : "",
            frequency : {
                mrid: '',
                value: '',
                unit: 'Hz'
            }
        }
        dataComponent.mrid = data.mrid
        dataComponent.component = data.component
        dataComponent.rated_voltage.mrid = data.rated_voltage
        for(const data2 of entity.voltage) {
            if(data2.mrid == dataComponent.rated_voltage.mrid) {
                dataComponent.rated_voltage.value = data2.value
                break
            }
        }
        dataComponent.rated_current.mrid = data.rated_current
        for(const data2 of entity.currentFlow) {
            if(data2.mrid == dataComponent.rated_current.mrid) {
                dataComponent.rated_current.value = data2.value
                break
            }
        }
        dataComponent.power = data.power_type
        dataComponent.frequency.mrid = data.rated_frequency
        for(const data2 of entity.frequency) {
            if(data2.mrid == dataComponent.frequency.mrid) {
                dataComponent.frequency.value = data2.value
                break
            }
        }
        if(dataComponent.component.includes("trip")) {
            dto.operating.trip_coil_component.push(dataComponent)
        } else {
            dto.operating.close_coil_component.push(dataComponent)
        }
    }

    dto.operating.rated_operating_pressure.mrid = entity.oldOperatingMechanismInfo.rated_operating_pressure
    for(const data of entity.pressure) {
        if(data.mrid == dto.operating.rated_operating_pressure.mrid) {
            dto.operating.rated_operating_pressure.value = data.value
            break
        }
    }
    dto.operating.rated_operating_pressure_temperature.mrid = entity.oldOperatingMechanismInfo.rated_operating_pressure_temperature
    for(const data of entity.temperature) {
        if(data.mrid == dto.operating.rated_operating_pressure_temperature.mrid) {
            dto.operating.rated_operating_pressure_temperature.value = data.value
            break
        }
    }

    dto.assessmentLimitBreakerInfoId = entity.assessmentLimitBreakerInfo.mrid
    dto.assessmentLimits.limits = entity.assessmentLimitBreakerInfo.limit_type
    for(const data of entity.contactResistanceBreakerInfo) {
        dto.assessmentLimits.contact_resistance.mrid = data.mrid
        dto.assessmentLimits.contact_resistance.name = data.parameter_name
        dto.assessmentLimits.contact_resistance.abs.r_min.mrid = data.r_min
        for(const data2 of entity.resistance) {
            if(data2.mrid == dto.assessmentLimits.contact_resistance.abs.r_min.mrid) {
                dto.assessmentLimits.contact_resistance.abs.r_min.value = data2.value
                break
            }
        }
        dto.assessmentLimits.contact_resistance.abs.r_max.mrid = data.r_max
        for(const data2 of entity.resistance) {
            if(data2.mrid == dto.assessmentLimits.contact_resistance.abs.r_max.mrid) {
                dto.assessmentLimits.contact_resistance.abs.r_max.value = data2.value
                break
            }
        }
        dto.assessmentLimits.contact_resistance.rel.r_ref.mrid = data.r_ref
        for(const data2 of entity.resistance) {
            if(data2.mrid == dto.assessmentLimits.contact_resistance.rel.r_ref.mrid) {
                dto.assessmentLimits.contact_resistance.rel.r_ref.value = data2.value
                break
            }
        }
        dto.assessmentLimits.contact_resistance.rel.r_dev.mrid = data.r_dev
        for(const data2 of entity.resistance) {
            if(data2.mrid == dto.assessmentLimits.contact_resistance.rel.r_dev.mrid) {
                dto.assessmentLimits.contact_resistance.rel.r_dev.value = data2.value
                break
            }
        }
    }
    
    for(const data of entity.operatingTimeBreakerInfo) {
        const found = breaker_constant.opening_times.find(
            item => item.label === data.parameter_name
        );
        const value = found ? found.value : null;
        dto.assessmentLimits.operating_time.abs[value].mrid = data.mrid
        dto.assessmentLimits.operating_time.abs[value].t_min.mrid = data.t_min
        for(const data2 of entity.second) {
            if(data2.mrid == dto.assessmentLimits.operating_time.abs[value].t_min.mrid) {
                dto.assessmentLimits.operating_time.abs[value].t_min.value = data2.value
                break
            }
        }
        dto.assessmentLimits.operating_time.abs[value].t_max.mrid = data.t_max
        for(const data2 of entity.second) {
            if(data2.mrid == dto.assessmentLimits.operating_time.abs[value].t_max.mrid) {
                dto.assessmentLimits.operating_time.abs[value].t_max.value = data2.value
                break
            }
        }
        dto.assessmentLimits.operating_time.rel[value].t_ref.mrid = data.t_ref
        for(const data2 of entity.second) {
            if(data2.mrid == dto.assessmentLimits.operating_time.rel[value].t_ref.mrid) {
                dto.assessmentLimits.operating_time.rel[value].t_ref.value = data2.value
                break
            }
        }
        dto.assessmentLimits.operating_time.rel[value].plus_t_dev.mrid = data.t_dev_position
        for(const data2 of entity.second) {
            if(data2.mrid == dto.assessmentLimits.operating_time.rel[value].plus_t_dev.mrid) {
                dto.assessmentLimits.operating_time.rel[value].plus_t_dev.value = data2.value
                break
            }
        }
        dto.assessmentLimits.operating_time.rel[value].minus_t_dev.mrid = data.t_dev_negative
        for(const data2 of entity.second) {
            if(data2.mrid == dto.assessmentLimits.operating_time.rel[value].minus_t_dev.mrid) {
                dto.assessmentLimits.operating_time.rel[value].minus_t_dev.value = data2.value
                break
            }
        }
    }

    for(const data of entity.contactTravelBreakerInfo) {
        const found = breaker_constant.contact_travel.find(
            item => item.label === data.parameter_name
        );
        const value = found ? found.value : null;
        dto.assessmentLimits.contact_travel.abs[value].mrid = data.mrid
        dto.assessmentLimits.contact_travel.abs[value].d_min.mrid = data.d_min
        for(const data2 of entity.length) {
            if(data2.mrid == dto.assessmentLimits.contact_travel.abs[value].d_min.mrid) {
                dto.assessmentLimits.contact_travel.abs[value].d_min.value = data2.value
                break
            }
        }
        dto.assessmentLimits.contact_travel.abs[value].d_max.mrid = data.d_max
        for(const data2 of entity.length) {
            if(data2.mrid == dto.assessmentLimits.contact_travel.abs[value].d_max.mrid) {
                dto.assessmentLimits.contact_travel.abs[value].d_max.value = data2.value
                break
            }
        }
        dto.assessmentLimits.contact_travel.rel[value].d_ref.mrid = data.d_ref
        for(const data2 of entity.length) {
            if(data2.mrid == dto.assessmentLimits.contact_travel.rel[value].d_ref.mrid) {
                dto.assessmentLimits.contact_travel.rel[value].d_ref.value = data2.value
                break
            }
        }
        dto.assessmentLimits.contact_travel.rel[value].d_dev.mrid = data.d_dev
        for(const data2 of entity.length) {
            if(data2.mrid == dto.assessmentLimits.contact_travel.rel[value].d_dev.mrid) {
                dto.assessmentLimits.contact_travel.rel[value].d_dev.value = data2.value
                break
            }
        }
    }

    dto.assessmentLimits.auxiliary_contacts.mrid = entity.auxiliaryContactsBreakerInfo.mrid
    
    for(const data of entity.tripOperation) {
        const found = breaker_constant.auxiliary_contact.find(
            item => item.label === data.parameter_name
        );
        const value = found ? found.value : null;
        dto.assessmentLimits.auxiliary_contacts.trip_operation.abs[value].mrid = data.mrid
        dto.assessmentLimits.auxiliary_contacts.trip_operation.abs[value].t_min.mrid = data.t_min
        for(const data2 of entity.second) {
            if(data2.mrid == dto.assessmentLimits.auxiliary_contacts.trip_operation.abs[value].t_min.mrid) {
                dto.assessmentLimits.auxiliary_contacts.trip_operation.abs[value].t_min.value = data2.value
                break
            }
        }
        dto.assessmentLimits.auxiliary_contacts.trip_operation.abs[value].t_max.mrid = data.t_max
        for(const data2 of entity.second) {
            if(data2.mrid == dto.assessmentLimits.auxiliary_contacts.trip_operation.abs[value].t_max.mrid) {
                dto.assessmentLimits.auxiliary_contacts.trip_operation.abs[value].t_max.value = data2.value
                break
            }
        }
        dto.assessmentLimits.auxiliary_contacts.trip_operation.rel[value].t_ref.mrid = data.t_ref
        for(const data2 of entity.second) {
            if(data2.mrid == dto.assessmentLimits.auxiliary_contacts.trip_operation.rel[value].t_ref.mrid) {
                dto.assessmentLimits.auxiliary_contacts.trip_operation.rel[value].t_ref.value = data2.value
                break
            }
        }
        dto.assessmentLimits.auxiliary_contacts.trip_operation.rel[value].t_dev.mrid = data.t_dev
        for(const data2 of entity.second) {
            if(data2.mrid == dto.assessmentLimits.auxiliary_contacts.trip_operation.rel[value].t_dev.mrid) {
                dto.assessmentLimits.auxiliary_contacts.trip_operation.rel[value].t_dev.value = data2.value
                break
            }
        }
    }

    for(const data of entity.closeOperation) {
        const found = breaker_constant.auxiliary_contact.find(
            item => item.label === data.parameter_name
        );
        const value = found ? found.value : null;
        dto.assessmentLimits.auxiliary_contacts.close_operation.abs[value].mrid = data.mrid
        dto.assessmentLimits.auxiliary_contacts.close_operation.abs[value].t_min.mrid = data.t_min
        for(const data2 of entity.second) {
            if(data2.mrid == dto.assessmentLimits.auxiliary_contacts.close_operation.abs[value].t_min.mrid) {
                dto.assessmentLimits.auxiliary_contacts.close_operation.abs[value].t_min.value = data2.value
                break
            }
        }
        dto.assessmentLimits.auxiliary_contacts.close_operation.abs[value].t_max.mrid = data.t_max
        for(const data2 of entity.second) {
            if(data2.mrid == dto.assessmentLimits.auxiliary_contacts.close_operation.abs[value].t_max.mrid) {
                dto.assessmentLimits.auxiliary_contacts.close_operation.abs[value].t_max.value = data2.value
                break
            }
        }
        dto.assessmentLimits.auxiliary_contacts.close_operation.rel[value].t_ref.mrid = data.t_ref
        for(const data2 of entity.second) {
            if(data2.mrid == dto.assessmentLimits.auxiliary_contacts.close_operation.rel[value].t_ref.mrid) {
                dto.assessmentLimits.auxiliary_contacts.close_operation.rel[value].t_ref.value = data2.value
                break
            }
        }
        dto.assessmentLimits.auxiliary_contacts.close_operation.rel[value].t_dev.mrid = data.t_dev
        for(const data2 of entity.second) {
            if(data2.mrid == dto.assessmentLimits.auxiliary_contacts.close_operation.rel[value].t_dev.mrid) {
                dto.assessmentLimits.auxiliary_contacts.close_operation.rel[value].t_dev.value = data2.value
                break
            }
        }
    }

    for(const data of entity.miscellaneousBreakerInfo) {
        const found = breaker_constant.miscellaneous.find(
            item => item.label === data.parameter_name
        );
        const value = found ? found.value : null;
        dto.assessmentLimits.miscellaneous.abs[value].mrid = data.mrid
        dto.assessmentLimits.miscellaneous.abs[value].min.mrid = data.min
        for(const data2 of entity.quantity) {
            if(data2.mrid == dto.assessmentLimits.miscellaneous.abs[value].min.mrid) {
                dto.assessmentLimits.miscellaneous.abs[value].min.value = data2.value
                break
            }
        }
        dto.assessmentLimits.miscellaneous.abs[value].max.mrid = data.max
        for(const data2 of entity.quantity) {
            if(data2.mrid == dto.assessmentLimits.miscellaneous.abs[value].max.mrid) {
                dto.assessmentLimits.miscellaneous.abs[value].max.value = data2.value
                break
            }
        }
        dto.assessmentLimits.miscellaneous.rel[value].ref.mrid = data.ref
        for(const data2 of entity.quantity) {
            if(data2.mrid == dto.assessmentLimits.miscellaneous.rel[value].ref.mrid) {
                dto.assessmentLimits.miscellaneous.rel[value].ref.value = data2.value
                break
            }
        }
        dto.assessmentLimits.miscellaneous.rel[value].dev.mrid = data.dev
        for(const data2 of entity.quantity) {
            if(data2.mrid == dto.assessmentLimits.miscellaneous.rel[value].dev.mrid) {
                dto.assessmentLimits.miscellaneous.rel[value].dev.value = data2.value
                break
            }
        }
    }

    for(const data of entity.coilCharacteristicsBreakerInfo) {
        const found = breaker_constant.coil_characteristics.find(
            item => item.label === data.parameter_name
        );
        const value = found ? found.value : null;
        dto.assessmentLimits.coil_characteristics.abs[value].mrid = data.mrid

        dto.assessmentLimits.coil_characteristics.abs[value].min.mrid = data.min
        for(const data2 of entity.quantity) {
            if(data2.mrid == dto.assessmentLimits.coil_characteristics.abs[value].min.mrid) {
                dto.assessmentLimits.coil_characteristics.abs[value].min.value = data2.value
                break
            }
        }
        dto.assessmentLimits.coil_characteristics.abs[value].max.mrid = data.max
        for(const data2 of entity.quantity) {
            if(data2.mrid == dto.assessmentLimits.coil_characteristics.abs[value].max.mrid) {
                dto.assessmentLimits.coil_characteristics.abs[value].max.value = data2.value
                break
            }
        }
        dto.assessmentLimits.coil_characteristics.rel[value].ref.mrid = data.ref
        for(const data2 of entity.quantity) {
            if(data2.mrid == dto.assessmentLimits.coil_characteristics.rel[value].ref.mrid) {
                dto.assessmentLimits.coil_characteristics.rel[value].ref.value = data2.value
                break
            }
        }
        dto.assessmentLimits.coil_characteristics.rel[value].plus_dev.mrid = data.dev_positive
        for(const data2 of entity.quantity) {
            if(data2.mrid == dto.assessmentLimits.coil_characteristics.rel[value].plus_dev.mrid) {
                dto.assessmentLimits.coil_characteristics.rel[value].plus_dev.value = data2.value
                break
            }
        }
        dto.assessmentLimits.coil_characteristics.rel[value].minus_dev.mrid = data.dev_negative
        for(const data2 of entity.quantity) {
            if(data2.mrid == dto.assessmentLimits.coil_characteristics.rel[value].minus_dev.mrid) {
                dto.assessmentLimits.coil_characteristics.rel[value].minus_dev.value = data2.value
                break
            }
        }
    }
    
    for(const data of entity.pickupVoltageBreakerInfo) {
        const found = breaker_constant.pickup_voltage.find(
            item => item.label === data.parameter_name
        );
        const value = found ? found.value : null;
        dto.assessmentLimits.pickup_voltage.abs[value].mrid = data.mrid
        dto.assessmentLimits.pickup_voltage.abs[value].v_min.mrid = data.v_min
        for(const data2 of entity.voltage) {
            if(data2.mrid == dto.assessmentLimits.pickup_voltage.abs[value].v_min.mrid) {
                dto.assessmentLimits.pickup_voltage.abs[value].v_min.value = data2.value
                break
            }
        }
        dto.assessmentLimits.pickup_voltage.abs[value].v_max.mrid = data.v_max
        for(const data2 of entity.voltage) {
            if(data2.mrid == dto.assessmentLimits.pickup_voltage.abs[value].v_max.mrid) {
                dto.assessmentLimits.pickup_voltage.abs[value].v_max.value = data2.value
                break
            }
        }
        dto.assessmentLimits.pickup_voltage.rel[value].v_ref.mrid = data.v_ref
        for(const data2 of entity.voltage) {
            if(data2.mrid == dto.assessmentLimits.pickup_voltage.rel[value].v_ref.mrid) {
                dto.assessmentLimits.pickup_voltage.rel[value].v_ref.value = data2.value
                break
            }
        }
        dto.assessmentLimits.pickup_voltage.rel[value].v_dev.mrid = data.v_dev
        for(const data2 of entity.voltage) {
            if(data2.mrid == dto.assessmentLimits.pickup_voltage.rel[value].v_dev.mrid) {
                dto.assessmentLimits.pickup_voltage.rel[value].v_dev.value = data2.value
                break
            }
        }
    }

    for(const data of entity.motorCharacteristicsBreakerInfo) {
        const found = breaker_constant.motor_characteristics.find(
            item => item.label === data.parameter_name
        );
        const value = found ? found.value : null;
        dto.assessmentLimits.motor_characteristics.abs[value].mrid = data.mrid
        dto.assessmentLimits.motor_characteristics.abs[value].min.mrid = data.min
        for(const data2 of entity.quantity) {
            if(data2.mrid == dto.assessmentLimits.motor_characteristics.abs[value].min.mrid){
                dto.assessmentLimits.motor_characteristics.abs[value].min.value = data2.value
                break
            }
        }
        dto.assessmentLimits.motor_characteristics.abs[value].max.mrid = data.max
        for(const data2 of entity.quantity) {
            if(data2.mrid == dto.assessmentLimits.motor_characteristics.abs[value].max.mrid) {
                dto.assessmentLimits.motor_characteristics.abs[value].max.value = data2.value
                break
            }
        }
        dto.assessmentLimits.motor_characteristics.rel[value].ref.mrid = data.ref
        for(const data2 of entity.quantity) {
            if(data2.mrid == dto.assessmentLimits.motor_characteristics.rel[value].ref.mrid) {
                dto.assessmentLimits.motor_characteristics.rel[value].ref.value = data2.value
                break
            }
        }
        dto.assessmentLimits.motor_characteristics.rel[value].dev.mrid = data.dev
        for(const data2 of entity.quantity) {
            if(data2.mrid == dto.assessmentLimits.motor_characteristics.rel[value].dev.mrid) {
                dto.assessmentLimits.motor_characteristics.rel[value].dev.value = data2.value
                break
            }
        }
    }
    
    for(const data of entity.underVoltageReleaseBreakerInfo) {
        dto.assessmentLimits.under_voltage_release.mrid = data.mrid
        dto.assessmentLimits.under_voltage_release.name = data.parameter_name
        dto.assessmentLimits.under_voltage_release.abs.uv_coil_trip_voltage.min.mrid = data.min
        for(const data2 of entity.voltage) {
            if(data2.mrid == dto.assessmentLimits.under_voltage_release.abs.uv_coil_trip_voltage.min.mrid) {
                dto.assessmentLimits.under_voltage_release.abs.uv_coil_trip_voltage.min.value = data2.value
                break
            }
        }
        dto.assessmentLimits.under_voltage_release.abs.uv_coil_trip_voltage.max.mrid = data.max
        for(const data2 of entity.voltage) {
            if(data2.mrid == dto.assessmentLimits.under_voltage_release.abs.uv_coil_trip_voltage.max.mrid) {
                dto.assessmentLimits.under_voltage_release.abs.uv_coil_trip_voltage.max.value = data2.value
                break
            }
        }
        dto.assessmentLimits.under_voltage_release.rel.uv_coil_trip_voltage.ref.mrid = data.ref
        for(const data2 of entity.voltage) {
            if(data2.mrid == dto.assessmentLimits.under_voltage_release.rel.uv_coil_trip_voltage.ref.mrid) {
                dto.assessmentLimits.under_voltage_release.rel.uv_coil_trip_voltage.ref.value = data2.value
                break
            }
        }
        dto.assessmentLimits.under_voltage_release.rel.uv_coil_trip_voltage.dev.mrid = data.dev
        for(const data2 of entity.voltage) {
            if(data2.mrid == dto.assessmentLimits.under_voltage_release.rel.uv_coil_trip_voltage.dev.mrid) {
                dto.assessmentLimits.under_voltage_release.rel.uv_coil_trip_voltage.dev.value = data2.value
                break
            }
        }
    }

    for(const data of entity.overcurrentReleaseBreakerInfo) {
        dto.assessmentLimits.overcurrent_release.mrid = data.mrid
        dto.assessmentLimits.overcurrent_release.name = data.parameter_name
        dto.assessmentLimits.overcurrent_release.abs.oc_replay_trip_current.min.mrid = data.min
        for(const data2 of entity.currentFlow) {
            if(data2.mrid == dto.assessmentLimits.overcurrent_release.abs.oc_replay_trip_current.min.mrid) {
                dto.assessmentLimits.overcurrent_release.abs.oc_replay_trip_current.min.value = data2.value
                break
            }
        }
        dto.assessmentLimits.overcurrent_release.abs.oc_replay_trip_current.max.mrid = data.max
        for(const data2 of entity.currentFlow) {
            if(data2.mrid == dto.assessmentLimits.overcurrent_release.abs.oc_replay_trip_current.max.mrid) {
                dto.assessmentLimits.overcurrent_release.abs.oc_replay_trip_current.max.value = data2.value
                break
            }
        }
        dto.assessmentLimits.overcurrent_release.rel.oc_replay_trip_current.ref.mrid = data.ref
        for(const data2 of entity.currentFlow) {
            if(data2.mrid == dto.assessmentLimits.overcurrent_release.rel.oc_replay_trip_current.ref.mrid) {
                dto.assessmentLimits.overcurrent_release.rel.oc_replay_trip_current.ref.value = data2.value
                break
            }
        }
        dto.assessmentLimits.overcurrent_release.rel.oc_replay_trip_current.dev.mrid = data.dev
        for(const data2 of entity.currentFlow) {
            if(data2.mrid == dto.assessmentLimits.overcurrent_release.rel.oc_replay_trip_current.dev.mrid) {
                dto.assessmentLimits.overcurrent_release.rel.oc_replay_trip_current.dev.value = data2.value
                break
            }
        }
    }

    return dto
}

const mappingUnit = (map, unitDto) => {
    if (!map || !unitDto) return;
    map.mrid = unitDto.mrid || null;
    map.value = unitDto.value || null;
    const unitParts = (unitDto.unit || '').split('|'); // ví dụ "k|V"
    map.multiplier = unitParts.length > 1 ? unitParts[0] : null;
    map.unit = unitParts.length > 1 ? unitParts[1] : unitParts[0] || null;
};