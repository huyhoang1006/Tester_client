/* eslint-disable */
import TransformerDto from "@/views/Dto/Transformer"
import TransformerEntity from "@/views/Flatten/Transformer"
import VoltageRating from "@/views/Cim/VoltageRating"
import Voltage from "@/views/Cim/Voltage"
import ApparentPower from "@/views/Cim/ApparentPower"
import Frequency from "@/views/Cim/Frequency"
import CoolingPowerRating from "@/views/Cim/CoolingPowerRating"
import CurrentRating from "@/views/Cim/CurrentRating"
import CurrentFlow from "@/views/Cim/CurrentFlow"
import Seconds from "@/views/Cim/Seconds"
import Temperature from "@/views/Cim/Temperature"
import ShortCircuitTest from "@/views/Cim/ShortCircuitTest"
import ShortCircuitTestTransformerEndInfo from "@/views/Flatten/ShortCircuitTestTransformerEndInfo"
import BasePower from "@/views/Cim/BasePower"
import BaseVoltage from "@/views/Cim/BaseVoltage"
import Percent from "@/views/Cim/Percent"
import ActivePower from "@/views/Cim/ActivePower"
import ZeroSequenceImpedanceTable from "@/views/Flatten/ZeroSequenceImpedanceTable"
import Volume from "@/views/Cim/Volume"
import Mass from "@/views/Cim/Mass"
import { UnitSymbol } from "@/views/Enum/UnitSymbol"
import { UnitMultiplier } from "@/views/Enum/UnitMultiplier"
import RatioTapChangerTablePoint from '@/views/Cim/RatioTapChangerTablePoint'
import BushingAssetEntity from "@/views/Flatten/Bushing"
import SurgeArresterEntity from '@/views/Flatten/SurgeArrester'
import Capacitance from "@/views/Cim/Capacitance"
import OldSurgeArresterInfo from "@/views/Cim/OldSurgeArresterInfo"

