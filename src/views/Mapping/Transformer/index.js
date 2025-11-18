/* eslint-disable */
import TransformerDto from "@/views/Dto/Transformer"
import TransformerEntity from "@/views/Entity/Transformer"
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
import ShortCircuitTestTransformerEndInfo from "@/views/Entity/ShortCircuitTestTransformerEndInfo"
import BasePower from "@/views/Cim/BasePower"
import BaseVoltage from "@/views/Cim/BaseVoltage"
import Percent from "@/views/Cim/Percent"
import ActivePower from "@/views/Cim/ActivePower"
import ZeroSequenceImpedanceTable from "@/views/Entity/ZeroSequenceImpedanceTable"
import Volume from "@/views/Cim/Volume"
import Mass from "@/views/Cim/Mass"

export const transformerDtoToEntity = (dto) => {
    console.log(dto);
    // const dto = new TransformerDto();
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
    
    //lifecycleDate
    entity.lifecycleDate.manufactured_date = dto.properties.manufacturer_year || null;
    entity.lifecycleDate.mrid = dto.lifecycleDateId || null;
    entity.asset.lifecycle_date = dto.lifecycleDateId || null;

    //assetPsr
    entity.assetPsr.mrid = dto.assetPsrId || null;
    entity.assetPsr.asset_id = dto.properties.mrid || null;
    entity.assetPsr.psr_id = dto.psrId || null;

    /** ---------- attachment ---------- */
    entity.attachment.mrid = dto.attachmentId || null;
    entity.attachment = dto.attachment || null;

    entity.asset.country_of_origin = dto.properties.country_of_origin || null;
    entity.oldPowerTransformerInfo.mrid = dto.oldPowerTransformerInfoId || null;

    entity.oldPowerTransformerInfo.name = dto.properties.apparatus_id || null;
    entity.oldPowerTransformerInfo.phases = dto.winding_configuration.phases || null;
    if(dto.winding_configuration.unsupported_vector_group) {
        entity.oldPowerTransformerInfo.vector_group = dto.winding_configuration.unsupported_vector_group || null
    }
    if(dto.winding_configuration.vector_group_custom) {
        entity.oldPowerTransformerInfo.vector_group = dto.winding_configuration.vector_group_custom || null
    }
    if(dto.winding_configuration.vector_group_data) {
        entity.oldPowerTransformerInfo.vector_group = ''
        if(dto.winding_configuration.vector_group.prim.includes('Spare I')) {
            entity.oldPowerTransformerInfo.vector_group += 'I'
        } else {
            entity.oldPowerTransformerInfo.vector_group += dto.winding_configuration.vector_group.prim
        }
        entity.oldPowerTransformerInfo.vector_group += dto.winding_configuration.vector_group.sec.i
        entity.oldPowerTransformerInfo.vector_group += dto.winding_configuration.vector_group.sec.value
        entity.oldPowerTransformerInfo.vector_group += dto.winding_configuration.vector_group.tert.i
        entity.oldPowerTransformerInfo.vector_group += dto.winding_configuration.vector_group.tert.value

    }

    //oldTransformerEndInfo
    for (let item of dto.oldTransformerEndInfo) {
        if(item.end_number === 1) {
            item.power_transformer_info_id = entity.oldPowerTransformerInfo.mrid || null;
            if(dto.winding_configuration.vector_group.prim.includes('Spare I')) {
                item.connection_kind = 'I';
                item.spare = true ;
            } else {
                if(["IA", "IB", "IC", "IBC", "IAB", "IAC"].includes(dto.winding_configuration.vector_group.prim)) {
                    item.connection_kind = 'I';
                    item.phase = dto.winding_configuration.vector_group.prim.substring(1)
                } else {
                    item.connection_kind = dto.winding_configuration.vector_group.prim || null;
                }
            }
            item.material = dto.others.winding.prim || null;
            entity.oldTransformerEndInfo.push(item);
        } else if(item.end_number === 2) {
            item.power_transformer_info_id = entity.oldPowerTransformerInfo.mrid || null;
            if(dto.winding_configuration.vector_group.sec.i.includes('Spare I')) {
                item.connection_kind = 'I';
                item.spare = true ;
            } else {
                item.connection_kind = dto.winding_configuration.vector_group.sec.i || null;
            }
            item.material = dto.others.winding.sec || null;
            item.phase_angle_clock = dto.winding_configuration.vector_group.sec.value || null;
            entity.oldTransformerEndInfo.push(item);
        } else if(item.end_number === 3) {
            item.power_transformer_info_id = entity.oldPowerTransformerInfo.mrid || null;
            if(dto.winding_configuration.vector_group.tert.i.includes('Spare I')) {
                item.connection_kind = 'I';
                item.spare = true ;
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
    if(dto.ratings.rated_frequency.value === 'Custom') {
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
        if(item.winding == 'Prim') {
            for(let i = 0; i< dto.oldTransformerEndInfo.length; i++) {
                if(dto.oldTransformerEndInfo[i].end_number === 1) {
                    voltageRating.transformer_end_id = dto.oldTransformerEndInfo[i].mrid || null;
                    break;
                }
            }
        } else if(item.winding == 'Sec') {
            for(let i = 0; i< dto.oldTransformerEndInfo.length; i++) {
                if(dto.oldTransformerEndInfo[i].end_number === 2) {
                    voltageRating.transformer_end_id = dto.oldTransformerEndInfo[i].mrid || null;
                    break;
                }
            }
        } else if(item.winding == 'Tert') {
            for(let i = 0; i< dto.oldTransformerEndInfo.length; i++) {
                if(dto.oldTransformerEndInfo[i].end_number === 3) {
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
        powerRating.temp = item.temp_rise_wind.mrid || null
        let temperatureWind = new Temperature();
        mappingUnit(temperatureWind, item.temp_rise_wind)
        entity.temperature.push(temperatureWind);

        entity.coolingPowerRating.push(powerRating);
    }

    //Current ratings
    for (let [index, item] of dto.ratings.current_ratings.entries()) {

        if(item.prim.mrid && item.prim.mrid !== '') {
            const currentRatingPrim = new CurrentRating();
            currentRatingPrim.mrid = item.prim.mrid || null;
            for(let i = 0; i< dto.oldTransformerEndInfo.length; i++) {
                if(dto.oldTransformerEndInfo[i].end_number === 1) {
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

        if(item.sec.mrid && item.sec.mrid !== '') {
            const currentRatingSec = new CurrentRating();
            currentRatingSec.mrid = item.sec.mrid || null;
            for(let i = 0; i< dto.oldTransformerEndInfo.length; i++) {
                if(dto.oldTransformerEndInfo[i].end_number === 2) {
                    currentRatingSec.transformer_end_id = dto.oldTransformerEndInfo[i].mrid || null;
                    break;
                }
            }
            currentRatingSec.rated_current = dto.ratings.power_ratings[index].rated_power.mrid || null;
            currentRatingSec.value = item.sec.data.mrid
            let currentFlow = new CurrentFlow();
            mappingUnit(currentFlow, item.sec.data)
            entity.currentFlow.push(currentFlow);
            entity.currentRating.push(currentRatingSec);
        }

        if(item.tert.mrid && item.tert.mrid !== '') {
            const currentRatingTert = new CurrentRating();
            currentRatingTert.mrid = item.tert.mrid || null;
            for(let i = 0; i< dto.oldTransformerEndInfo.length; i++) {
                if(dto.oldTransformerEndInfo[i].end_number === 3) {
                    currentRatingTert.transformer_end_id = dto.oldTransformerEndInfo[i].mrid || null;
                    break;
                }
            }
            currentRatingTert.rated_current = dto.ratings.power_ratings[index].rated_power.mrid || null;
            currentRatingTert.value = item.tert.data.mrid
            let currentFlow = new CurrentFlow();
            mappingUnit(currentFlow, item.tert.data)
            entity.currentFlow.push(currentFlow);
            entity.currentRating.push(currentRatingTert)
        }
    }

    //Short-circuit ratings
    if(dto.ratings.short_circuit.mrid && dto.ratings.short_circuit.mrid !== '') {
        entity.shortCircuitRating.mrid = dto.ratings.short_circuit.mrid || null;
        entity.shortCircuitRating.power_transformer_info_id = entity.oldPowerTransformerInfo.mrid || null;
        if(dto.ratings.short_circuit.ka.mrid && dto.ratings.short_circuit.ka.mrid !== '') {
            entity.shortCircuitRating.short_circuit_current = dto.ratings.short_circuit.ka.mrid || null;
            const currentFlow = new CurrentFlow();
            mappingUnit(currentFlow, dto.ratings.short_circuit.ka)
            entity.currentFlow.push(currentFlow);
        }
        if(dto.ratings.short_circuit.s.mrid && dto.ratings.short_circuit.s.mrid !== '') {
            entity.shortCircuitRating.duration_seconds = dto.ratings.short_circuit.s.mrid || null;
            const second = new Seconds();
            mappingUnit(second, dto.ratings.short_circuit.s)
            entity.seconds.push(second);
        }
    }

    //rated temperature
    if(dto.impedances.ref_temp.value) {
        entity.oldPowerTransformerInfo.impedance_temperature = dto.impedances.ref_temp.mrid || null;
        const temperature = new Temperature();
        mappingUnit(temperature, dto.impedances.ref_temp)
        entity.temperature.push(temperature);
    }

    let transformer_end_info_prim_id = null;
    for(let i = 0; i< dto.oldTransformerEndInfo.length; i++) {
        if(dto.oldTransformerEndInfo[i].end_number == 1) {
            transformer_end_info_prim_id = dto.oldTransformerEndInfo[i].mrid || null;
            break;
        }
    }
    let transformer_end_info_second_id = null;
    for(let i = 0; i< dto.oldTransformerEndInfo.length; i++) {
        if(dto.oldTransformerEndInfo[i].end_number == 2) {
            transformer_end_info_second_id = dto.oldTransformerEndInfo[i].mrid || null;
            break;
        }
    }
    let transformer_end_info_third_id = null;
    for(let i = 0; i< dto.oldTransformerEndInfo.length; i++) {
        if(dto.oldTransformerEndInfo[i].end_number == 3) {
            transformer_end_info_third_id = dto.oldTransformerEndInfo[i].mrid || null;
            break;
        }
    }
    
    //short-circuit test
    if(dto.impedances.prim_sec && dto.impedances.prim_sec.length > 0) {
        for(let item of dto.impedances.prim_sec) {
            const shortCircuitTest = new ShortCircuitTest();
            shortCircuitTest.mrid = item.mrid || null;
            shortCircuitTest.energised_end = transformer_end_info_prim_id || null;

            for(let j=0; j<dto.shortCircuitTestTransformerEndInfo.length; j++) {
                if(dto.shortCircuitTestTransformerEndInfo[j].short_circuit_test_id === item.mrid) {
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
    
    if(dto.impedances.sec_tert && dto.impedances.sec_tert.length > 0) {
        for(let item of dto.impedances.sec_tert) {
            const shortCircuitTest = new ShortCircuitTest();
            shortCircuitTest.mrid = item.mrid || null;
            shortCircuitTest.energised_end = transformer_end_info_second_id || null;

            for(let j=0; j<dto.shortCircuitTestTransformerEndInfo.length; j++) {
                if(dto.shortCircuitTestTransformerEndInfo[j].short_circuit_test_id === item.mrid) {
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

    if(dto.impedances.prim_tert && dto.impedances.prim_tert.length > 0) {
        for(let item of dto.impedances.prim_tert) {
            const shortCircuitTest = new ShortCircuitTest();
            shortCircuitTest.mrid = item.mrid || null;
            shortCircuitTest.energised_end = transformer_end_info_prim_id || null;

            for(let j=0; j<dto.shortCircuitTestTransformerEndInfo.length; j++) {
                if(dto.shortCircuitTestTransformerEndInfo[j].short_circuit_test_id === item.mrid) {
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

    for(let key in dto.impedances.zero_sequence_impedance.zero_percent) {
        const zeroSequenceImpedanceTable = new ZeroSequenceImpedanceTable();
        zeroSequenceImpedanceTable.mrid = dto.impedances.zero_sequence_impedance.zero_percent[key].mrid || null;
        zeroSequenceImpedanceTable.zero_sequence_impedance = dto.impedances.zero_sequence_impedance.mrid || null;
        zeroSequenceImpedanceTable.zero = dto.impedances.zero_sequence_impedance.zero_percent[key].data.mrid || null;
        if(key == 'prim') {
            for(let i = 0; i< dto.oldTransformerEndInfo.length; i++) {
                if(dto.oldTransformerEndInfo[i].end_number === 1) {
                    zeroSequenceImpedanceTable.transformer_end_id = dto.oldTransformerEndInfo[i].mrid || null;
                    break;
                }
            }
        }
        else if(key == 'sec') {
            for(let i = 0; i< dto.oldTransformerEndInfo.length; i++) {
                if(dto.oldTransformerEndInfo[i].end_number === 2) {
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

    console.log(entity);
    return entity
    
}

export const transformerEntityToDto = (entity) => {
    // const entity = new TransformerEntity();
    const dto = new TransformerDto();
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