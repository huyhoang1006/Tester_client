import PowerCableEntity from "@/views/Entity/PowerCable";
import Temperature from "@/views/Cim/Temperature";
import Voltage from "@/views/Cim/Voltage";
import Frequency from "@/views/Cim/Frequency";
import Seconds from "@/views/Cim/Seconds";
import Length from "@/views/Cim/Length";
import Area from "@/views/Cim/Area";
import PowerCableDTO from "@/views/Dto/PowerCable";
import CurrentFlow from "@/views/Cim/CurrentFlow";

const mappingUnit = (map, unitDto) => {
    if (!map || !unitDto) return;

    map.mrid = unitDto.mrid || null;
    map.value = unitDto.value || null;

    const unitParts = (unitDto.unit || '').split('|'); // ví dụ: "k|V"
    map.multiplier = unitParts.length > 1 ? unitParts[0] : null;
    map.unit = unitParts.length > 1 ? unitParts[1] : unitParts[0] || null;
};

export function mapDtoToEntity(dto) {
    const entity = new PowerCableEntity();

    /** ================== properties ================== */
    entity.asset.mrid = dto.properties.mrid || null;
    entity.asset.kind = dto.properties.kind || null;
    entity.asset.type = dto.properties.type || null;
    entity.asset.serial_number = dto.properties.serial_no || null;
    entity.asset.asset_info = dto.assetInfoId || null;
    entity.productAssetModel.manufacturer = dto.properties.manufacturer || null;
    entity.concentricNeutral.manufacturer_type = dto.properties.manufacturer_type || null;
    entity.asset.country_of_origin = dto.properties.country_of_origin || null;
    entity.asset.name = dto.properties.apparatus_id || null;
    entity.asset.description = dto.properties.comment || null;
    entity.productAssetModel.mrid = dto.productAssetModelId || null;
    entity.asset.location = dto.locationId || null;
    entity.asset.product_asset_model = dto.productAssetModelId || null;
    entity.concentricNeutral.mrid = dto.assetInfoId || null;
    entity.joint.mrid = dto.datasData.jointsData.mrid || null;
    entity.terminal.mrid = dto.datasData.terminalsData.mrid || null;
    entity.sheathVoltageLimiter.mrid = dto.datasData.sheathLimitsData.mrid || null;
    entity.joint.cable_info_id = dto.assetInfoId || null;
    entity.terminal.cable_info_id = dto.assetInfoId || null;
    entity.sheathVoltageLimiter.cable_info_id = dto.assetInfoId || null;
    entity.oldCableInfo.mrid = dto.oldCableInfoId || null;
    entity.oldCableInfo.cable_info_id = dto.assetInfoId || null;

    /** ================== attachment ================== */
    entity.attachment.mrid = dto.attachmentId || null;
    entity.attachment = dto.attachment || null;

    // lifecycle date
    entity.lifecycleDate.manufactured_date = dto.properties.manufacturer_year || null;
    entity.lifecycleDate.mrid = dto.lifecycleDateId || null;
    entity.asset.lifecycle_date = dto.lifecycleDateId || null;

    //assetPsr
    entity.assetPsr.mrid = dto.assetPsrId || null;
    entity.assetPsr.asset_id = dto.properties.mrid || null;
    entity.assetPsr.psr_id = dto.psrId || null;

    /** ================== phases ================== */
    entity.oldCableInfo.phase_count = dto.configsData.phases.value || null;
    entity.oldCableInfo.core_count = dto.configsData.cores.value || null;

    /** ================== ratingsData ================== */
    entity.oldCableInfo.rated_u = dto.ratingsData.rated_voltage.mrid || null; //rated voltage
    const newRatedU = new Voltage();
    mappingUnit(newRatedU, dto.ratingsData.rated_voltage);
    entity.voltage.push(newRatedU);

    entity.oldCableInfo.max_u = dto.ratingsData.max_voltage.mrid || null;//max voltage
    const newMaxU = new Voltage();
    mappingUnit(newMaxU, dto.ratingsData.max_voltage);
    entity.voltage.push(newMaxU);

    entity.oldCableInfo.rated_frequency = dto.ratingsData.rated_frequency.mrid || null;//rated frequency
    const newRatedFrequency = new Frequency();
    mappingUnit(newRatedFrequency, dto.ratingsData.rated_frequency);
    entity.frequency.push(newRatedFrequency);

    entity.oldCableInfo.short_circuit_current = dto.ratingsData.shortcircuit.mrid || null;//short circuit current
    const newShortCircuitCurrent = new CurrentFlow();
    mappingUnit(newShortCircuitCurrent, dto.ratingsData.shortcircuit);
    entity.currentFlow.push(newShortCircuitCurrent);

    entity.oldCableInfo.rated_duration_short_circuit = dto.ratingsData.rated_duration.mrid || null;//rated duration of short circuit
    const newRatedDurationShortCircuit = new Seconds();
    mappingUnit(newRatedDurationShortCircuit, dto.ratingsData.rated_duration);
    entity.second.push(newRatedDurationShortCircuit);

    /** ================== others ================== */
    entity.oldCableInfo.installation_method = dto.othersData.insulation_method.value || null;//installation method
    entity.oldCableInfo.bonding_type = dto.othersData.bonding_type.value || null;//bonding type
    entity.oldCableInfo.install_location = dto.othersData.install_location.value || null;//install location
    entity.oldCableInfo.length = dto.othersData.cable_length.mrid || null;//cable length length

    const newLength = new Length();
    mappingUnit(newLength, dto.othersData.cable_length);
    entity.length.push(newLength);

    /** ================== conductor ================== */
    entity.oldCableInfo.conductor_size = dto.datasData.conductor.conductor_size.mrid || null;
    const newConductorSize = new Area();
    mappingUnit(newConductorSize, dto.datasData.conductor.conductor_size);
    entity.area.push(newConductorSize);

    if (dto.datasData.conductor.conductor_material.value !== 'Custom') {
        entity.concentricNeutral.material = dto.datasData.conductor.conductor_material.value || null;
    }

    entity.oldCableInfo.conductor_class = dto.datasData.conductor.conductor_class.value || null;
    entity.oldCableInfo.conductor_type = dto.datasData.conductor.conductor_type.value || null;
    entity.oldCableInfo.nominal_conductor_diameter = dto.datasData.conductor.conductor_diameter.mrid || null;
    const newNominalConductorDiameter = new Length();
    mappingUnit(newNominalConductorDiameter, dto.datasData.conductor.conductor_diameter);
    entity.length.push(newNominalConductorDiameter);

    /** ================== conductor shield ================== */
    entity.oldCableInfo.conductor_shield_thickness = dto.datasData.conductor_shield.thickness.mrid || null;
    const newConductorShieldThickness = new Length();
    mappingUnit(newConductorShieldThickness, dto.datasData.conductor_shield.thickness);
    entity.length.push(newConductorShieldThickness);

    entity.oldCableInfo.diameter_over_shield = dto.datasData.conductor_shield.diameter.mrid || null;
    const newDiameterOverShield = new Length();
    mappingUnit(newDiameterOverShield, dto.datasData.conductor_shield.diameter);
    entity.length.push(newDiameterOverShield);

    /** ================== sheath ================== */
    entity.oldCableInfo.sheath_multicore = dto.datasData.sheath.multicore.value || null;
    entity.oldCableInfo.sheath_contruction = dto.datasData.sheath.construction.value || null;

    entity.oldCableInfo.sheath_thickness = dto.datasData.sheath.thickness.mrid || null;
    const newSheathThickness = new Length();
    mappingUnit(newSheathThickness, dto.datasData.sheath.thickness);
    entity.length.push(newSheathThickness);

    entity.oldCableInfo.sheath_type = dto.datasData.sheath.sheath_type.value || null;

    entity.oldCableInfo.diameter_over_sheath = dto.datasData.sheath.diameter.mrid || null;
    const newDiameterOverSheath = new Length();
    mappingUnit(newDiameterOverSheath, dto.datasData.sheath.diameter);
    entity.length.push(newDiameterOverSheath);

    /** ================== insulation ================== */
    entity.oldCableInfo.insulation_max_operating_temp = dto.datasData.insulation.insulation_operating.mrid || null;
    const newInsulationMaxTemp = new Temperature();
    mappingUnit(newInsulationMaxTemp, dto.datasData.insulation.insulation_operating);
    entity.temperature.push(newInsulationMaxTemp);

    entity.concentricNeutral.insulation_material = dto.datasData.insulation.insulation_type.value || null;
    entity.concentricNeutral.insulation_thickness = dto.datasData.insulation.thickness.mrid || null;
    const newThickness = new Length();
    mappingUnit(newThickness, dto.datasData.insulation.thickness);
    entity.length.push(newThickness);

    entity.concentricNeutral.diameter_over_insulation = dto.datasData.insulation.diameter.mrid || null;
    const newDiameter = new Length();
    mappingUnit(newDiameter, dto.datasData.insulation.diameter);
    entity.length.push(newDiameter);

    /** ================== insulation screen ================== */
    entity.oldCableInfo.screen_material = dto.datasData.insulation_screen.material.value || null;
    entity.oldCableInfo.screen_thickness = dto.datasData.insulation_screen.thickness.mrid || null;
    const newScreenThickness = new Length();
    mappingUnit(newScreenThickness, dto.datasData.insulation_screen.thickness);
    entity.length.push(newScreenThickness);

    entity.concentricNeutral.diameter_over_screen = dto.datasData.insulation_screen.diameter.mrid || null;
    const newDiameterOverScreen = new Length();
    mappingUnit(newDiameterOverScreen, dto.datasData.insulation_screen.diameter);
    entity.length.push(newDiameterOverScreen);

    entity.concentricNeutral.insulation_thickness = dto.datasData.insulation_screen.thickness.mrid || null;

    /** ================== armour bedding ================== */
    entity.oldCableInfo.armour_bedding_material = dto.datasData.armour_bedding.material.value || null;
    entity.oldCableInfo.armour_bedding_thickness = dto.datasData.armour_bedding.thickness.mrid || null;
    const newArmourBeddingThickness = new Length();
    mappingUnit(newArmourBeddingThickness, dto.datasData.armour_bedding.thickness);
    entity.length.push(newArmourBeddingThickness);

    entity.oldCableInfo.diameter_bedding_over_armour = dto.datasData.armour_bedding.diameter.mrid || null;
    const newDiameterBeddingOverArmour = new Length();
    mappingUnit(newDiameterBeddingOverArmour, dto.datasData.armour_bedding.diameter);
    entity.length.push(newDiameterBeddingOverArmour);

    /** ================== sheath reinforcing ================== */
    entity.oldCableInfo.sheath_reinforcing_material = dto.datasData.sheath_reinforcing.material.value || null;
    entity.oldCableInfo.sheath_reinforcing_thickness = dto.datasData.sheath_reinforcing.thickness.mrid || null;
    const newSheathReinforcingThickness = new Length();
    mappingUnit(newSheathReinforcingThickness, dto.datasData.sheath_reinforcing.thickness);
    entity.length.push(newSheathReinforcingThickness);

    entity.oldCableInfo.diameter_over_sheath_reinforcing = dto.datasData.sheath_reinforcing.diameter.mrid || null;
    const newDiameterOverSheathReinforcing = new Length();
    mappingUnit(newDiameterOverSheathReinforcing, dto.datasData.sheath_reinforcing.diameter);
    entity.length.push(newDiameterOverSheathReinforcing);

    entity.oldCableInfo.sheath_reinforcing_width = dto.datasData.sheath_reinforcing.width.mrid || null;
    const newSheathReinforcingWidth = new Length();
    mappingUnit(newSheathReinforcingWidth, dto.datasData.sheath_reinforcing.width);
    entity.length.push(newSheathReinforcingWidth);

    entity.oldCableInfo.sheath_reinforcing_length_lay = dto.datasData.sheath_reinforcing.lengthOfLay.mrid || null;
    const newSheathReinforcingLengthLay = new Length();
    mappingUnit(newSheathReinforcingLengthLay, dto.datasData.sheath_reinforcing.lengthOfLay);
    entity.length.push(newSheathReinforcingLengthLay);

    entity.oldCableInfo.sheath_reinforcing_no_tape = dto.datasData.sheath_reinforcing.numOfTapes.value || null;

    /** ================== concentric neutral ================== */
    entity.oldCableInfo.concentric_material = dto.datasData.concentric_neutral.material.value || null;
    entity.oldCableInfo.concentric_contruction = dto.datasData.concentric_neutral.construction.value || null;
    entity.oldCableInfo.concentric_thickness = dto.datasData.concentric_neutral.thickness.mrid || null;
    const newConcentricThickness = new Length();
    mappingUnit(newConcentricThickness, dto.datasData.concentric_neutral.thickness);
    entity.length.push(newConcentricThickness);

    entity.concentricNeutral.diameter_over_neutral = dto.datasData.concentric_neutral.diameter.mrid || null;
    const newConcentricDiameter = new Length();
    mappingUnit(newConcentricDiameter, dto.datasData.concentric_neutral.diameter);
    entity.length.push(newConcentricDiameter);

    entity.oldCableInfo.concentric_length_lay = dto.datasData.concentric_neutral.lengthOfLay.mrid || null;
    const newConcentricLengthLay = new Length();
    mappingUnit(newConcentricLengthLay, dto.datasData.concentric_neutral.lengthOfLay);
    entity.length.push(newConcentricLengthLay);

    entity.oldCableInfo.concentric_area = dto.datasData.concentric_neutral.area.mrid || null;
    const newConcentricArea = new Area();
    mappingUnit(newConcentricArea, dto.datasData.concentric_neutral.area);
    entity.area.push(newConcentricArea);

    entity.oldCableInfo.concentric_no_of_wires = dto.datasData.concentric_neutral.numOfWires.value || null;

    /** ================== armour ================== */
    entity.oldCableInfo.armour_material = dto.datasData.armour.material.value || null;
    entity.oldCableInfo.armour_thickness = dto.datasData.armour.thickness.mrid || null;
    const newArmourThickness = new Length();
    mappingUnit(newArmourThickness, dto.datasData.armour.thickness);
    entity.length.push(newArmourThickness);
    entity.oldCableInfo.diameter_over_armour = dto.datasData.armour.diameter.mrid || null;
    const newDiameterOverArmour = new Length();
    mappingUnit(newDiameterOverArmour, dto.datasData.armour.diameter);
    entity.length.push(newDiameterOverArmour);

    entity.oldCableInfo.armour_layer_tape = dto.datasData.armour.layerOfTapes.value || null;
    entity.oldCableInfo.armour_cross_sectional_area_tap = dto.datasData.armour.crossSectional.mrid || null;
    const newArmourCrossSectionalAreaTap = new Area();
    mappingUnit(newArmourCrossSectionalAreaTap, dto.datasData.armour.crossSectional);
    entity.area.push(newArmourCrossSectionalAreaTap);

    /** ================== jacket ================== */
    entity.oldCableInfo.jacket_thickness = dto.datasData.oversheath.thickness.mrid || null;
    const newJacketThickness = new Length();
    mappingUnit(newJacketThickness, dto.datasData.oversheath.thickness);
    entity.length.push(newJacketThickness);

    entity.concentricNeutral.outer_jacket_kind = dto.datasData.oversheath.material.value || null;

    entity.concentricNeutral.diameter_over_jacket = dto.datasData.oversheath.diameter.mrid || null;
    const newDiameterOverJacket = new Length();
    mappingUnit(newDiameterOverJacket, dto.datasData.oversheath.diameter);
    entity.length.push(newDiameterOverJacket);

    // Joint
    entity.joint.rated_u = dto.datasData.jointsData.rated_u.mrid || null;
    const newJointRatedU = new Voltage();
    mappingUnit(newJointRatedU, dto.datasData.jointsData.rated_u);
    entity.voltage.push(newJointRatedU);

    entity.joint.rated_current = dto.datasData.jointsData.rated_current.mrid || null;
    const newJointRatedCurrent = new CurrentFlow;
    mappingUnit(newJointRatedCurrent, dto.datasData.jointsData.rated_current);
    entity.currentFlow.push(newJointRatedCurrent);

    entity.joint.category = dto.datasData.jointsData.category.value || null;
    entity.joint.construction = dto.datasData.jointsData.construction.value || null;
    entity.joint.service_condition = dto.datasData.jointsData.service_condition.value || null;

    // Terminal

    entity.terminal.rated_u = dto.datasData.terminalsData.rated_u.mrid || null;
    const newTerminalRatedU = new Voltage();
    mappingUnit(newTerminalRatedU, dto.datasData.terminalsData.rated_u);
    entity.voltage.push(newTerminalRatedU);

    entity.terminal.bil = dto.datasData.terminalsData.bil.mrid || null;
    const newTerminalBil = new Voltage();
    mappingUnit(newTerminalBil, dto.datasData.terminalsData.bil);
    entity.voltage.push(newTerminalBil);

    entity.terminal.bsl = dto.datasData.terminalsData.bsl.mrid || null;
    const newTerminalBsl = new Voltage();
    mappingUnit(newTerminalBsl, dto.datasData.terminalsData.bsl);
    entity.voltage.push(newTerminalBsl);

    entity.terminal.type = dto.datasData.terminalsData.type.value || null;
    entity.terminal.connector_type = dto.datasData.terminalsData.connector_type.value || null;
    entity.terminal.service_condition = dto.datasData.terminalsData.service_condition.value || null;
    entity.terminal.class = dto.datasData.terminalsData.class.value || null;

    // Sheath Voltage Limiter

    entity.sheathVoltageLimiter.rated_voltage_ur = dto.datasData.sheathLimitsData.rated_voltage_ur.mrid || null;
    const newSheathRatedU = new Voltage();
    mappingUnit(newSheathRatedU, dto.datasData.sheathLimitsData.rated_voltage_ur);
    entity.voltage.push(newSheathRatedU);

    entity.sheathVoltageLimiter.max_continuous_operating_voltage = dto.datasData.sheathLimitsData.max_continuous_operating_voltage.mrid || null;
    const newSheathMaxU = new Voltage();
    mappingUnit(newSheathMaxU, dto.datasData.sheathLimitsData.max_continuous_operating_voltage);
    entity.voltage.push(newSheathMaxU);

    entity.sheathVoltageLimiter.nominal_discharge_current = dto.datasData.sheathLimitsData.nominal_discharge_current.mrid || null;
    const newSheathNominalCurrent = new CurrentFlow();
    mappingUnit(newSheathNominalCurrent, dto.datasData.sheathLimitsData.nominal_discharge_current);
    entity.currentFlow.push(newSheathNominalCurrent);

    entity.sheathVoltageLimiter.high_current_impulse_withstand = dto.datasData.sheathLimitsData.high_current_impulse_withstand.mrid || null;
    const newSheathHighCurrent = new CurrentFlow();
    mappingUnit(newSheathHighCurrent, dto.datasData.sheathLimitsData.high_current_impulse_withstand);
    entity.currentFlow.push(newSheathHighCurrent);
    entity.sheathVoltageLimiter.long_duration_current_impulse_withstand = dto.datasData.sheathLimitsData.long_duration_current_impulse_withstand.mrid || null;
    const newSheathLongCurrent = new CurrentFlow();
    mappingUnit(newSheathLongCurrent, dto.datasData.sheathLimitsData.long_duration_current_impulse_withstand);
    entity.currentFlow.push(newSheathLongCurrent);
    entity.sheathVoltageLimiter.short_circuit_withstand = dto.datasData.sheathLimitsData.short_circuit_withstand.mrid || null;
    const newSheathShortCurrent = new CurrentFlow();
    mappingUnit(newSheathShortCurrent, dto.datasData.sheathLimitsData.short_circuit_withstand);
    entity.currentFlow.push(newSheathShortCurrent);
    return entity;
}