export const transformerDtoToEntity = (dto) => {
    const entity = new TransformerEntity();

    //properties
    entity.asset.mrid = dto.properties.mrid || null;
    entity.asset.kind = dto.properties.kind || null;
    entity.asset.type = dto.properties.type || null;
    entity.asset.serial_number = dto.properties.serial_no || null;
    entity.asset.asset_info = dto.oldPowerTransformerInfoId || null;
    entity.productAssetModel.manufacturer = dto.properties.manufacturer || null;
    entity.oldPowerTransformerInfo.manufacturer_type = dto.properties.manufacturer_type || null;
    entity.asset.product_asset_model = dto.productAssetModelId || null;
    entity.productAssetModel.mrid = dto.productAssetModelId || null;
    entity.asset.description = dto.properties.comment || null;
    entity.asset.location = dto.locationId || null;

    //lifecycleDate
    entity.lifecycleDate.manufactured_date = dto.properties.manufacturer_year || null;
    entity.lifecycleDate.mrid = dto.lifecycleDateId || null;
    entity.asset.lifecycle_date = dto.lifecycleDateId || null;

    //assetPsr
    entity.assetPsr.mrid = dto.assetPsrId || null;
    entity.assetPsr.asset_id = dto.properties.mrid || null;
    entity.assetPsr.psr_id = dto.psrId || null;

    /** ---------- attachment ---------- */
    entity.attachment.id = dto.attachmentId || null;
    entity.attachment = dto.attachment || null;

    entity.asset.country_of_origin = dto.properties.country_of_origin || null;
    entity.oldPowerTransformerInfo.mrid = dto.oldPowerTransformerInfoId || null;

    entity.asset.name = dto.properties.apparatus_id || null;
    entity.oldPowerTransformerInfo.phases = dto.winding_configuration.phases || null;
    if (dto.winding_configuration.unsupported_vector_group) {
        entity.oldPowerTransformerInfo.vector_group = dto.winding_configuration.unsupported_vector_group || null
    }
    if (dto.winding_configuration.vector_group_custom) {
        entity.oldPowerTransformerInfo.vector_group = dto.winding_configuration.vector_group_custom || null
        entity.oldPowerTransformerInfo.vector_group_type = 'custom'
    }
    if (dto.winding_configuration.vector_group_unsupport) {
        entity.oldPowerTransformerInfo.vector_group = dto.winding_configuration.unsupported_vector_group || null
        entity.oldPowerTransformerInfo.vector_group_type = 'unsupport'
    }
    if (dto.winding_configuration.vector_group_data) {
        entity.oldPowerTransformerInfo.vector_group = ''
        if (dto.winding_configuration.vector_group.prim.includes('Spare I')) {
            entity.oldPowerTransformerInfo.vector_group += 'I'
        } else {
            entity.oldPowerTransformerInfo.vector_group += dto.winding_configuration.vector_group.prim
        }
        entity.oldPowerTransformerInfo.vector_group += dto.winding_configuration.vector_group.sec.i
        entity.oldPowerTransformerInfo.vector_group += dto.winding_configuration.vector_group.sec.value
        entity.oldPowerTransformerInfo.vector_group += dto.winding_configuration.vector_group.tert.i
        entity.oldPowerTransformerInfo.vector_group += dto.winding_configuration.vector_group.tert.value
        entity.oldPowerTransformerInfo.vector_group_type = null
    }

    //oldTransformerEndInfo
    for (let item of dto.oldTransformerEndInfo) {
        if (item.end_number === 1) {
            item.power_transformer_info_id = entity.oldPowerTransformerInfo.mrid || null;
            if (dto.winding_configuration.vector_group.prim.includes('Spare I')) {
                item.connection_kind = 'I';
                item.spare = true;
            } else {
                if (["IA", "IB", "IC", "IBC", "IAB", "IAC"].includes(dto.winding_configuration.vector_group.prim)) {
                    item.connection_kind = 'I';
                    item.phase = dto.winding_configuration.vector_group.prim.substring(1)
                } else {
                    item.connection_kind = dto.winding_configuration.vector_group.prim || null;
                }
            }
            item.material = dto.others.winding.prim || null;
            entity.oldTransformerEndInfo.push(item);
        } else if (item.end_number === 2) {
            item.power_transformer_info_id = entity.oldPowerTransformerInfo.mrid || null;
            if (dto.winding_configuration.vector_group.sec.i.includes('Spare I')) {
                item.connection_kind = 'I';
                item.spare = true;
            } else {
                item.connection_kind = dto.winding_configuration.vector_group.sec.i || null;
            }
            item.material = dto.others.winding.sec || null;
            item.phase_angle_clock = dto.winding_configuration.vector_group.sec.value || null;
            entity.oldTransformerEndInfo.push(item);
        } else if (item.end_number === 3) {
            item.power_transformer_info_id = entity.oldPowerTransformerInfo.mrid || null;
            if (dto.winding_configuration.vector_group.tert.i.includes('Spare I')) {
                item.connection_kind = 'I';
                item.spare = true;
            } else {
                item.connection_kind = dto.winding_configuration.vector_group.tert.i || null;
            }
            item.material = dto.others.winding.tert || null;
            item.phase_angle_clock = dto.winding_configuration.vector_group.tert.value || null;
            item.accessibility = dto.winding_configuration.vector_group.tert.accessible || null;
            entity.oldTransformerEndInfo.push(item);
        }
    }

    //rated frequency
    if (dto.ratings.rated_frequency.value === 'Custom') {
        const frequency = new Frequency();
        frequency.mrid = dto.ratings.rated_frequency.mrid || null;
        entity.oldPowerTransformerInfo.rated_frequency = dto.ratings.rated_frequency.mrid || null;
        const unitParts = (dto.ratings.rated_frequency.unit || '').split('|');
        frequency.multiplier = unitParts.length > 1 ? unitParts[0] : null;
        frequency.unit = unitParts.length > 1 ? unitParts[1] : unitParts[0] || null;
        frequency.value = dto.ratings.rated_frequency.custom_value || null;
        entity.frequency.push(frequency);
    } else {
        entity.oldPowerTransformerInfo.rated_frequency = dto.ratings.rated_frequency.mrid || null;
        const frequency = new Frequency();
        mappingUnit(frequency, dto.ratings.rated_frequency)
        entity.frequency.push(frequency);
    }

    //Voltage ratings
    for (let item of dto.ratings.voltage_ratings) {
        const voltageRating = new VoltageRating();
        voltageRating.mrid = item.mrid || null
        if (item.winding == 'Prim') {
            for (let i = 0; i < dto.oldTransformerEndInfo.length; i++) {
                if (dto.oldTransformerEndInfo[i].end_number === 1) {
                    voltageRating.transformer_end_id = dto.oldTransformerEndInfo[i].mrid || null;
                    break;
                }
            }
        } else if (item.winding == 'Sec') {
            for (let i = 0; i < dto.oldTransformerEndInfo.length; i++) {
                if (dto.oldTransformerEndInfo[i].end_number === 2) {
                    voltageRating.transformer_end_id = dto.oldTransformerEndInfo[i].mrid || null;
                    break;
                }
            }
        } else if (item.winding == 'Tert') {
            for (let i = 0; i < dto.oldTransformerEndInfo.length; i++) {
                if (dto.oldTransformerEndInfo[i].end_number === 3) {
                    voltageRating.transformer_end_id = dto.oldTransformerEndInfo[i].mrid || null;
                    break;
                }
            }
        }
        //voltage_ll
        voltageRating.rated_u = item.voltage_ll.mrid || null
        let voltage = new Voltage();
        mappingUnit(voltage, item.voltage_ll)
        entity.voltage.push(voltage);

        //voltage_ln
        voltageRating.rated_ln = item.voltage_ln.mrid || null
        voltage = new Voltage();
        mappingUnit(voltage, item.voltage_ln)
        entity.voltage.push(voltage);

        //insulation bil
        voltageRating.insulation_u = item.insul_level_ll.mrid || null
        voltage = new Voltage();
        mappingUnit(voltage, item.insul_level_ll)
        entity.voltage.push(voltage);

        //insulation class
        voltageRating.insulation_c = item.insulation_class || null

        voltageRating.regulation = item.voltage_regulation || null
        entity.voltageRating.push(voltageRating);
    }

    //Power ratings
    for (let item of dto.ratings.power_ratings) {
        const powerRating = new CoolingPowerRating();
        powerRating.mrid = item.mrid || null;
        powerRating.power_transformer_info_id = entity.oldPowerTransformerInfo.mrid || null;

        //rated_power
        powerRating.power_rating = item.rated_power.mrid || null
        let apparentPower = new ApparentPower();
        mappingUnit(apparentPower, item.rated_power)
        entity.apparentPower.push(apparentPower);

        //cooling class
        powerRating.cooling_kind = item.cooling_class || null

        //temp_rise_wind
        powerRating.temp_rise_wind = item.temp_rise_wind.mrid || null
        let temperatureWind = new Temperature();
        mappingUnit(temperatureWind, item.temp_rise_wind)
        entity.temperature.push(temperatureWind);

        entity.coolingPowerRating.push(powerRating);
    }

    //Current ratings
    for (let [index, item] of dto.ratings.current_ratings.entries()) {

        if (item.prim.mrid && item.prim.mrid !== '') {
            const currentRatingPrim = new CurrentRating();
            currentRatingPrim.mrid = item.prim.mrid || null;
            for (let i = 0; i < dto.oldTransformerEndInfo.length; i++) {
                if (dto.oldTransformerEndInfo[i].end_number === 1) {
                    currentRatingPrim.transformer_end_id = dto.oldTransformerEndInfo[i].mrid || null;
                    break;
                }
            }
            currentRatingPrim.rated_power = dto.ratings.power_ratings[index].rated_power.mrid || null;
            currentRatingPrim.value = item.prim.data.mrid
            let currentFlow = new CurrentFlow();
            mappingUnit(currentFlow, item.prim.data)
            entity.currentFlow.push(currentFlow);
            entity.currentRating.push(currentRatingPrim);
        }

        if (item.sec.mrid && item.sec.mrid !== '') {
            const currentRatingSec = new CurrentRating();
            currentRatingSec.mrid = item.sec.mrid || null;
            for (let i = 0; i < dto.oldTransformerEndInfo.length; i++) {
                if (dto.oldTransformerEndInfo[i].end_number === 2) {
                    currentRatingSec.transformer_end_id = dto.oldTransformerEndInfo[i].mrid || null;
                    break;
                }
            }
            currentRatingSec.rated_power = dto.ratings.power_ratings[index].rated_power.mrid || null;
            currentRatingSec.value = item.sec.data.mrid
            let currentFlow = new CurrentFlow();
            mappingUnit(currentFlow, item.sec.data)
            entity.currentFlow.push(currentFlow);
            entity.currentRating.push(currentRatingSec);
        }

        if (item.tert.mrid && item.tert.mrid !== '') {
            const currentRatingTert = new CurrentRating();
            currentRatingTert.mrid = item.tert.mrid || null;
            for (let i = 0; i < dto.oldTransformerEndInfo.length; i++) {
                if (dto.oldTransformerEndInfo[i].end_number === 3) {
                    currentRatingTert.transformer_end_id = dto.oldTransformerEndInfo[i].mrid || null;
                    break;
                }
            }
            currentRatingTert.rated_power = dto.ratings.power_ratings[index].rated_power.mrid || null;
            currentRatingTert.value = item.tert.data.mrid
            let currentFlow = new CurrentFlow();
            mappingUnit(currentFlow, item.tert.data)
            entity.currentFlow.push(currentFlow);
            entity.currentRating.push(currentRatingTert)
        }
    }

    //Short-circuit ratings
    if (dto.ratings.short_circuit.mrid && dto.ratings.short_circuit.mrid !== '') {
        entity.shortCircuitRating.mrid = dto.ratings.short_circuit.mrid || null;
        entity.shortCircuitRating.power_transformer_info_id = entity.oldPowerTransformerInfo.mrid || null;
        if (dto.ratings.short_circuit.ka.mrid && dto.ratings.short_circuit.ka.mrid !== '') {
            entity.shortCircuitRating.short_circuit_current = dto.ratings.short_circuit.ka.mrid || null;
            const currentFlow = new CurrentFlow();
            mappingUnit(currentFlow, dto.ratings.short_circuit.ka)
            entity.currentFlow.push(currentFlow);
        }
        if (dto.ratings.short_circuit.s.mrid && dto.ratings.short_circuit.s.mrid !== '') {
            entity.shortCircuitRating.duration_seconds = dto.ratings.short_circuit.s.mrid || null;
            const second = new Seconds();
            mappingUnit(second, dto.ratings.short_circuit.s)
            entity.seconds.push(second);
        }
    }

    //rated temperature
    entity.oldPowerTransformerInfo.impedance_temperature = dto.impedances.ref_temp.mrid || null;
    const temperature = new Temperature();
    mappingUnit(temperature, dto.impedances.ref_temp)
    entity.temperature.push(temperature);


    let transformer_end_info_prim_id = null;
    for (let i = 0; i < dto.oldTransformerEndInfo.length; i++) {
        if (dto.oldTransformerEndInfo[i].end_number == 1) {
            transformer_end_info_prim_id = dto.oldTransformerEndInfo[i].mrid || null;
            break;
        }
    }
    let transformer_end_info_second_id = null;
    for (let i = 0; i < dto.oldTransformerEndInfo.length; i++) {
        if (dto.oldTransformerEndInfo[i].end_number == 2) {
            transformer_end_info_second_id = dto.oldTransformerEndInfo[i].mrid || null;
            break;
        }
    }
    let transformer_end_info_third_id = null;
    for (let i = 0; i < dto.oldTransformerEndInfo.length; i++) {
        if (dto.oldTransformerEndInfo[i].end_number == 3) {
            transformer_end_info_third_id = dto.oldTransformerEndInfo[i].mrid || null;
            break;
        }
    }

    //short-circuit test
    if (dto.impedances.prim_sec && dto.impedances.prim_sec.length > 0) {
        for (let item of dto.impedances.prim_sec) {
            const shortCircuitTest = new ShortCircuitTest();
            shortCircuitTest.mrid = item.mrid || null;
            shortCircuitTest.energised_end = transformer_end_info_prim_id || null;

            for (let j = 0; j < dto.shortCircuitTestTransformerEndInfo.length; j++) {
                if (dto.shortCircuitTestTransformerEndInfo[j].short_circuit_test_id === item.mrid) {
                    const shortCircuitTestTransformerEndInfo = new ShortCircuitTestTransformerEndInfo();
                    shortCircuitTestTransformerEndInfo.mrid = dto.shortCircuitTestTransformerEndInfo[j].mrid || null;
                    shortCircuitTestTransformerEndInfo.transformer_end_info_id = transformer_end_info_second_id || null;
                    shortCircuitTestTransformerEndInfo.short_circuit_test_id = dto.shortCircuitTestTransformerEndInfo[j].short_circuit_test_id || null;
                    entity.shortCircuitTestTransformerEndInfo.push(shortCircuitTestTransformerEndInfo);
                    break;
                }
            }

            shortCircuitTest.base_power = item.base_power.mrid || null;
            const basePower = new BasePower();
            basePower.mrid = item.base_power.mrid || null;
            basePower.base_power = item.base_power.data.mrid || null;
            const apparentPower = new ApparentPower();
            mappingUnit(apparentPower, item.base_power.data)
            entity.basePower.push(basePower);
            entity.apparentPower.push(apparentPower);

            shortCircuitTest.base_voltage = item.base_voltage.mrid || null;
            const baseVoltage = new BaseVoltage();
            baseVoltage.mrid = item.base_voltage.mrid || null;
            baseVoltage.nominal_voltage = item.base_voltage.data.mrid || null;
            const voltage = new Voltage();
            mappingUnit(voltage, item.base_voltage.data)
            entity.baseVoltage.push(baseVoltage);
            entity.voltage.push(voltage);

            shortCircuitTest.voltage = item.short_circuit_impedances_uk.mrid || null;
            const percent = new Percent();
            mappingUnit(percent, item.short_circuit_impedances_uk)
            entity.percent.push(percent);

            shortCircuitTest.loss = item.load_losses_pk.mrid || null;
            const activePower = new ActivePower();
            mappingUnit(activePower, item.load_losses_pk)
            entity.activePower.push(activePower);

            shortCircuitTest.temperature = dto.impedances.ref_temp.mrid || null;
            entity.shortCircuitTest.push(shortCircuitTest);
        }
    }

    if (dto.impedances.sec_tert && dto.impedances.sec_tert.length > 0) {
        for (let item of dto.impedances.sec_tert) {
            const shortCircuitTest = new ShortCircuitTest();
            shortCircuitTest.mrid = item.mrid || null;
            shortCircuitTest.energised_end = transformer_end_info_second_id || null;

            for (let j = 0; j < dto.shortCircuitTestTransformerEndInfo.length; j++) {
                if (dto.shortCircuitTestTransformerEndInfo[j].short_circuit_test_id === item.mrid) {
                    const shortCircuitTestTransformerEndInfo = new ShortCircuitTestTransformerEndInfo();
                    shortCircuitTestTransformerEndInfo.mrid = dto.shortCircuitTestTransformerEndInfo[j].mrid || null;
                    shortCircuitTestTransformerEndInfo.transformer_end_info_id = transformer_end_info_third_id || null;
                    shortCircuitTestTransformerEndInfo.short_circuit_test_id = dto.shortCircuitTestTransformerEndInfo[j].short_circuit_test_id || null;
                    entity.shortCircuitTestTransformerEndInfo.push(shortCircuitTestTransformerEndInfo);
                    break;
                }
            }

            shortCircuitTest.base_power = item.base_power.mrid || null;
            const basePower = new BasePower();
            basePower.mrid = item.base_power.mrid || null;
            basePower.base_power = item.base_power.data.mrid || null;
            const apparentPower = new ApparentPower();
            mappingUnit(apparentPower, item.base_power.data)
            entity.basePower.push(basePower);
            entity.apparentPower.push(apparentPower);

            shortCircuitTest.base_voltage = item.base_voltage.mrid || null;
            const baseVoltage = new BaseVoltage();
            baseVoltage.mrid = item.base_voltage.mrid || null;
            baseVoltage.nominal_voltage = item.base_voltage.data.mrid || null;
            const voltage = new Voltage();
            mappingUnit(voltage, item.base_voltage.data)
            entity.baseVoltage.push(baseVoltage);
            entity.voltage.push(voltage);

            shortCircuitTest.voltage = item.short_circuit_impedances_uk.mrid || null;
            const percent = new Percent();
            mappingUnit(percent, item.short_circuit_impedances_uk)
            entity.percent.push(percent);

            shortCircuitTest.loss = item.load_losses_pk.mrid || null;
            const activePower = new ActivePower();
            mappingUnit(activePower, item.load_losses_pk)
            entity.activePower.push(activePower);

            shortCircuitTest.temperature = dto.impedances.ref_temp.mrid || null;
            entity.shortCircuitTest.push(shortCircuitTest);
        }
    }

    if (dto.impedances.prim_tert && dto.impedances.prim_tert.length > 0) {
        for (let item of dto.impedances.prim_tert) {
            const shortCircuitTest = new ShortCircuitTest();
            shortCircuitTest.mrid = item.mrid || null;
            shortCircuitTest.energised_end = transformer_end_info_prim_id || null;

            for (let j = 0; j < dto.shortCircuitTestTransformerEndInfo.length; j++) {
                if (dto.shortCircuitTestTransformerEndInfo[j].short_circuit_test_id === item.mrid) {
                    const shortCircuitTestTransformerEndInfo = new ShortCircuitTestTransformerEndInfo();
                    shortCircuitTestTransformerEndInfo.mrid = dto.shortCircuitTestTransformerEndInfo[j].mrid || null;
                    shortCircuitTestTransformerEndInfo.transformer_end_info_id = transformer_end_info_third_id || null;
                    shortCircuitTestTransformerEndInfo.short_circuit_test_id = dto.shortCircuitTestTransformerEndInfo[j].short_circuit_test_id || null;
                    entity.shortCircuitTestTransformerEndInfo.push(shortCircuitTestTransformerEndInfo);
                    break;
                }
            }

            shortCircuitTest.base_power = item.base_power.mrid || null;
            const basePower = new BasePower();
            basePower.mrid = item.base_power.mrid || null;
            basePower.base_power = item.base_power.data.mrid || null;
            const apparentPower = new ApparentPower();
            mappingUnit(apparentPower, item.base_power.data)
            entity.basePower.push(basePower);
            entity.apparentPower.push(apparentPower);

            shortCircuitTest.base_voltage = item.base_voltage.mrid || null;
            const baseVoltage = new BaseVoltage();
            baseVoltage.mrid = item.base_voltage.mrid || null;
            baseVoltage.nominal_voltage = item.base_voltage.data.mrid || null;
            const voltage = new Voltage();
            mappingUnit(voltage, item.base_voltage.data)
            entity.baseVoltage.push(baseVoltage);
            entity.voltage.push(voltage);

            shortCircuitTest.voltage = item.short_circuit_impedances_uk.mrid || null;
            const percent = new Percent();
            mappingUnit(percent, item.short_circuit_impedances_uk)
            entity.percent.push(percent);

            shortCircuitTest.loss = item.load_losses_pk.mrid || null;
            const activePower = new ActivePower();
            mappingUnit(activePower, item.load_losses_pk)
            entity.activePower.push(activePower);

            shortCircuitTest.temperature = dto.impedances.ref_temp.mrid || null;
            entity.shortCircuitTest.push(shortCircuitTest);
        }
    }

    //zero sequence impedances
    entity.zeroSequenceImpedance.mrid = dto.impedances.zero_sequence_impedance.mrid || null;
    entity.zeroSequenceImpedance.power_transformer_info_id = dto.oldPowerTransformerInfoId || null;
    entity.zeroSequenceImpedance.base_power = dto.impedances.zero_sequence_impedance.base_power.mrid || null;
    entity.zeroSequenceImpedance.base_voltage = dto.impedances.zero_sequence_impedance.base_voltage.mrid || null;
    const basePower = new BasePower();
    basePower.mrid = dto.impedances.zero_sequence_impedance.base_power.mrid || null;
    basePower.base_power = dto.impedances.zero_sequence_impedance.base_power.data.mrid || null;
    const apparentPower = new ApparentPower();
    mappingUnit(apparentPower, dto.impedances.zero_sequence_impedance.base_power.data)
    entity.basePower.push(basePower);
    entity.apparentPower.push(apparentPower);

    const baseVoltage = new BaseVoltage();
    baseVoltage.mrid = dto.impedances.zero_sequence_impedance.base_voltage.mrid || null;
    baseVoltage.nominal_voltage = dto.impedances.zero_sequence_impedance.base_voltage.data.mrid || null;
    const voltage = new Voltage();
    mappingUnit(voltage, dto.impedances.zero_sequence_impedance.base_voltage.data)
    entity.baseVoltage.push(baseVoltage);
    entity.voltage.push(voltage);

    for (let key in dto.impedances.zero_sequence_impedance.zero_percent) {
        const zeroSequenceImpedanceTable = new ZeroSequenceImpedanceTable();
        zeroSequenceImpedanceTable.mrid = dto.impedances.zero_sequence_impedance.zero_percent[key].mrid || null;
        zeroSequenceImpedanceTable.zero_sequence_impedance = dto.impedances.zero_sequence_impedance.mrid || null;
        zeroSequenceImpedanceTable.zero = dto.impedances.zero_sequence_impedance.zero_percent[key].data.mrid || null;
        if (key == 'prim') {
            for (let i = 0; i < dto.oldTransformerEndInfo.length; i++) {
                if (dto.oldTransformerEndInfo[i].end_number === 1) {
                    zeroSequenceImpedanceTable.transformer_end_id = dto.oldTransformerEndInfo[i].mrid || null;
                    break;
                }
            }
        }
        else if (key == 'sec') {
            for (let i = 0; i < dto.oldTransformerEndInfo.length; i++) {
                if (dto.oldTransformerEndInfo[i].end_number === 2) {
                    zeroSequenceImpedanceTable.transformer_end_id = dto.oldTransformerEndInfo[i].mrid || null;
                    break;
                }
            }
        }
        const percent = new Percent();
        mappingUnit(percent, dto.impedances.zero_sequence_impedance.zero_percent[key].data)
        entity.percent.push(percent);
        entity.zeroSequenceImpedanceTable.push(zeroSequenceImpedanceTable);
    }

    //Others
    entity.other.category = dto.others.category || null;
    entity.other.mrid = dto.others.mrid || null;
    entity.asset.in_use_state = dto.others.status || null;
    entity.other.insulation_medium = dto.others.insulation_medium || null;
    entity.other.insulation_key = dto.others.insulation.key || null;
    entity.other.insulation_volume = dto.others.insulation.volume.mrid || null;
    entity.other.power_transformer_info_id = entity.oldPowerTransformerInfo.mrid || null;
    entity.other.tank_type = dto.others.tank_type
    const volume = new Volume();
    mappingUnit(volume, dto.others.insulation.volume)
    entity.volume.push(volume);

    entity.other.insulation_weight = dto.others.insulation.weight.mrid || null;
    const mass = new Mass();
    mappingUnit(mass, dto.others.insulation.weight)
    entity.mass.push(mass);

    entity.productAssetModel.weight_total = dto.others.total_weight.mrid || null;
    const weightMass = new Mass();
    mappingUnit(weightMass, dto.others.total_weight)
    entity.mass.push(weightMass);

    entity.tapChanger.asset.mrid = dto.tap_changers.mrid || null
    entity.tapChanger.asset.serial_number = dto.tap_changers.serial_no || null
    entity.tapChanger.asset.kind = 'Tap changer'
    entity.tapChanger.oldTapChangerInfo.product_asset_model = dto.tap_changers.productAssetModelId || null
    entity.tapChanger.productAssetModel.manufacturer = dto.tap_changers.manufacturer || null
    entity.tapChanger.productAssetModel.mrid = dto.tap_changers.productAssetModelId || null
    entity.tapChanger.asset.asset_info = dto.tap_changers.assetId || null
    entity.tapChanger.oldTapChangerInfo.mrid = dto.tap_changers.assetId || null
    entity.tapChanger.oldTapChangerInfo.manufacturer_type = dto.tap_changers.manufacturer_type || null

    for (const transformer_end_info of entity.oldTransformerEndInfo) {
        if (transformer_end_info.end_number == 1 && dto.tap_changers.winding == 'Prim') {
            entity.tapChanger.oldTapChangerInfo.transformer_end_info = transformer_end_info.mrid || null
            break
        } else if (transformer_end_info.end_number == 2 && dto.tap_changers.winding == 'Sec') {
            entity.tapChanger.oldTapChangerInfo.transformer_end_info = transformer_end_info.mrid || null
            break
        } else if (transformer_end_info.end_number == 3 && dto.tap_changers.winding == 'Tert') {
            entity.tapChanger.oldTapChangerInfo.transformer_end_info = transformer_end_info.mrid || null
            break
        }
    }
    entity.tapChanger.oldTapChangerInfo.tap_scheme = dto.tap_changers.tap_scheme || null
    entity.tapChanger.oldTapChangerInfo.number_of_tap = dto.tap_changers.no_of_taps || null
    entity.tapChanger.oldTapChangerInfo.power_transformer_info_id = dto.oldPowerTransformerInfoId || null;
    entity.tapChanger.assetPsr.asset_id = dto.tap_changers.mrid || null
    entity.tapChanger.assetPsr.psr_id = dto.tap_changers.assetPsr.psr_id || null
    entity.tapChanger.assetPsr.mrid = dto.tap_changers.assetPsr.mrid || null
    entity.tapChanger.ratioTapChanger.mrid = dto.tap_changers.assetPsr.psr_id || null
    entity.tapChanger.ratioTapChanger.ratio_tap_changer_table = dto.tap_changers.ratioTapchangerTableId || null
    if (dto.tap_changers.mode == 'oltc') {
        entity.tapChanger.ratioTapChanger.control_enabled = true
        entity.tapChanger.ratioTapChanger.ltc_flag = true
    } else {
        entity.tapChanger.ratioTapChanger.control_enabled = null
        entity.tapChanger.ratioTapChanger.ltc_flag = null
    }
    entity.tapChanger.ratioTapChangerTable.mrid = dto.tap_changers.ratioTapchangerTableId || null
    for (const point of dto.tap_changers.voltage_table) {
        const ratioTapChangerTablePoint = new RatioTapChangerTablePoint()
        ratioTapChangerTablePoint.mrid = point.id
        ratioTapChangerTablePoint.step = point.tap
        ratioTapChangerTablePoint.ratio = point.voltage
        ratioTapChangerTablePoint.ratio_tap_changer_table = dto.tap_changers.ratioTapchangerTableId
        entity.tapChanger.ratioTapChangerTablePoint.push(ratioTapChangerTablePoint)
    }

    const winding = ['prim', 'sec', 'tert']
    for (const winding_data of winding) {
        for (const bushing of dto.bushing_data[winding_data]) {
            const bushingAsset = new BushingAssetEntity()
            bushingAsset.bushing.mrid = bushing.mrid || null
            bushingAsset.bushing.kind = 'Bushing'
            bushingAsset.bushing.asset_info = bushing.assetInfoId || null
            bushingAsset.bushing.type = bushing.asset_type || null
            bushingAsset.bushing.product_asset_model = bushing.productAssetModelId || null
            bushingAsset.oldBushingInfo.mrid = bushing.assetInfoId || null
            bushingAsset.oldBushingInfo.manufacturer_type = bushing.manufacturer_type || null
            bushingAsset.oldBushingInfo.product_asset_model = bushing.productAssetModelId || null
            bushingAsset.oldBushingInfo.insulation_kind = bushing.insulation_type || null
            bushingAsset.bushing.serial_number = bushing.serial_no || null
            bushingAsset.productAssetModel.mrid = bushing.productAssetModelId || null
            bushingAsset.productAssetModel.manufacturer = bushing.manufacturer || null
            bushingAsset.bushing.lifecycle_date = bushing.lifecycleDateId || null
            bushingAsset.lifecycleDate.mrid = bushing.lifecycleDateId || null
            bushingAsset.lifecycleDate.manufactured_date = bushing.manufacturer_year || null

            bushingAsset.oldBushingInfo.c_capacitance = bushing.cap_c1.mrid || null
            const capC1 = new Capacitance();
            mappingUnit(capC1, bushing.cap_c1)
            bushingAsset.capacitance.push(capC1)

            bushingAsset.oldBushingInfo.c2_capacitance = bushing.cap_c2.mrid || null
            const capC2 = new Capacitance()
            mappingUnit(capC2, bushing.cap_c2)
            bushingAsset.capacitance.push(capC2)

            bushingAsset.oldBushingInfo.c_power_factor = bushing.df_c1.mrid || null
            const dfC1 = new Percent();
            mappingUnit(dfC1, bushing.df_c1)
            bushingAsset.percent.push(dfC1)

            bushingAsset.oldBushingInfo.c2_power_factor = bushing.df_c2.mrid || null
            const dfC2 = new Percent();
            mappingUnit(dfC2, bushing.df_c2)
            bushingAsset.percent.push(dfC2)

            bushingAsset.oldBushingInfo.rated_impulse_withstand_voltage = bushing.insulation_level.mrid || null
            const voltage = new Voltage()
            mappingUnit(voltage, bushing.insulation_level)
            bushingAsset.voltage.push(voltage)

            bushingAsset.oldBushingInfo.high_voltage_limit = bushing.max_system_voltage.mrid || null
            const highVoLlimit = new Voltage();
            mappingUnit(highVoLlimit, bushing.max_system_voltage)
            bushingAsset.voltage.push(highVoLlimit)

            bushingAsset.oldBushingInfo.rated_current = bushing.rate_current.mrid || null
            const currentFlow = new CurrentFlow();
            mappingUnit(currentFlow, bushing.rate_current)
            bushingAsset.currentFlow.push(currentFlow)

            bushingAsset.oldBushingInfo.rated_line_to_ground_voltage = bushing.voltage_l_ground.mrid || null
            const voltageVolGround = new Voltage();
            mappingUnit(voltageVolGround, bushing.voltage_l_ground)
            bushingAsset.voltage.push(voltageVolGround)

            bushingAsset.oldBushingInfo.phase = bushing.pos
            for (const transformer_end_info of entity.oldTransformerEndInfo) {
                if (transformer_end_info.end_number == 1 && winding_data == 'prim') {
                    bushingAsset.oldBushingInfo.transformer_end_info = transformer_end_info.mrid
                    break
                } else if (transformer_end_info.end_number == 2 && winding_data == 'sec') {
                    bushingAsset.oldBushingInfo.transformer_end_info = transformer_end_info.mrid
                    break
                } else if (transformer_end_info.end_number == 3 && winding_data == 'tert') {
                    bushingAsset.oldBushingInfo.transformer_end_info = transformer_end_info.mrid
                    break
                }
            }

            entity.bushing.push(bushingAsset)
        }
    }

    for (const winding_data of winding) {
        for (const surge of dto.surge_arrester[winding_data]) {
            if (surge.sign == true) {
                const surgeArresterAsset = new SurgeArresterEntity()
                surgeArresterAsset.surgeArrester.mrid = surge.properties.mrid || null
                surgeArresterAsset.surgeArrester.serial_number = surge.properties.serial_no || null
                surgeArresterAsset.surgeArrester.alias_name = surge.properties.asset_system_code || null
                surgeArresterAsset.surgeArrester.asset_info = surge.properties.assetInfoId || null
                surgeArresterAsset.surgeArrester.product_asset_model = surge.properties.productAssetModelId || null
                surgeArresterAsset.surgeArrester.kind = 'Surge arrester'
                surgeArresterAsset.productAssetModel.mrid = surge.properties.productAssetModelId || null
                surgeArresterAsset.productAssetModel.manufacturer = surge.properties.manufacturer || null
                surgeArresterAsset.surgeArrester.lifecycle_date = surge.properties.lifecycleDateId || null
                surgeArresterAsset.lifecycleDate.mrid = surge.properties.lifecycleDateId || null
                surgeArresterAsset.lifecycleDate.manufactured_date = surge.properties.manufacturer_year || null
                surgeArresterAsset.surgeArrester.unit_count = surge.ratings.unit || null
                for (const surgeInfo of surge.ratings.table) {
                    const oldSurgeArresterInfo = new OldSurgeArresterInfo()
                    oldSurgeArresterInfo.mrid = surgeInfo.mrid || null
                    oldSurgeArresterInfo.serial_number = surgeInfo.serial_no || null

                    oldSurgeArresterInfo.voltage_ll = surgeInfo.voltageLl.mrid || null
                    const voltageLl = new Voltage();
                    mappingUnit(voltageLl, surgeInfo.voltageLl)
                    surgeArresterAsset.voltage.push(voltageLl)

                    oldSurgeArresterInfo.voltage_ln = surgeInfo.voltageLn.mrid || null
                    const voltageLn = new Voltage();
                    mappingUnit(voltageLn, surgeInfo.voltageLn)
                    surgeArresterAsset.voltage.push(voltageLn)

                    oldSurgeArresterInfo.continuous_operating_voltage = surgeInfo.mcovRating.mrid || null
                    const voltage = new Voltage();
                    mappingUnit(voltage, surgeInfo.mcovRatingData)
                    surgeArresterAsset.voltage.push(voltage)

                    surgeArresterAsset.oldSurgeArresterInfo.push(oldSurgeArresterInfo)
                }

                entity.surgeArrester.push(surgeArresterAsset)
            }
        }
    }

    return entity

}

