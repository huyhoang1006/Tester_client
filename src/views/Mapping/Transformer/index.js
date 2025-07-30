/* eslint-disable */
import TransformerDto from "@/views/Dto/Transformer"
import TransformerEntity from "@/views/Entity/Transformer"
import VoltageRating from "@/views/Entity/VoltageRating"
import PowerRating from "@/views/Entity/PowerRating"
import Voltage from "@/views/Cim/Voltage"
import ApparentPower from "@/views/Cim/ApparentPower"
import Frequency from "@/views/Cim/Frequency"
import CoolingPowerRating from "@/views/Cim/CoolingPowerRating"
import CurrentRating from "@/views/Entity/CurrentRating"
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
    
    //lifecycleDate
    entity.lifecycleDate.manufactured_date = dto.properties.manufacturer_year || null;
    entity.lifecycleDate.mrid = dto.lifecycleDateId || null;
    entity.asset.lifecycle_date = dto.lifecycleDateId || null;

    //assetPsr
    entity.assetPsr.mrid = dto.assetPsrId || null;
    entity.assetPsr.asset_id = dto.properties.mrid || null;
    entity.assetPsr.psr_id = dto.psrId || null;

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
            item.
            entity.oldTransformerEndInfo.push(item);
        }
    }

    //rated frequency
    if(dto.ratings.rated_frequency.value) {
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
            const frequency = new Frequency();
            frequency.mrid = dto.ratings.rated_frequency.mrid || null;
            entity.oldPowerTransformerInfo.rated_frequency = dto.ratings.rated_frequency.mrid || null;
            const unitParts = (dto.ratings.rated_frequency.unit || '').split('|');
            frequency.multiplier = unitParts.length > 1 ? unitParts[0] : null;
            frequency.unit = unitParts.length > 1 ? unitParts[1] : unitParts[0] || null;
            frequency.value = dto.ratings.rated_frequency.value || null;
            entity.frequency.push(frequency);
        }
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
        }
        if(item.winding == 'Sec') {
            for(let i = 0; i< dto.oldTransformerEndInfo.length; i++) {
                if(dto.oldTransformerEndInfo[i].end_number === 2) {
                    voltageRating.transformer_end_id = dto.oldTransformerEndInfo[i].mrid || null;
                    break;
                }
            }
        }
        if(item.winding == 'Tert') {
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
        let unitParts = (item.voltage_ll.unit || '').split('|');
        voltage.multiplier = unitParts.length > 1 ? unitParts[0] : null;
        voltage.unit = unitParts.length > 1 ? unitParts[1] : unitParts[0] || null;
        voltage.value = item.voltage_ll.value || null;
        voltage.mrid = item.voltage_ll.mrid || null
        entity.voltage.push(voltage);

        //voltage_ln
        voltageRating.rated_ln = item.voltage_ln.mrid || null
        voltage = new Voltage();
        unitParts = (item.voltage_ln.unit || '').split('|');
        voltage.multiplier = unitParts.length > 1 ? unitParts[0] : null;
        voltage.unit = unitParts.length > 1 ? unitParts[1] : unitParts[0] || null;
        voltage.value = item.voltage_ln.value || null;
        voltage.mrid = item.voltage_ln.mrid || null
        entity.voltage.push(voltage);

        //insulation bil
        voltageRating.insulation_u = item.insul_level_ll.mrid || null
        voltage = new Voltage();
        unitParts = (item.insul_level_ll.unit || '').split('|');
        voltage.multiplier = unitParts.length > 1 ? unitParts[0] : null;
        voltage.unit = unitParts.length > 1 ? unitParts[1] : unitParts[0] || null;
        voltage.value = item.insul_level_ll.value || null;
        voltage.mrid = item.insul_level_ll.mrid || null
        entity.voltage.push(voltage);

        //insulation class
        voltageRating.insulation_c = item.insulation_class || null
        voltageRating.regulation = item.voltage_regulation || null
        entity.voltageRating.push(voltageRating);
    }

    //Power ratings
    for (let item of dto.ratings.power_ratings) {
        const powerRating = new PowerRating();
        powerRating.mrid = item.mrid || null;
        powerRating.power_transformer_info_id = entity.oldPowerTransformerInfo.mrid || null;
        powerRating.rated_power = item.mrid

        //rated_power
        powerRating.rated_power = item.rated_power.mrid || null
        let apparentPower = new ApparentPower();
        let unitParts = (item.rated_power.unit || '').split('|');
        apparentPower.multiplier = unitParts.length > 1 ? unitParts[0] : null;
        apparentPower.unit = unitParts.length > 1 ? unitParts[1] : unitParts[0] || null;
        apparentPower.value = item.rated_power.value || null;
        apparentPower.mrid = item.rated_power.mrid || null
        entity.apparentPower.push(apparentPower);

        //cooling class
        powerRating.cooling_class = item.cooling_class.mrid || null;
        let coolingClass = new CoolingPowerRating();
        coolingClass.mrid = item.cooling_class.mrid || null;
        coolingClass.value = item.cooling_class.value || null;
        entity.coolingPowerRating.push(coolingClass);

        //temp_rise_wind
        powerRating.temp_rise_wind = item.temp_rise_wind || null

        entity.powerRating.push(powerRating);
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
            currentRatingPrim.rated_current = dto.ratings.power_ratings[index].rated_power.mrid || null;
            entity.currentRating.push(currentRatingPrim);
            let currentFlow = new CurrentFlow();
            let unitParts = (item.prim.data.unit || '').split('|');
            currentFlow.multiplier = unitParts.length > 1 ? unitParts[0] : null;
            currentFlow.unit = unitParts.length > 1 ? unitParts[1] : unitParts[0] || null;
            currentFlow.value = item.prim.data.value || null;
            currentFlow.mrid = item.prim.data.mrid || null;
            entity.currentFlow.push(currentFlow);
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
            entity.currentRating.push(currentRatingSec);
            let currentFlow = new CurrentFlow();
            let unitParts = (item.sec.data.unit || '').split('|');
            currentFlow.multiplier = unitParts.length > 1 ? unitParts[0] : null;
            currentFlow.unit = unitParts.length > 1 ? unitParts[1] : unitParts[0] || null;
            currentFlow.value = item.sec.data.value || null;
            currentFlow.mrid = item.sec.data.mrid || null;
            entity.currentFlow.push(currentFlow);
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
            entity.currentRating.push(currentRatingTert);
            let currentFlow = new CurrentFlow();
            let unitParts = (item.tert.data.unit || '').split('|');
            currentFlow.multiplier = unitParts.length > 1 ? unitParts[0] : null;
            currentFlow.unit = unitParts.length > 1 ? unitParts[1] : unitParts[0] || null;
            currentFlow.value = item.tert.data.value || null;
            currentFlow.mrid = item.tert.data.mrid || null;
            entity.currentFlow.push(currentFlow);
        }
    }

    //Short-circuit ratings
    if(dto.ratings.short_circuit.mrid && dto.ratings.short_circuit.mrid !== '') {
        entity.shortCircuitRating.mrid = dto.ratings.short_circuit.mrid || null;
        entity.shortCircuitRating.power_transformer_info_id = entity.oldPowerTransformerInfo.mrid || null;
        if(dto.ratings.short_circuit.ka.mrid && dto.ratings.short_circuit.ka.mrid !== '') {
            entity.shortCircuitRating.short_circuit_current = dto.ratings.short_circuit.ka.mrid || null;
            const currentFlow = new CurrentFlow();
            let unitParts = (dto.ratings.short_circuit.ka.unit || '').split('|');
            currentFlow.multiplier = unitParts.length > 1 ? unitParts[0] : null;
            currentFlow.unit = unitParts.length > 1 ? unitParts[1] : unitParts[0] || null;
            currentFlow.value = dto.ratings.short_circuit.ka.value || null;
            currentFlow.mrid = dto.ratings.short_circuit.ka.mrid || null;
            entity.currentFlow.push(currentFlow);
        }
        if(dto.ratings.short_circuit.s.mrid && dto.ratings.short_circuit.s.mrid !== '') {
            entity.shortCircuitRating.duration_seconds = dto.ratings.short_circuit.s.mrid || null;
            const second = new Seconds();
            let unitParts = (dto.ratings.short_circuit.s.unit || '').split('|');
            second.multiplier = unitParts.length > 1 ? unitParts[0] : null;
            second.unit = unitParts.length > 1 ? unitParts[1] : unitParts[0] || null;
            second.value = dto.ratings.short_circuit.s.value || null;
            second.mrid = dto.ratings.short_circuit.s.mrid || null;
            entity.seconds.push(second);
        }
    }

    //rated temperature
    if(dto.impedances.ref_temp.value) {
        entity.oldPowerTransformerInfo.impedance_temperature = dto.impedances.ref_temp.mrid || null;
        const temperature = new Temperature();
        temperature.mrid = dto.impedances.ref_temp.mrid || null;
        const unitParts = (dto.impedances.ref_temp.unit || '').split('|');
        temperature.multiplier = unitParts.length > 1 ? unitParts[0] : null;
        temperature.unit = unitParts.length > 1 ? unitParts[1] : unitParts[0] || null;
        temperature.value = dto.impedances.ref_temp.value || null;
        entity.temperature.push(temperature);
    }
    
    //short-circuit test
    if(dto.impedances.prim_sec && dto.impedances.prim_sec.length > 0) {
        for(let item of dto.impedances.prim_sec) {
            const shortCircuitTest = new ShortCircuitTest();
            shortCircuitTest.mrid = item.mrid || null;
            for(let i = 0; i< dto.oldTransformerEndInfo.length; i++) {
                if(dto.oldTransformerEndInfo[i].end_number === 1) {
                    shortCircuitTest.energised_end = dto.oldTransformerEndInfo[i].mrid || null;
                    break;
                }
            }
            for(let i = 0; i< dto.oldTransformerEndInfo.length; i++) {
                if(dto.oldTransformerEndInfo[i].end_number === 2) {
                    const shortCircuitTestTransformerEndInfo = new ShortCircuitTestTransformerEndInfo();
                    for(let j=0; j<dto.shortCircuitTestTransformerEndInfo.length; j++) {
                        if(dto.shortCircuitTestTransformerEndInfo[j].transformer_end_info_id === dto.oldTransformerEndInfo[i].mrid
                            && dto.shortCircuitTestTransformerEndInfo[j].short_circuit_test_id === item.mrid
                        ) {
                            shortCircuitTestTransformerEndInfo.mrid = dto.shortCircuitTestTransformerEndInfo[j].mrid || null;
                            shortCircuitTestTransformerEndInfo.transformer_end_info_id = dto.shortCircuitTestTransformerEndInfo[j].transformer_end_info_id || null;
                            shortCircuitTestTransformerEndInfo.short_circuit_test_id = dto.shortCircuitTestTransformerEndInfo[j].short_circuit_test_id || null;
                            entity.shortCircuitTestTransformerEndInfo.push(shortCircuitTestTransformerEndInfo);
                            break;
                        }
                    }
                    break;
                }
            }

            shortCircuitTest.base_power = item.base_power.mrid || null;
            const basePower = new BasePower();
            basePower.mrid = item.base_power.mrid || null;
            basePower.base_power = item.base_power.data.mrid || null;
            const apparentPower = new ApparentPower();
            let unitParts = (item.base_power.data.unit || '').split('|');
            apparentPower.multiplier = unitParts.length > 1 ? unitParts[0] : null;
            apparentPower.unit = unitParts.length > 1 ? unitParts[1] : unitParts[0] || null;
            apparentPower.value = item.base_power.data.value || null;
            apparentPower.mrid = item.base_power.data.mrid || null;
            entity.basePower.push(basePower);
            entity.apparentPower.push(apparentPower);

            shortCircuitTest.base_voltage = item.base_voltage.mrid || null;
            const baseVoltage = new BaseVoltage();
            baseVoltage.mrid = item.base_voltage.mrid || null;
            baseVoltage.nominal_voltage = item.base_voltage.data.mrid || null;
            const voltage = new Voltage();
            let unitPartsV = (item.base_voltage.data.unit || '').split('|');
            voltage.multiplier = unitPartsV.length > 1 ? unitPartsV[0] : null;
            voltage.unit = unitPartsV.length > 1 ? unitPartsV[1] : unitPartsV[0] || null;
            voltage.value = item.base_voltage.data.value || null;
            voltage.mrid = item.base_voltage.data.mrid || null;
            entity.baseVoltage.push(baseVoltage);
            entity.voltage.push(voltage);

            shortCircuitTest.voltage = item.short_circuit_impedances_uk.mrid || null;
            const percent = new Percent();
            let unitPartsUk = (item.short_circuit_impedances_uk.unit || '').split('|');
            percent.multiplier = unitPartsUk.length > 1 ? unitPartsUk[0] : null;
            percent.unit = unitPartsUk.length > 1 ? unitPartsUk[1] : unitPartsUk[0] || null;
            percent.value = item.short_circuit_impedances_uk.value || null;
            percent.mrid = item.short_circuit_impedances_uk.mrid || null;
            entity.percent.push(percent);

            shortCircuitTest.loss = item.load_losses_pk.mrid || null;
            const activePower = new ActivePower();
            let unitPartsLoss = (item.load_losses_pk.unit || '').split('|');
            activePower.multiplier = unitPartsLoss.length > 1 ? unitPartsLoss[0] : null;
            activePower.unit = unitPartsLoss.length > 1 ? unitPartsLoss[1] : unitPartsLoss[0] || null;
            activePower.value = item.load_losses_pk.value || null;
            activePower.mrid = item.load_losses_pk.mrid || null;
            entity.activePower.push(activePower);

            shortCircuitTest.temperature = dto.impedances.ref_temp.mrid || null;
            entity.shortCircuitTest.push(shortCircuitTest);
        }
    }
    
    if(dto.impedances.sec_tert && dto.impedances.sec_tert.length > 0) {
        for(let item of dto.impedances.sec_tert) {
            const shortCircuitTest = new ShortCircuitTest();
            shortCircuitTest.mrid = item.mrid || null;
            for(let i = 0; i< dto.oldTransformerEndInfo.length; i++) {
                if(dto.oldTransformerEndInfo[i].end_number === 2) {
                    shortCircuitTest.energised_end = dto.oldTransformerEndInfo[i].mrid || null;
                    break;
                }
            }
            for(let i = 0; i< dto.oldTransformerEndInfo.length; i++) {
                if(dto.oldTransformerEndInfo[i].end_number === 3) {
                    const shortCircuitTestTransformerEndInfo = new ShortCircuitTestTransformerEndInfo();
                    for(let j=0; j<dto.shortCircuitTestTransformerEndInfo.length; j++) {
                        if(dto.shortCircuitTestTransformerEndInfo[j].transformer_end_info_id === dto.oldTransformerEndInfo[i].mrid
                            && dto.shortCircuitTestTransformerEndInfo[j].short_circuit_test_id === item.mrid
                        ) {
                            shortCircuitTestTransformerEndInfo.mrid = dto.shortCircuitTestTransformerEndInfo[j].mrid || null;
                            shortCircuitTestTransformerEndInfo.transformer_end_info_id = dto.shortCircuitTestTransformerEndInfo[j].transformer_end_info_id || null;
                            shortCircuitTestTransformerEndInfo.short_circuit_test_id = dto.shortCircuitTestTransformerEndInfo[j].short_circuit_test_id || null;
                            entity.shortCircuitTestTransformerEndInfo.push(shortCircuitTestTransformerEndInfo);
                            break;
                        }
                    }
                    break;
                }
            }

            shortCircuitTest.base_power = item.base_power.mrid || null;
            const basePower = new BasePower();
            basePower.mrid = item.base_power.mrid || null;
            basePower.base_power = item.base_power.data.mrid || null;
            const apparentPower = new ApparentPower();
            let unitParts = (item.base_power.data.unit || '').split('|');
            apparentPower.multiplier = unitParts.length > 1 ? unitParts[0] : null;
            apparentPower.unit = unitParts.length > 1 ? unitParts[1] : unitParts[0] || null;
            apparentPower.value = item.base_power.data.value || null;
            apparentPower.mrid = item.base_power.data.mrid || null;
            entity.basePower.push(basePower);
            entity.apparentPower.push(apparentPower);

            shortCircuitTest.base_voltage = item.base_voltage.mrid || null;
            const baseVoltage = new BaseVoltage();
            baseVoltage.mrid = item.base_voltage.mrid || null;
            baseVoltage.nominal_voltage = item.base_voltage.data.mrid || null;
            const voltage = new Voltage();
            let unitPartsV = (item.base_voltage.data.unit || '').split('|');
            voltage.multiplier = unitPartsV.length > 1 ? unitPartsV[0] : null;
            voltage.unit = unitPartsV.length > 1 ? unitPartsV[1] : unitPartsV[0] || null;
            voltage.value = item.base_voltage.data.value || null;
            voltage.mrid = item.base_voltage.data.mrid || null;
            entity.baseVoltage.push(baseVoltage);
            entity.voltage.push(voltage);

            shortCircuitTest.voltage = item.short_circuit_impedances_uk.mrid || null;
            const percent = new Percent();
            let unitPartsUk = (item.short_circuit_impedances_uk.unit || '').split('|');
            percent.multiplier = unitPartsUk.length > 1 ? unitPartsUk[0] : null;
            percent.unit = unitPartsUk.length > 1 ? unitPartsUk[1] : unitPartsUk[0] || null;
            percent.value = item.short_circuit_impedances_uk.value || null;
            percent.mrid = item.short_circuit_impedances_uk.mrid || null;
            entity.percent.push(percent);

            shortCircuitTest.loss = item.load_losses_pk.mrid || null;
            const activePower = new ActivePower();
            let unitPartsLoss = (item.load_losses_pk.unit || '').split('|');
            activePower.multiplier = unitPartsLoss.length > 1 ? unitPartsLoss[0] : null;
            activePower.unit = unitPartsLoss.length > 1 ? unitPartsLoss[1] : unitPartsLoss[0] || null;
            activePower.value = item.load_losses_pk.value || null;
            activePower.mrid = item.load_losses_pk.mrid || null;
            entity.activePower.push(activePower);

            shortCircuitTest.temperature = dto.impedances.ref_temp.mrid || null;
            entity.shortCircuitTest.push(shortCircuitTest);
        }
    }

    if(dto.impedances.prim_tert && dto.impedances.prim_tert.length > 0) {
        for(let item of dto.impedances.prim_tert) {
            const shortCircuitTest = new ShortCircuitTest();
            shortCircuitTest.mrid = item.mrid || null;
            for(let i = 0; i< dto.oldTransformerEndInfo.length; i++) {
                if(dto.oldTransformerEndInfo[i].end_number === 1) {
                    shortCircuitTest.energised_end = dto.oldTransformerEndInfo[i].mrid || null;
                    break;
                }
            }
            for(let i = 0; i< dto.oldTransformerEndInfo.length; i++) {
                if(dto.oldTransformerEndInfo[i].end_number === 3) {
                    const shortCircuitTestTransformerEndInfo = new ShortCircuitTestTransformerEndInfo();
                    for(let j=0; j<dto.shortCircuitTestTransformerEndInfo.length; j++) {
                        if(dto.shortCircuitTestTransformerEndInfo[j].transformer_end_info_id === dto.oldTransformerEndInfo[i].mrid
                            && dto.shortCircuitTestTransformerEndInfo[j].short_circuit_test_id === item.mrid
                        ) {
                            shortCircuitTestTransformerEndInfo.mrid = dto.shortCircuitTestTransformerEndInfo[j].mrid || null;
                            shortCircuitTestTransformerEndInfo.transformer_end_info_id = dto.shortCircuitTestTransformerEndInfo[j].transformer_end_info_id || null;
                            shortCircuitTestTransformerEndInfo.short_circuit_test_id = dto.shortCircuitTestTransformerEndInfo[j].short_circuit_test_id || null;
                            entity.shortCircuitTestTransformerEndInfo.push(shortCircuitTestTransformerEndInfo);
                            break;
                        }
                    }
                    break;
                }
            }

            shortCircuitTest.base_power = item.base_power.mrid || null;
            const basePower = new BasePower();
            basePower.mrid = item.base_power.mrid || null;
            basePower.base_power = item.base_power.data.mrid || null;
            const apparentPower = new ApparentPower();
            let unitParts = (item.base_power.data.unit || '').split('|');
            apparentPower.multiplier = unitParts.length > 1 ? unitParts[0] : null;
            apparentPower.unit = unitParts.length > 1 ? unitParts[1] : unitParts[0] || null;
            apparentPower.value = item.base_power.data.value || null;
            apparentPower.mrid = item.base_power.data.mrid || null;
            entity.basePower.push(basePower);
            entity.apparentPower.push(apparentPower);

            shortCircuitTest.base_voltage = item.base_voltage.mrid || null;
            const baseVoltage = new BaseVoltage();
            baseVoltage.mrid = item.base_voltage.mrid || null;
            baseVoltage.nominal_voltage = item.base_voltage.data.mrid || null;
            const voltage = new Voltage();
            let unitPartsV = (item.base_voltage.data.unit || '').split('|');
            voltage.multiplier = unitPartsV.length > 1 ? unitPartsV[0] : null;
            voltage.unit = unitPartsV.length > 1 ? unitPartsV[1] : unitPartsV[0] || null;
            voltage.value = item.base_voltage.data.value || null;
            voltage.mrid = item.base_voltage.data.mrid || null;
            entity.baseVoltage.push(baseVoltage);
            entity.voltage.push(voltage);

            shortCircuitTest.voltage = item.short_circuit_impedances_uk.mrid || null;
            const percent = new Percent();
            let unitPartsUk = (item.short_circuit_impedances_uk.unit || '').split('|');
            percent.multiplier = unitPartsUk.length > 1 ? unitPartsUk[0] : null;
            percent.unit = unitPartsUk.length > 1 ? unitPartsUk[1] : unitPartsUk[0] || null;
            percent.value = item.short_circuit_impedances_uk.value || null;
            percent.mrid = item.short_circuit_impedances_uk.mrid || null;
            entity.percent.push(percent);

            shortCircuitTest.loss = item.load_losses_pk.mrid || null;
            const activePower = new ActivePower();
            let unitPartsLoss = (item.load_losses_pk.unit || '').split('|');
            activePower.multiplier = unitPartsLoss.length > 1 ? unitPartsLoss[0] : null;
            activePower.unit = unitPartsLoss.length > 1 ? unitPartsLoss[1] : unitPartsLoss[0] || null;
            activePower.value = item.load_losses_pk.value || null;
            activePower.mrid = item.load_losses_pk.mrid || null;
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
    let unitParts = (dto.impedances.zero_sequence_impedance.base_power.data.unit || '').split('|');
    apparentPower.multiplier = unitParts.length > 1 ? unitParts[0] : null;
    apparentPower.unit = unitParts.length > 1 ? unitParts[1] : unitParts[0] || null;
    apparentPower.value = dto.impedances.zero_sequence_impedance.base_power.data.value || null;
    apparentPower.mrid = dto.impedances.zero_sequence_impedance.base_power.data.mrid || null;
    entity.basePower.push(basePower);
    entity.apparentPower.push(apparentPower);

    const baseVoltage = new BaseVoltage();
    baseVoltage.mrid = dto.impedances.zero_sequence_impedance.base_voltage.mrid || null;
    baseVoltage.nominal_voltage = dto.impedances.zero_sequence_impedance.base_voltage.data.mrid || null;
    let unitPartsV = (dto.impedances.zero_sequence_impedance.base_voltage.data.unit || '').split('|');
    const voltage = new Voltage();
    voltage.multiplier = unitPartsV.length > 1 ? unitPartsV[0] : null;
    voltage.unit = unitPartsV.length > 1 ? unitPartsV[1] : unitPartsV[0] || null;
    voltage.value = dto.impedances.zero_sequence_impedance.base_voltage.data.value || null;
    voltage.mrid = dto.impedances.zero_sequence_impedance.base_voltage.data.mrid || null;
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
        let unitParts = (dto.impedances.zero_sequence_impedance.zero_percent[key].data.unit || '').split('|');
        percent.multiplier = unitParts.length > 1 ? unitParts[0] : null;
        percent.unit = unitParts.length > 1 ? unitParts[1] : unitParts[0] || null;
        percent.value = dto.impedances.zero_sequence_impedance.zero_percent[key].data.value || null;
        percent.mrid = dto.impedances.zero_sequence_impedance.zero_percent[key].data.mrid || null;
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
    let unitPartsInsulationV = (dto.others.insulation.volume.unit || '').split('|');
    volume.multiplier = unitPartsInsulationV.length > 1 ? unitPartsInsulationV[0] : null;
    volume.unit = unitPartsInsulationV.length > 1 ? unitPartsInsulationV[1] : unitPartsInsulationV[0] || null;
    volume.value = dto.others.insulation.volume.value || null;
    volume.mrid = dto.others.insulation.volume.mrid || null;
    entity.volume.push(volume);
    entity.other.insulation_weight = dto.others.insulation.weight.mrid || null;
    const mass = new Mass();
    let unitPartsInsulationW = (dto.others.insulation.weight.unit || '').split('|');
    mass.multiplier = unitPartsInsulationW.length > 1 ? unitPartsInsulationW[0] : null;
    mass.unit = unitPartsInsulationW.length > 1 ? unitPartsInsulationW[1] : unitPartsInsulationW[0] || null;
    mass.value = dto.others.insulation.weight.value || null;
    mass.mrid = dto.others.insulation.weight.mrid || null;
    entity.mass.push(mass);

    return entity
    
}