export function mapEntityToDto(entity) {
    console.log('Entity to DTO: ', entity);
    const dto = new PowerCableDTO();

    // ================== properties ==================
    dto.properties = {
        mrid: entity.asset.mrid || null,
        kind: entity.asset.kind || null,
        type: entity.asset.type || null,
        serial_no: entity.asset.serial_number || null,
        manufacturer: entity.productAssetModel.manufacturer || null,
        manufacturer_type: entity.concentricNeutral.manufacturer_type || null,
        country_of_origin: entity.asset.country_of_origin || null,
        apparatus_id: entity.asset.name || null,
        comment: entity.asset.description || null,
        manufacturer_year: entity.lifecycleDate.manufactured_date || null,
    };
    dto.assetInfoId = entity.asset.asset_info || null;
    dto.productAssetModelId = entity.productAssetModel.mrid || null;
    dto.locationId = entity.asset.location || null;
    dto.oldCableInfoId = entity.oldCableInfo.mrid || null;
    dto.assetInfoId = entity.oldCableInfo.mrid || null;
    dto.assetPsrId = entity.assetPsr.mrid || null;
    dto.psrId = entity.assetPsr.psr_id || null;
    // ================== attachment ==================
    dto.attachmentId = entity.attachment.mrid || null;
    dto.attachment = entity.attachment || null;

    // lifecycle date
    dto.properties.manufacturer_year = entity.lifecycleDate.manufactured_date || null;
    dto.lifecycleDateId = entity.lifecycleDate.mrid || null;
    dto.lifecycleDateId = entity.asset.lifecycle_date || null;

    // assetPsr
    dto.assetPsrId = entity.assetPsr.mrid || null;
    dto.properties.mrid = entity.assetPsr.asset_id || null;
    dto.psrId = entity.assetPsr.psr_id || null;


    // ================== phases ==================
    dto.configsData.phases.value = entity.oldCableInfo.phase_count != null ? Number(entity.oldCableInfo.phase_count) : null;
    dto.configsData.cores.value = entity.oldCableInfo.core_count != null ? String(entity.oldCableInfo.core_count) : null;


    // ================== ratingsData ==================
    dto.ratingsData.rated_voltage.mrid = entity.oldCableInfo.rated_u || null;
    for (const voltage of entity.voltage) {
        if (voltage && dto.ratingsData.rated_voltage.mrid === voltage.mrid) {
            dto.ratingsData.rated_voltage.value = voltage.value || null;
            break;
        }
    }
    dto.ratingsData.max_voltage.mrid = entity.oldCableInfo.max_u || null;
    for (const voltage of entity.voltage) {
        if (voltage && dto.ratingsData.max_voltage.mrid === voltage.mrid) {
            dto.ratingsData.max_voltage.value = voltage.value || null;
            break;
        }
    }
    dto.ratingsData.rated_frequency.mrid = entity.oldCableInfo.rated_frequency || null;
    for (const frequency of entity.frequency) {
        if (frequency && dto.ratingsData.rated_frequency.mrid === frequency.mrid) {
            dto.ratingsData.rated_frequency.value = frequency.value || null;
            break;
        }
    }
    dto.ratingsData.shortcircuit.mrid = entity.oldCableInfo.short_circuit_current || null;
    for (const current of entity.currentFlow) {
        if (current && dto.ratingsData.shortcircuit.mrid === current.mrid) {
            dto.ratingsData.shortcircuit.value = current.value || null;
            break;
        }
    }
    dto.ratingsData.rated_duration.mrid = entity.oldCableInfo.rated_duration_short_circuit || null;
    for (const second of entity.second) {
        if (second && dto.ratingsData.rated_duration.mrid === second.mrid) {
            dto.ratingsData.rated_duration.value = second.value || null;
            break;
        }
    }
    // ================== others ==================
    dto.othersData.insulation_method.value = entity.oldCableInfo.installation_method || null;
    dto.othersData.bonding_type.value = entity.oldCableInfo.bonding_type || null;
    dto.othersData.install_location.value = entity.oldCableInfo.install_location || null;
    dto.othersData.cable_length.mrid = entity.oldCableInfo.length || null;
    for (const length of entity.length) {
        if (length && dto.othersData.cable_length.mrid === length.mrid) {
            dto.othersData.cable_length.value = length.value || null;
            break;
        }
    }

    // ================== conductor ==================
    dto.datasData.conductor.conductor_size.mrid = entity.oldCableInfo.conductor_size || null;
    for (const area of entity.area) {
        if (area && dto.datasData.conductor.conductor_size.mrid === area.mrid) {
            dto.datasData.conductor.conductor_size.value = area.value || null;
            break;
        }
    }
    dto.datasData.conductor.conductor_class.value = entity.oldCableInfo.conductor_class || null;
    dto.datasData.conductor.conductor_type.value = entity.oldCableInfo.conductor_type || null;
    dto.datasData.conductor.conductor_diameter.mrid = entity.oldCableInfo.nominal_conductor_diameter || null;
    for (const length of entity.length) {
        if (length && dto.datasData.conductor.conductor_diameter.mrid === length.mrid) {
            dto.datasData.conductor.conductor_diameter.value = length.value || null;
            break;
        }
    }
    dto.datasData.conductor.conductor_material.value = entity.concentricNeutral.material || null;
    // ================== conductor shield ==================
    dto.datasData.conductor_shield.thickness.mrid = entity.oldCableInfo.conductor_shield_thickness || null;
    for (const length of entity.length) {
        if (length && dto.datasData.conductor_shield.thickness.mrid === length.mrid) {
            dto.datasData.conductor_shield.thickness.value = length.value || null;
            break;
        }
    }
    dto.datasData.conductor_shield.diameter.mrid = entity.oldCableInfo.diameter_over_shield || null;
    for (const length of entity.length) {
        if (length && dto.datasData.conductor_shield.diameter.mrid === length.mrid) {
            dto.datasData.conductor_shield.diameter.value = length.value || null;
            break;
        }
    }
    // ================== sheath ==================
    dto.datasData.sheath.multicore.value = entity.oldCableInfo.sheath_multicore || null;
    dto.datasData.sheath.construction.value = entity.oldCableInfo.sheath_contruction || null;
    dto.datasData.sheath.thickness.mrid = entity.oldCableInfo.sheath_thickness || null;
    dto.datasData.sheath.sheath_type.value = entity.oldCableInfo.sheath_type || null;
    for (const length of entity.length) {
        if (length && dto.datasData.sheath.thickness.mrid === length.mrid) {
            dto.datasData.sheath.thickness.value = length.value || null;
            break;
        }
    }
    dto.datasData.sheath.diameter.mrid = entity.oldCableInfo.diameter_over_sheath || null;
    for (const length of entity.length) {
        if (length && dto.datasData.sheath.diameter.mrid === length.mrid) {
            dto.datasData.sheath.diameter.value = length.value || null;
            break;
        }
    }
    // ================== insulation ==================
    dto.datasData.insulation.insulation_type.value = entity.concentricNeutral.insulation_material || null;
    dto.datasData.insulation.insulation_operating.mrid = entity.oldCableInfo.insulation_max_operating_temp || null;
    const insulationOperatingObj = entity.temperature.find(
        t => t && dto.datasData.insulation.insulation_operating.mrid === t.mrid
    );
    dto.datasData.insulation.insulation_operating.value = insulationOperatingObj ? insulationOperatingObj.value || null : null;
    dto.datasData.insulation.thickness.mrid = entity.concentricNeutral.insulation_thickness || null;
    for (const length of entity.length) {
        if (length && dto.datasData.insulation.thickness.mrid === length.mrid) {
            dto.datasData.insulation.thickness.value = length.value || null;
            break;
        }
    }
    dto.datasData.insulation.diameter.mrid = entity.concentricNeutral.diameter_over_insulation || null;
    for (const length of entity.length) {
        if (length && dto.datasData.insulation.diameter.mrid === length.mrid) {
            dto.datasData.insulation.diameter.value = length.value || null;
            break;
        }
    }
    // ================== insulation screen ==================

    dto.datasData.insulation_screen.material.value = entity.oldCableInfo.screen_material || null;

    dto.datasData.insulation_screen.thickness.mrid = entity.oldCableInfo.screen_thickness || null;
    for (const length of entity.length) {
        if (length && dto.datasData.insulation_screen.thickness.mrid === length.mrid) {
            dto.datasData.insulation_screen.thickness.value = length.value || null;
            break;
        }
    }
    dto.datasData.insulation_screen.diameter.mrid = entity.concentricNeutral.diameter_over_screen || null;
    for (const length of entity.length) {
        if (length && dto.datasData.insulation_screen.diameter.mrid === length.mrid) {
            dto.datasData.insulation_screen.diameter.value = length.value || null;
            break;
        }
    }
    dto.datasData.insulation_screen.thickness.mrid = entity.concentricNeutral.insulation_thickness || null;
    // ================== armour bedding ==================
    dto.datasData.armour_bedding.material.value = entity.oldCableInfo.armour_bedding_material || null;

    dto.datasData.armour_bedding.thickness.mrid = entity.oldCableInfo.armour_bedding_thickness || null;
    for (const length of entity.length) {
        if (length && dto.datasData.armour_bedding.thickness.mrid === length.mrid) {
            dto.datasData.armour_bedding.thickness.value = length.value || null;
            break;
        }
    }
    dto.datasData.armour_bedding.diameter.mrid = entity.oldCableInfo.diameter_bedding_over_armour || null;
    for (const length of entity.length) {
        if (length && dto.datasData.armour_bedding.diameter.mrid === length.mrid) {
            dto.datasData.armour_bedding.diameter.value = length.value || null;
            break;
        }
    }

    // ================== sheath reinforcing ==================
    dto.datasData.sheath_reinforcing.material.value = entity.oldCableInfo.sheath_reinforcing_material || null;

    dto.datasData.sheath_reinforcing.thickness.mrid = entity.oldCableInfo.sheath_reinforcing_thickness || null;
    for (const length of entity.length) {
        if (length && dto.datasData.sheath_reinforcing.thickness.mrid === length.mrid) {
            dto.datasData.sheath_reinforcing.thickness.value = length.value || null;
            break;
        }
    }
    dto.datasData.sheath_reinforcing.diameter.mrid = entity.oldCableInfo.diameter_over_sheath_reinforcing || null;
    for (const length of entity.length) {
        if (length && dto.datasData.sheath_reinforcing.diameter.mrid === length.mrid) {
            dto.datasData.sheath_reinforcing.diameter.value = length.value || null;
            break;
        }
    }
    dto.datasData.sheath_reinforcing.width.mrid = entity.oldCableInfo.sheath_reinforcing_width || null;
    for (const length of entity.length) {
        if (length && dto.datasData.sheath_reinforcing.width.mrid === length.mrid) {
            dto.datasData.sheath_reinforcing.width.value = length.value || null;
            break;
        }
    }
    dto.datasData.sheath_reinforcing.lengthOfLay.mrid = entity.oldCableInfo.sheath_reinforcing_length_lay || null;
    for (const length of entity.length) {
        if (length && dto.datasData.sheath_reinforcing.lengthOfLay.mrid === length.mrid) {
            dto.datasData.sheath_reinforcing.lengthOfLay.value = length.value || null;
            break;
        }
    }
    dto.datasData.sheath_reinforcing.numOfTapes.value = entity.oldCableInfo.sheath_reinforcing_no_tape || null;

    // ================== concentric neutral ==================
    dto.datasData.concentric_neutral.material.value = entity.oldCableInfo.concentric_material || null;
    dto.datasData.concentric_neutral.construction.value = entity.oldCableInfo.concentric_contruction || null;
    dto.datasData.concentric_neutral.thickness.mrid = entity.oldCableInfo.concentric_thickness || null;
    for (const length of entity.length) {
        if (length && dto.datasData.concentric_neutral.thickness.mrid === length.mrid) {
            dto.datasData.concentric_neutral.thickness.value = length.value || null;
            break;
        }
    }
    dto.datasData.concentric_neutral.diameter.mrid = entity.concentricNeutral.diameter_over_neutral || null;
    for (const length of entity.length) {
        if (length && dto.datasData.concentric_neutral.diameter.mrid === length.mrid) {
            dto.datasData.concentric_neutral.diameter.value = length.value || null;
            break;
        }
    }
    dto.datasData.concentric_neutral.lengthOfLay.mrid = entity.oldCableInfo.concentric_length_lay || null;
    for (const length of entity.length) {
        if (length && dto.datasData.concentric_neutral.lengthOfLay.mrid === length.mrid) {
            dto.datasData.concentric_neutral.lengthOfLay.value = length.value || null;
            break;
        }
    }
    dto.datasData.concentric_neutral.area.mrid = entity.oldCableInfo.concentric_area || null;
    for (const area of entity.area) {
        if (area && dto.datasData.concentric_neutral.area.mrid === area.mrid) {
            dto.datasData.concentric_neutral.area.value = area.value || null;
            break;
        }
    }
    dto.datasData.concentric_neutral.numOfWires.value = entity.oldCableInfo.concentric_no_of_wires || null;


    // ================== armour ==================
    dto.datasData.armour.material.value = entity.oldCableInfo.armour_material || null;

    dto.datasData.armour.thickness.mrid = entity.oldCableInfo.armour_thickness || null;
    for (const length of entity.length) {
        if (length && dto.datasData.armour.thickness.mrid === length.mrid) {
            dto.datasData.armour.thickness.value = length.value || null;
            break;
        }
    }
    dto.datasData.armour.diameter.mrid = entity.oldCableInfo.diameter_over_armour || null;
    for (const length of entity.length) {
        if (length && dto.datasData.armour.diameter.mrid === length.mrid) {
            dto.datasData.armour.diameter.value = length.value || null;
            break;
        }
    }
    dto.datasData.armour.layerOfTapes.value = entity.oldCableInfo.armour_layer_tape || null;
    dto.datasData.armour.crossSectional.mrid = entity.oldCableInfo.armour_cross_sectional_area_tap || null;
    for (const area of entity.area) {
        if (area && dto.datasData.armour.crossSectional.mrid === area.mrid) {
            dto.datasData.armour.crossSectional.value = area.value || null;
            break;
        }
    }

    // ================== jacket ==================
    dto.datasData.oversheath.thickness.mrid = entity.oldCableInfo.jacket_thickness || null;
    dto.datasData.oversheath.material.value = entity.concentricNeutral.outer_jacket_kind || null;
    for (const length of entity.length) {
        if (length && dto.datasData.oversheath.thickness.mrid === length.mrid) {
            dto.datasData.oversheath.thickness.value = length.value || null;
            break;
        }
    }
    dto.datasData.oversheath.diameter.mrid = entity.concentricNeutral.diameter_over_jacket || null;
    for (const length of entity.length) {
        if (length && dto.datasData.oversheath.diameter.mrid === length.mrid) {
            dto.datasData.oversheath.diameter.value = length.value || null;
            break;
        }
    }

    // Joint
    dto.datasData.jointsData.rated_u.mrid = entity.joint.rated_u || null;
    for (const voltage of entity.voltage) {
        if (voltage && dto.datasData.jointsData.rated_u.mrid === voltage.mrid) {
            dto.datasData.jointsData.rated_u.value = voltage.value || null;
            break;
        }
    }
    dto.datasData.jointsData.rated_current.mrid = entity.joint.rated_current || null;
    for (const current of entity.currentFlow) {
        if (current && dto.datasData.jointsData.rated_current.mrid === current.mrid) {
            dto.datasData.jointsData.rated_current.value = current.value || null;
            break;
        }
    }
    dto.datasData.jointsData.category.value = entity.joint.category || null;
    dto.datasData.jointsData.construction.value = entity.joint.construction || null;
    dto.datasData.jointsData.service_condition.value = entity.joint.service_condition || null;

    // Terminal
    dto.datasData.terminalsData.rated_u.mrid = entity.terminal.rated_u || null;
    for (const voltage of entity.voltage) {
        if (voltage && dto.datasData.terminalsData.rated_u.mrid === voltage.mrid) {
            dto.datasData.terminalsData.rated_u.value = voltage.value || null;
            break;
        }
    }
    dto.datasData.terminalsData.bil.mrid = entity.terminal.bil || null;
    for (const voltage of entity.voltage) {
        if (voltage && dto.datasData.terminalsData.bil.mrid === voltage.mrid) {
            dto.datasData.terminalsData.bil.value = voltage.value || null;
            break;
        }
    }
    dto.datasData.terminalsData.bsl.mrid = entity.terminal.bsl || null;
    for (const voltage of entity.voltage) {
        if (voltage && dto.datasData.terminalsData.bsl.mrid === voltage.mrid) {
            dto.datasData.terminalsData.bsl.value = voltage.value || null;
            break;
        }
    }
    dto.datasData.terminalsData.type.value = entity.terminal.type || null;
    dto.datasData.terminalsData.connector_type.value = entity.terminal.connector_type || null;
    dto.datasData.terminalsData.service_condition.value = entity.terminal.service_condition || null;
    dto.datasData.terminalsData.class.value = entity.terminal.class || null;

    // Sheath Voltage Limiter
    dto.datasData.sheathLimitsData.rated_voltage_ur.mrid = entity.sheathVoltageLimiter.rated_voltage_ur || null;
    for (const voltage of entity.voltage) {
        if (voltage && dto.datasData.sheathLimitsData.rated_voltage_ur.mrid === voltage.mrid) {
            dto.datasData.sheathLimitsData.rated_voltage_ur.value = voltage.value || null;
            break;
        }
    }
    dto.datasData.sheathLimitsData.max_continuous_operating_voltage.mrid = entity.sheathVoltageLimiter.max_continuous_operating_voltage || null;
    for (const voltage of entity.voltage) {
        if (voltage && dto.datasData.sheathLimitsData.max_continuous_operating_voltage.mrid === voltage.mrid) {
            dto.datasData.sheathLimitsData.max_continuous_operating_voltage.value = voltage.value || null;
            break;
        }
    }
    dto.datasData.sheathLimitsData.nominal_discharge_current.mrid = entity.sheathVoltageLimiter.nominal_discharge_current || null;
    for (const current of entity.currentFlow) {
        if (current && dto.datasData.sheathLimitsData.nominal_discharge_current.mrid === current.mrid) {
            dto.datasData.sheathLimitsData.nominal_discharge_current.value = current.value || null;
            break;
        }
    }
    dto.datasData.sheathLimitsData.high_current_impulse_withstand.mrid = entity.sheathVoltageLimiter.high_current_impulse_withstand || null;
    for (const current of entity.currentFlow) {
        if (current && dto.datasData.sheathLimitsData.high_current_impulse_withstand.mrid === current.mrid) {
            dto.datasData.sheathLimitsData.high_current_impulse_withstand.value = current.value || null;
            break;
        }
    }
    dto.datasData.sheathLimitsData.long_duration_current_impulse_withstand.mrid = entity.sheathVoltageLimiter.long_duration_current_impulse_withstand || null;
    for (const current of entity.currentFlow) {
        if (current && dto.datasData.sheathLimitsData.long_duration_current_impulse_withstand.mrid === current.mrid) {
            dto.datasData.sheathLimitsData.long_duration_current_impulse_withstand.value = current.value || null;
            break;
        }
    }
    dto.datasData.sheathLimitsData.short_circuit_withstand.mrid = entity.sheathVoltageLimiter.short_circuit_withstand || null;
    for (const current of entity.currentFlow) {
        if (current && dto.datasData.sheathLimitsData.short_circuit_withstand.mrid === current.mrid) {
            dto.datasData.sheathLimitsData.short_circuit_withstand.value = current.value || null;
            break;
        }
    }
    return dto;
}