export const transformerEntityToDto = (entity) => {
    const dto = new TransformerDto();
    dto.properties.mrid = entity.asset.mrid || ''
    dto.properties.kind = entity.asset.kind || ''
    dto.properties.type = entity.asset.type || ''
    dto.properties.apparatus_id = entity.asset.name || ''
    dto.properties.country_of_origin = entity.asset.country_of_origin || ''
    dto.properties.serial_no = entity.asset.serial_number || ''
    dto.productAssetModelId = entity.productAssetModel.mrid || ''
    dto.properties.manufacturer = entity.productAssetModel.manufacturer || ''
    dto.properties.manufacturer_type = entity.oldPowerTransformerInfo.manufacturer_type || ''
    dto.lifecycleDateId = entity.lifecycleDate.mrid || ''
    dto.properties.manufacturer_year = entity.lifecycleDate.manufactured_date || ''
    dto.properties.comment = entity.asset.description || ''
    dto.locationId = entity.asset.location || ''
    dto.assetPsrId = entity.assetPsr.mrid || ''
    dto.attachmentId = entity.attachment.id || '';
    dto.attachment = entity.attachment;

    dto.oldPowerTransformerInfoId = entity.oldPowerTransformerInfo.mrid || ''
    dto.winding_configuration.phases = entity.oldPowerTransformerInfo.phases || ''
    if (entity.oldPowerTransformerInfo.vector_group_type == "custom") {
        dto.winding_configuration.vector_group_custom = entity.oldPowerTransformerInfo.vector_group || ''
    } else if (entity.oldPowerTransformerInfo.vector_group_type == "unsupport") {
        dto.winding_configuration.unsupported_vector_group = entity.oldPowerTransformerInfo.vector_group || ''
    } else {
        dto.winding_configuration.vector_group_data = entity.oldPowerTransformerInfo.vector_group || ''
        dto.oldTransformerEndInfo = entity.oldTransformerEndInfo || []
        for (const winding of dto.oldTransformerEndInfo) {
            if (winding.end_number == 1) {
                if (winding.spare == true) {
                    dto.winding_configuration.vector_group.prim = 'Spare I'
                } else {
                    dto.winding_configuration.vector_group.prim = winding.connection_kind + winding.phase || ''
                }
            } else if (winding.end_number == 2) {
                dto.winding_configuration.vector_group.sec.i = winding.connection_kind || ''
                dto.winding_configuration.vector_group.sec.value = winding.phase_angle_clock || ''
            } else if (winding.end_number == 3) {
                dto.winding_configuration.vector_group.tert.i = winding.connection_kind || ''
                dto.winding_configuration.vector_group.tert.value = winding.phase_angle_clock || ''
                dto.winding_configuration.vector_group.tert.accessible = winding.accessibility || ''
            }
        }
    }
    dto.ratings.rated_frequency.mrid = entity.oldPowerTransformerInfo.rated_frequency || ''
    for (const data of entity.frequency) {
        if (data.mrid == entity.oldPowerTransformerInfo.rated_frequency) {
            if (['50', '60', '16.7'].includes(data.value)) {
                dto.ratings.rated_frequency.value = data.value
            } else {
                dto.ratings.rated_frequency.custom_value = data.value
            }
            break
        }
    }

    for (const voltageRating of entity.voltageRating) {
        const dataVoltageRating = {
            mrid: '',
            winding: '',
            voltage_ll: {
                mrid: '',
                value: '',
                unit: 'k|V'
            },
            voltage_ln: {
                mrid: '',
                value: '',
                unit: 'k|V'
            },
            insul_level_ll: {
                mrid: '',
                value: '',
                unit: 'k|V'
            },
            voltage_regulation: '',
            insulation_class: ''
        }
        dataVoltageRating.mrid = voltageRating.mrid || ''
        for (const transformerEndInfo of entity.oldTransformerEndInfo) {
            if (transformerEndInfo.mrid == voltageRating.transformer_end_id) {
                if (transformerEndInfo.end_number == 1) {
                    dataVoltageRating.winding = "Prim"
                } else if (transformerEndInfo.end_number == 2) {
                    dataVoltageRating.winding = "Sec"
                } else if (transformerEndInfo.end_number == 3) {
                    dataVoltageRating.winding = "Tert"
                }
            }
        }
        dataVoltageRating.voltage_ll.mrid = voltageRating.rated_u || ''
        for (const voltage of entity.voltage) {
            if (voltage.mrid == voltageRating.rated_u) {
                dataVoltageRating.voltage_ll.value = voltage.value || ''
            }
        }
        dataVoltageRating.voltage_ln.mrid = voltageRating.rated_ln || ''
        for (const voltage of entity.voltage) {
            if (voltage.mrid == voltageRating.rated_ln) {
                dataVoltageRating.voltage_ln.value = voltage.value || ''
            }
        }
        dataVoltageRating.insul_level_ll.mrid = voltageRating.insulation_u || ''
        for (const voltage of entity.voltage) {
            if (voltage.mrid == voltageRating.insulation_u) {
                dataVoltageRating.insul_level_ll.value = voltage.value || ''
            }
        }
        dataVoltageRating.voltage_regulation = voltageRating.regulation || ''
        dataVoltageRating.insulation_class = voltageRating.insulation_c || ''
        dto.ratings.voltage_ratings.push(dataVoltageRating);
    }

    for (const powerRating of entity.coolingPowerRating) {
        const dataPowerRating = {
            mrid: '',
            rated_power: {
                mrid: '',
                value: '',
                unit: 'M|VA'
            },
            cooling_class: '',
            temp_rise_wind: {
                mrid: '',
                value: '',
                unit: '°C'
            }
        }
        dataPowerRating.mrid = powerRating.mrid || ''
        dataPowerRating.rated_power.mrid = powerRating.power_rating || ''
        for (const apparentPower of entity.apparentPower) {
            if (apparentPower.mrid == powerRating.power_rating) {
                dataPowerRating.rated_power.value = apparentPower.value || ''
            }
        }
        dataPowerRating.cooling_class = powerRating.cooling_kind || ''
        dataPowerRating.temp_rise_wind.mrid = powerRating.temp_rise_wind || ''
        for (const temperature of entity.temperature) {
            if (temperature.mrid == powerRating.temp_rise_wind) {
                dataPowerRating.temp_rise_wind.value = temperature.value || ''
            }
        }
        dto.ratings.power_ratings.push(dataPowerRating);
    }

    for (const powerRating of dto.ratings.power_ratings) {
        const dataCurrentRating = {
            mrid: '',
            prim: {
                mrid: '',
                data: {
                    mrid: '',
                    value: '',
                    unit: 'A'
                },
            },
            sec: {
                mrid: '',
                data: {
                    mrid: '',
                    value: '',
                    unit: 'A'
                },
            },
            tert: {
                mrid: '',
                data: {
                    mrid: '',
                    value: '',
                    unit: 'A'
                },
            }
        }
        for (const currentRating of entity.currentRating) {
            if (currentRating.rated_power == powerRating.rated_power.mrid) {
                for (const transformerEndInfo of entity.oldTransformerEndInfo) {
                    if (transformerEndInfo.mrid == currentRating.transformer_end_id) {
                        if (transformerEndInfo.end_number == 1) {
                            dataCurrentRating.prim.mrid = currentRating.mrid || ''
                            dataCurrentRating.prim.data.mrid = currentRating.value || ''
                            for (const currentFlow of entity.currentFlow) {
                                if (currentFlow.mrid == currentRating.value) {
                                    dataCurrentRating.prim.data.value = currentFlow.value || ''
                                }
                            }
                        } else if (transformerEndInfo.end_number == 2) {
                            dataCurrentRating.sec.mrid = currentRating.mrid || ''
                            dataCurrentRating.sec.data.mrid = currentRating.value || ''
                            for (const currentFlow of entity.currentFlow) {
                                if (currentFlow.mrid == currentRating.value) {
                                    dataCurrentRating.sec.data.value = currentFlow.value || ''
                                }
                            }
                        } else if (transformerEndInfo.end_number == 3) {
                            dataCurrentRating.tert.mrid = currentRating.mrid || ''
                            dataCurrentRating.tert.data.mrid = currentRating.value || ''
                            for (const currentFlow of entity.currentFlow) {
                                if (currentFlow.mrid == currentRating.value) {
                                    dataCurrentRating.tert.data.value = currentFlow.value || ''
                                }
                            }
                        }
                    }
                }
            }
        }
        dto.ratings.current_ratings.push(dataCurrentRating);
    }

    dto.ratings.short_circuit.mrid = entity.shortCircuitRating.mrid || ''
    dto.ratings.short_circuit.ka.mrid = entity.shortCircuitRating.short_circuit_current || ''
    for (const currentFlow of entity.currentFlow) {
        if (currentFlow.mrid == entity.shortCircuitRating.short_circuit_current) {
            dto.ratings.short_circuit.ka.value = currentFlow.value || ''
        }
    }
    dto.ratings.short_circuit.s.mrid = entity.shortCircuitRating.duration_seconds || ''
    for (const second of entity.seconds) {
        if (second.mrid == entity.shortCircuitRating.duration_seconds) {
            dto.ratings.short_circuit.s.value = second.value || ''
        }
    }

    dto.impedances.ref_temp.mrid = entity.oldPowerTransformerInfo.impedance_temperature || ''
    for (const temperature of entity.temperature) {
        if (temperature.mrid == entity.oldPowerTransformerInfo.impedance_temperature) {
            dto.impedances.ref_temp.value = temperature.value || ''
        }
    }

    dto.shortCircuitTestTransformerEndInfo = entity.shortCircuitTestTransformerEndInfo || []

    for (const shortCircuitTest of entity.shortCircuitTest) {
        const dataCircuitTest = {
            mrid: '',
            short_circuit_impedances_uk: {
                mrid: '',
                value: '',
                unit: UnitSymbol.percent
            },
            base_power: {
                mrid: '',
                data: {
                    mrid: '',
                    value: '',
                    unit: UnitMultiplier.k + '|' + UnitSymbol.VA
                },
            },
            base_voltage: {
                mrid: '',
                data: {
                    mrid: '',
                    value: '',
                    unit: UnitMultiplier.k + '|' + UnitSymbol.V
                }
            },
            load_losses_pk: {
                mrid: '',
                value: '',
                unit: UnitSymbol.W
            },
            oltc_position: '',
            detc_position: ''
        }
        dataCircuitTest.mrid = shortCircuitTest.mrid || ''
        dataCircuitTest.short_circuit_impedances_uk.mrid = shortCircuitTest.voltage || ''
        for (const percent of entity.percent) {
            if (percent.mrid == shortCircuitTest.voltage) {
                dataCircuitTest.short_circuit_impedances_uk.value = percent.value || ''
            }
        }

        dataCircuitTest.base_power.mrid = shortCircuitTest.base_power || ''
        for (const basePower of entity.basePower) {
            if (basePower.mrid == shortCircuitTest.base_power) {
                dataCircuitTest.base_power.data.mrid = basePower.base_power || ''
                for (const apparentPower of entity.apparentPower) {
                    if (apparentPower.mrid == basePower.base_power) {
                        dataCircuitTest.base_power.data.value = apparentPower.value || ''
                    }
                }
            }
        }
        dataCircuitTest.base_voltage.mrid = shortCircuitTest.base_voltage || ''
        for (const baseVoltage of entity.baseVoltage) {
            if (baseVoltage.mrid == shortCircuitTest.base_voltage) {
                dataCircuitTest.base_voltage.data.mrid = baseVoltage.nominal_voltage || ''
                for (const voltage of entity.voltage) {
                    if (voltage.mrid == baseVoltage.nominal_voltage) {
                        dataCircuitTest.base_voltage.data.value = voltage.value || ''
                    }
                }
            }
        }

        dataCircuitTest.load_losses_pk.mrid = shortCircuitTest.loss || ''
        for (const activePower of entity.activePower) {
            if (activePower.mrid == shortCircuitTest.loss) {
                dataCircuitTest.load_losses_pk.value = activePower.value || ''
            }
        }

        for (const transformerEndInfo of entity.oldTransformerEndInfo) {
            if (transformerEndInfo.mrid == shortCircuitTest.energised_end) {
                if (transformerEndInfo.end_number == 1) {
                    const found = entity.shortCircuitTestTransformerEndInfo.find(
                        x => x.short_circuit_test_id === shortCircuitTest.mrid
                    );
                    for (const transformerEndInfo2 of entity.oldTransformerEndInfo) {
                        if (transformerEndInfo2.mrid == found.transformer_end_info_id) {
                            if (transformerEndInfo2.end_number == 2) {
                                dto.impedances.prim_sec.push(dataCircuitTest);
                            } else if (transformerEndInfo2.end_number == 3) {
                                dto.impedances.prim_tert.push(dataCircuitTest);
                            }
                        }
                    }
                } else if (transformerEndInfo.end_number == 2) {
                    const found = entity.shortCircuitTestTransformerEndInfo.find(
                        x => x.short_circuit_test_id === shortCircuitTest.mrid
                    );
                    for (const transformerEndInfo2 of entity.oldTransformerEndInfo) {
                        if (transformerEndInfo2.mrid == found.transformer_end_info_id) {
                            if (transformerEndInfo2.end_number == 3) {
                                dto.impedances.sec_tert.push(dataCircuitTest);
                            }
                        }
                    }
                }
            }
        }
    }

    dto.impedances.zero_sequence_impedance.mrid = entity.zeroSequenceImpedance.mrid || ''
    dto.impedances.zero_sequence_impedance.base_power.mrid = entity.zeroSequenceImpedance.base_power
    for (const basePower of entity.basePower) {
        if (basePower.mrid == entity.zeroSequenceImpedance.base_power) {
            dto.impedances.zero_sequence_impedance.base_power.data.mrid = basePower.base_power || ''
            for (const apparentPower of entity.apparentPower) {
                if (apparentPower.mrid == basePower.base_power) {
                    dto.impedances.zero_sequence_impedance.base_power.data.value = apparentPower.value || ''
                }
            }
        }
    }
    dto.impedances.zero_sequence_impedance.base_voltage.mrid = entity.zeroSequenceImpedance.base_voltage
    for (const baseVoltage of entity.baseVoltage) {
        if (baseVoltage.mrid == entity.zeroSequenceImpedance.base_voltage) {
            dto.impedances.zero_sequence_impedance.base_voltage.data.mrid = baseVoltage.nominal_voltage || ''
            for (const voltage of entity.voltage) {
                if (voltage.mrid == baseVoltage.nominal_voltage) {
                    dto.impedances.zero_sequence_impedance.base_voltage.data.value = voltage.value || ''
                }
            }
        }
    }

    for (const zeroSequenceImpedanceTable of entity.zeroSequenceImpedanceTable) {
        if (zeroSequenceImpedanceTable.transformer_end_id == '' || zeroSequenceImpedanceTable.transformer_end_id == null) {
            dto.impedances.zero_sequence_impedance.zero_percent.zero.mrid = zeroSequenceImpedanceTable.mrid || ''
            dto.impedances.zero_sequence_impedance.zero_percent.zero.data.mrid = zeroSequenceImpedanceTable.zero || ''
            for (const percent of entity.percent) {
                if (percent.mrid == zeroSequenceImpedanceTable.zero) {
                    dto.impedances.zero_sequence_impedance.zero_percent.zero.data.value = percent.value || ''
                }
            }
        } else {
            for (const transformerEndInfo of entity.oldTransformerEndInfo) {
                if (transformerEndInfo.mrid == zeroSequenceImpedanceTable.transformer_end_id) {
                    if (transformerEndInfo.end_number == 1) {
                        dto.impedances.zero_sequence_impedance.zero_percent.prim.mrid = zeroSequenceImpedanceTable.mrid
                        dto.impedances.zero_sequence_impedance.zero_percent.prim.data.mrid = zeroSequenceImpedanceTable.zero || ''
                        for (const percent of entity.percent) {
                            if (percent.mrid == zeroSequenceImpedanceTable.zero) {
                                dto.impedances.zero_sequence_impedance.zero_percent.prim.data.value = percent.value || ''
                            }
                        }
                    }
                } else if (transformerEndInfo.mrid == zeroSequenceImpedanceTable.transformer_end_id) {
                    if (transformerEndInfo.end_number == 2) {
                        dto.impedances.zero_sequence_impedance.zero_percent.sec.mrid = zeroSequenceImpedanceTable.mrid
                        dto.impedances.zero_sequence_impedance.zero_percent.sec.data.mrid = zeroSequenceImpedanceTable.zero || ''
                        for (const percent of entity.percent) {
                            if (percent.mrid == zeroSequenceImpedanceTable.zero) {
                                dto.impedances.zero_sequence_impedance.zero_percent.sec_tert.data.value = percent.value || ''
                            }
                        }
                    }
                }
            }
        }
    }

    dto.others.category = entity.other.category || ''
    dto.others.tank_type = entity.other.tank_type || ''
    dto.others.status = entity.asset.in_use_state || ''
    dto.others.insulation_medium = entity.other.insulation_medium
    dto.others.insulation.key = entity.other.insulation_key
    dto.others.insulation.volume.mrid = entity.other.insulation_volume
    for (const volume of entity.volume) {
        if (volume.mrid == entity.other.insulation_medium) {
            dto.others.insulation.volume.value = volume.value || ''
        }
    }

    dto.others.insulation.weight.mrid = entity.other.insulation_weight
    for (const mass of entity.mass) {
        if (mass.mrid == entity.other.insulation_weight) {
            dto.others.insulation.weight.value = mass.value || ''
        }
    }

    dto.others.total_weight.mrid = entity.productAssetModel.weight_total
    for (const mass of entity.mass) {
        if (mass.mrid == entity.productAssetModel.weight_total) {
            dto.others.total_weight.value = mass.value || ''
        }
    }

    for (const oldTransformerEndInfoData of entity.oldTransformerEndInfo) {
        if (oldTransformerEndInfoData.end_number == 1) {
            dto.others.winding.prim = oldTransformerEndInfoData.material
        } else if (oldTransformerEndInfoData.end_number == 2) {
            dto.others.winding.sec = oldTransformerEndInfoData.material
        } else if (oldTransformerEndInfoData.end_number == 3) {
            dto.others.winding.tert = oldTransformerEndInfoData.material
        }
    }

    dto.tap_changers.assetId = entity.tapChanger.asset.mrid || ''
    dto.tap_changers.serial_no = entity.tapChanger.asset.serial_number || ''
    dto.tap_changers.productAssetModelId = entity.tapChanger.oldTapChangerInfo.product_asset_model || ''
    dto.tap_changers.manufacturer = entity.tapChanger.productAssetModel.manufacturer || ''
    dto.tap_changers.assetId = entity.tapChanger.oldTapChangerInfo.mrid || ''
    dto.tap_changers.manufacturer_type = entity.tapChanger.oldTapChangerInfo.manufacturer_type || ''
    for (const transformer_end_info of entity.oldTransformerEndInfo) {
        if (transformer_end_info.mrid == entity.tapChanger.oldTapChangerInfo.transformer_end_info) {
            if (transformer_end_info.end_number == 1) {
                dto.tap_changers.winding = 'Prim'
            } else if (transformer_end_info.end_number == 2) {
                dto.tap_changers.winding = 'Sec'
            } else if (transformer_end_info.end_number == 3) {
                dto.tap_changers.winding = 'Tert'
            }
            break
        }
    }
    dto.tap_changers.tap_scheme = entity.tapChanger.oldTapChangerInfo.tap_scheme || ''
    dto.tap_changers.no_of_taps = entity.tapChanger.oldTapChangerInfo.number_of_tap || ''
    dto.tap_changers.mrid = entity.tapChanger.assetPsr.asset_id || ''
    dto.tap_changers.assetPsr.psr_id = entity.tapChanger.assetPsr.psr_id || ''
    dto.tap_changers.assetPsr.mrid = entity.tapChanger.assetPsr.mrid || ''
    dto.tap_changers.ratioTapchangerTableId = entity.tapChanger.ratioTapChanger.ratio_tap_changer_table || ''
    if (entity.tapChanger.ratioTapChanger.control_enabled == true && entity.tapChanger.ratioTapChanger.ltc_flag == true) {
        dto.tap_changers.mode = 'oltc'
    } else {
        dto.tap_changers.mode = 'detc'
    }
    for (const t of entity.tapChanger.ratioTapChangerTablePoint) {
        const point = {
            id: '',
            tap: '',
            voltage: ''
        }
        point.id = t.mrid
        point.tap = t.step
        point.voltage = t.ratio
        dto.tap_changers.voltage_table.push(point)
    }

    for (const transformer_end_info of entity.oldTransformerEndInfo) {
        for (const bushing of entity.bushing) {
            if (bushing.oldBushingInfo.transformer_end_info == transformer_end_info.mrid) {
                const bushingTemplate = {
                    mrid: '',
                    assetInfoId: '',
                    productAssetModelId: '',
                    lifecycleDateId: '',
                    pos: '',
                    asset_type: '',
                    serial_no: '',
                    manufacturer: '',
                    manufacturer_type: '',
                    manufacturer_year: '',
                    insulation_level: {
                        mrid: '',
                        value: '',
                        label: 'kV',
                        unit: 'k|V'
                    },
                    voltage_l_ground: {
                        mrid: '',
                        value: '',
                        label: 'kV',
                        unit: 'k|V'
                    },
                    max_system_voltage: {
                        mrid: '',
                        value: '',
                        label: 'kV',
                        unit: 'k|V'
                    },
                    rate_current: {
                        mrid: '',
                        value: '',
                        label: 'A',
                        unit: 'A'
                    },
                    df_c1: {
                        mrid: '',
                        value: '',
                        label: '%',
                        unit: '%'
                    },
                    cap_c1: {
                        mrid: '',
                        value: '',
                        label: 'pF',
                        unit: 'p|F'
                    },
                    df_c2: {
                        mrid: '',
                        value: '',
                        label: '%',
                        unit: '%'
                    },
                    cap_c2: {
                        mrid: '',
                        value: '',
                        label: 'pF',
                        unit: 'p|F'
                    },
                    insulation_type: ''
                }
                bushingTemplate.mrid = bushing.bushing.mrid || ''
                bushingTemplate.assetInfoId = bushing.oldBushingInfo.mrid || ''
                bushingTemplate.productAssetModelId = bushing.productAssetModel.mrid || ''
                bushingTemplate.lifecycleDateId = bushing.bushing.lifecycle_date || ''
                bushingTemplate.pos = bushing.oldBushingInfo.phase || ''
                bushingTemplate.asset_type = bushing.bushing.type || ''
                bushingTemplate.serial_no = bushing.bushing.serial_number || ''
                bushingTemplate.manufacturer = bushing.productAssetModel.manufacturer || ''
                bushingTemplate.manufacturer_type = bushing.oldBushingInfo.manufacturer_type || ''
                bushingTemplate.manufacturer_year = bushing.lifecycleDate.manufactured_date || ''

                bushingTemplate.insulation_level.mrid = bushing.oldBushingInfo.rated_impulse_withstand_voltage || ''
                for (const voltage of bushing.voltage) {
                    if (voltage.mrid == bushingTemplate.insulation_level.mrid) {
                        bushingTemplate.insulation_level.value = voltage.value
                    }
                }

                bushingTemplate.voltage_l_ground.mrid = bushing.oldBushingInfo.rated_line_to_ground_voltage || ''
                for (const voltage of bushing.voltage) {
                    if (voltage.mrid == bushingTemplate.voltage_l_ground.mrid) {
                        bushingTemplate.voltage_l_ground.value = voltage.value
                    }
                }

                bushingTemplate.max_system_voltage.mrid = bushing.oldBushingInfo.high_voltage_limit || ''
                for (const voltage of bushing.voltage) {
                    if (voltage.mrid == bushingTemplate.max_system_voltage.mrid) {
                        bushingTemplate.max_system_voltage.value = voltage.value
                    }
                }

                bushingTemplate.rate_current.mrid = bushing.oldBushingInfo.rated_current || ''
                for (const currentFlow of bushing.currentFlow) {
                    if (currentFlow.mrid == bushingTemplate.rate_current.mrid) {
                        bushingTemplate.rate_current.value = currentFlow.value
                    }
                }

                bushingTemplate.df_c1.mrid = bushing.oldBushingInfo.c_power_factor || ''
                for (const percent of bushing.percent) {
                    if (percent.mrid == bushingTemplate.df_c1.mrid) {
                        bushingTemplate.df_c1.value = percent.value
                    }
                }

                bushingTemplate.df_c1.mrid = bushing.oldBushingInfo.c_power_factor || ''
                for (const percent of bushing.percent) {
                    if (percent.mrid == bushingTemplate.df_c1.mrid) {
                        bushingTemplate.df_c1.value = percent.value
                    }
                }

                bushingTemplate.df_c2.mrid = bushing.oldBushingInfo.c2_power_factor || ''
                for (const percent of bushing.percent) {
                    if (percent.mrid == bushingTemplate.df_c2.mrid) {
                        bushingTemplate.df_c2.value = percent.value
                    }
                }

                bushingTemplate.cap_c1.mrid = bushing.oldBushingInfo.c_capacitance || ''
                for (const capacitance of bushing.capacitance) {
                    if (capacitance.mrid == bushingTemplate.cap_c1.mrid) {
                        bushingTemplate.cap_c1.value = capacitance.value
                    }
                }

                bushingTemplate.cap_c2.mrid = bushing.oldBushingInfo.c2_capacitance || ''
                for (const capacitance of bushing.capacitance) {
                    if (capacitance.mrid == bushingTemplate.cap_c2.mrid) {
                        bushingTemplate.cap_c2.value = capacitance.value
                    }
                }

                bushingTemplate.insulation_type = bushing.oldBushingInfo.insulation_kind || ''
                if (transformer_end_info.end_number == 1) {
                    dto.bushing_data.prim.push(bushingTemplate)
                } else if (transformer_end_info.end_number == 2) {
                    dto.bushing_data.sec.push(bushingTemplate)
                } else if (transformer_end_info.end_number == 3) {
                    dto.bushing_data.tert.push(bushingTemplate)
                }
            }
        }
    }
    return dto;
}

const mappingUnit = (map, unitDto) => {
    if (!map || !unitDto) return;
    map.mrid = unitDto.mrid || null;
    map.value = unitDto.value || null;
    const unitParts = (unitDto.unit || '').split('|'); // ví dụ "k|V"
    map.multiplier = unitParts.length > 1 ? unitParts[0] : null;
    map.unit = unitParts.length > 1 ? unitParts[1] : unitParts[0] || null;
};