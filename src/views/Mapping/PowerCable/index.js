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

    if (dto.datasData.conductor.conductor_material.value !== 'custom') {
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
    const newJointRatedCurrent = new CurrentFlow();
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
    const newTerminalBsl = new Frequency();
    mappingUnit(newTerminalBsl, dto.datasData.terminalsData.bsl);
    entity.frequency.push(newTerminalBsl);

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
    const newSheathNominalCurrent = new Frequency();
    mappingUnit(newSheathNominalCurrent, dto.datasData.sheathLimitsData.nominal_discharge_current);
    entity.frequency.push(newSheathNominalCurrent);

    entity.sheathVoltageLimiter.high_current_impulse_withstand = dto.datasData.sheathLimitsData.high_current_impulse_withstand.mrid || null;
    entity.sheathVoltageLimiter.long_duration_current_impulse_withstand = dto.datasData.sheathLimitsData.long_duration_current_impulse_withstand.mrid || null;
    entity.sheathVoltageLimiter.short_circuit_withstand = dto.datasData.sheathLimitsData.short_circuit_withstand.mrid || null;

    return entity;
}

export function mapEntityToDto(entity) {
    const dto = new PowerCableDTO();

    /** ================== properties ================== */
    dto.properties.mrid = entity.asset.mrid || '';
    dto.properties.kind = entity.asset.kind || '';
    dto.properties.type = entity.asset.type || '';
    dto.properties.serial_no = entity.asset.serial_number || '';
    dto.assetInfoId = entity.asset.asset_info || '';
    dto.properties.manufacturer = entity.productAssetModel.manufacturer || '';
    dto.properties.manufacturer_type = entity.asset.manufacturer_type || '';
    dto.properties.country_of_origin = entity.asset.country_of_origin || '';
    dto.properties.apparatus_id = entity.asset.name || '';
    dto.properties.comment = entity.asset.description || '';
    dto.productAssetModelId = entity.productAssetModel.mrid || '';
    dto.locationId = entity.asset.location || '';
    dto.productAssetModelId = entity.asset.product_asset_model || '';
    dto.mrid = entity.asset.asset_info || '';
    dto.mrid = entity.concentricNeutral.mrid || '';
    dto.datasData.jointsData.mrid = entity.joint.mrid || '';
    dto.datasData.terminalsData.mrid = entity.terminal.mrid || '';
    dto.datasData.sheathLimitsData.mrid = entity.sheathVoltageLimiter.mrid || '';
    dto.mrid = entity.joint.cable_info_id || '';
    dto.mrid = entity.terminal.cable_info_id || '';
    dto.mrid = entity.sheathVoltageLimiter.cable_info_id || '';
    dto.mrid = entity.oldCableInfo.cable_info_id || '';
    dto.oldCableInfo.mrid = entity.oldCableInfo.mrid || '';

    /** ================== attachment ================== */
    dto.attachmentId = entity.attachment.mrid || '';
    dto.attachment = entity.attachment || '';

    /** ================== lifecycle date ================== */
    dto.properties.manufacturer_year = entity.lifecycleDate.manufactured_date || '';
    dto.lifecycleDateId = entity.lifecycleDate.mrid || '';

    /** ================== assetPsr ================== */
    dto.assetPsrId = entity.assetPsr.mrid || '';
    dto.properties.mrid = entity.assetPsr.asset_id || '';
    dto.psrId = entity.assetPsr.psr_id || '';

    /** ================== phases ================== */
    dto.configsData = dto.configsData || {};
    dto.configsData.phases = { value: entity.oldCableInfo.phase_count || '' };
    dto.configsData.cores = { value: entity.oldCableInfo.core_count || '' };

    /** ================== ratingsData ================== */
    dto.ratingsData = dto.ratingsData || {};
    // Rated voltage
    dto.ratingsData.rated_voltage = { mrid: entity.oldCableInfo.rated_u || '' };
    const ratedVoltage = entity.voltage.find(v => v.mrid === entity.oldCableInfo.rated_u) || {};
    dto.ratingsData.rated_voltage.value = ratedVoltage.value || '';
    dto.ratingsData.rated_voltage.unit = ratedVoltage.unit ? (ratedVoltage.multiplier ? `${ratedVoltage.multiplier}|${ratedVoltage.unit}` : ratedVoltage.unit) : '';

    // Max voltage
    dto.ratingsData.max_voltage = { mrid: entity.oldCableInfo.max_u || '' };
    const maxVoltage = entity.voltage.find(v => v.mrid === entity.oldCableInfo.max_u) || {};
    dto.ratingsData.max_voltage.value = maxVoltage.value || '';
    dto.ratingsData.max_voltage.unit = maxVoltage.unit ? (maxVoltage.multiplier ? `${maxVoltage.multiplier}|${maxVoltage.unit}` : maxVoltage.unit) : '';

    // Rated frequency
    dto.ratingsData.rated_frequency = { mrid: entity.oldCableInfo.rated_frequency || '' };
    const ratedFrequency = entity.frequency.find(f => f.mrid === entity.oldCableInfo.rated_frequency) || {};
    dto.ratingsData.rated_frequency.value = ratedFrequency.value || '';
    dto.ratingsData.rated_frequency.unit = ratedFrequency.unit ? (ratedFrequency.multiplier ? `${ratedFrequency.multiplier}|${ratedFrequency.unit}` : ratedFrequency.unit) : '';

    // Short circuit current
    dto.ratingsData.shortcircuit = { mrid: entity.oldCableInfo.short_circuit_current || '' };
    const shortCircuitCurrent = entity.temperature.find(t => t.mrid === entity.oldCableInfo.short_circuit_current) || {};
    dto.ratingsData.shortcircuit.value = shortCircuitCurrent.value || '';
    dto.ratingsData.shortcircuit.unit = shortCircuitCurrent.unit ? (shortCircuitCurrent.multiplier ? `${shortCircuitCurrent.multiplier}|${shortCircuitCurrent.unit}` : shortCircuitCurrent.unit) : '';

    // Rated duration of short circuit
    dto.ratingsData.rated_duration = { mrid: entity.oldCableInfo.rated_duration_short_circuit || '' };
    const ratedDuration = entity.frequency.find(f => f.mrid === entity.oldCableInfo.rated_duration_short_circuit) || {};
    dto.ratingsData.rated_duration.value = ratedDuration.value || '';
    dto.ratingsData.rated_duration.unit = ratedDuration.unit ? (ratedDuration.multiplier ? `${ratedDuration.multiplier}|${ratedDuration.unit}` : ratedDuration.unit) : '';

    /** ================== others ================== */
    dto.othersData = dto.othersData || {};
    dto.othersData.insulation_method = { value: entity.oldCableInfo.installation_method || '' };
    dto.othersData.bonding_type = { value: entity.oldCableInfo.bonding_type || '' };
    dto.othersData.install_location = { value: entity.oldCableInfo.install_location || '' };
    dto.othersData.cable_length = { mrid: entity.oldCableInfo.length || '' };
    const cableLength = entity.length.find(l => l.mrid === entity.oldCableInfo.length) || {};
    dto.othersData.cable_length.value = cableLength.value || '';
    dto.othersData.cable_length.unit = cableLength.unit ? (cableLength.multiplier ? `${cableLength.multiplier}|${cableLength.unit}` : cableLength.unit) : '';

    /** ================== conductor ================== */
    dto.datasData = dto.datasData || {};
    dto.datasData.conductor = dto.datasData.conductor || {};
    dto.datasData.conductor.conductor_size = { mrid: entity.oldCableInfo.conductor_size || '' };
    const conductorSize = entity.area.find(a => a.mrid === entity.oldCableInfo.conductor_size) || {};
    dto.datasData.conductor.conductor_size.value = conductorSize.value || '';
    dto.datasData.conductor.conductor_size.unit = conductorSize.unit ? (conductorSize.multiplier ? `${conductorSize.multiplier}|${conductorSize.unit}` : conductorSize.unit) : '';

    dto.datasData.conductor.conductor_material = { value: entity.concentricNeutral.material || '' };
    dto.datasData.conductor.conductor_class = { value: entity.oldCableInfo.conductor_class || '' };
    dto.datasData.conductor.conductor_type = { value: entity.oldCableInfo.conductor_type || '' };
    dto.datasData.conductor.conductor_diameter = { mrid: entity.oldCableInfo.nominal_conductor_diameter || '' };
    const conductorDiameter = entity.length.find(l => l.mrid === entity.oldCableInfo.nominal_conductor_diameter) || {};
    dto.datasData.conductor.conductor_diameter.value = conductorDiameter.value || '';
    dto.datasData.conductor.conductor_diameter.unit = conductorDiameter.unit ? (conductorDiameter.multiplier ? `${conductorDiameter.multiplier}|${conductorDiameter.unit}` : conductorDiameter.unit) : '';

    /** ================== conductor shield ================== */
    dto.datasData.conductor_shield = dto.datasData.conductor_shield || {};
    dto.datasData.conductor_shield.thickness = { mrid: entity.oldCableInfo.conductor_shield_thickness || '' };
    const conductorShieldThickness = entity.length.find(l => l.mrid === entity.oldCableInfo.conductor_shield_thickness) || {};
    dto.datasData.conductor_shield.thickness.value = conductorShieldThickness.value || '';
    dto.datasData.conductor_shield.thickness.unit = conductorShieldThickness.unit ? (conductorShieldThickness.multiplier ? `${conductorShieldThickness.multiplier}|${conductorShieldThickness.unit}` : conductorShieldThickness.unit) : '';

    dto.datasData.conductor_shield.diameter = { mrid: entity.oldCableInfo.diameter_over_shield || '' };
    const diameterOverShield = entity.length.find(l => l.mrid === entity.oldCableInfo.diameter_over_shield) || {};
    dto.datasData.conductor_shield.diameter.value = diameterOverShield.value || '';
    dto.datasData.conductor_shield.diameter.unit = diameterOverShield.unit ? (diameterOverShield.multiplier ? `${diameterOverShield.multiplier}|${diameterOverShield.unit}` : diameterOverShield.unit) : '';

    /** ================== sheath ================== */
    dto.datasData.sheath = dto.datasData.sheath || {};
    dto.datasData.sheath.multicore = { value: entity.oldCableInfo.sheath_multicore || '' };
    dto.datasData.sheath.construction = { value: entity.oldCableInfo.sheath_contruction || '' };
    dto.datasData.sheath.thickness = { mrid: entity.oldCableInfo.sheath_thickness || '' };
    const sheathThickness = entity.length.find(l => l.mrid === entity.oldCableInfo.sheath_thickness) || {};
    dto.datasData.sheath.thickness.value = sheathThickness.value || '';
    dto.datasData.sheath.thickness.unit = sheathThickness.unit ? (sheathThickness.multiplier ? `${sheathThickness.multiplier}|${sheathThickness.unit}` : sheathThickness.unit) : '';

    dto.datasData.sheath.sheath_type = { value: entity.oldCableInfo.sheath_type || '' };
    dto.datasData.sheath.diameter = { mrid: entity.oldCableInfo.diameter_over_sheath || '' };
    const diameterOverSheath = entity.length.find(l => l.mrid === entity.oldCableInfo.diameter_over_sheath) || {};
    dto.datasData.sheath.diameter.value = diameterOverSheath.value || '';
    dto.datasData.sheath.diameter.unit = diameterOverSheath.unit ? (diameterOverSheath.multiplier ? `${diameterOverSheath.multiplier}|${diameterOverSheath.unit}` : diameterOverSheath.unit) : '';

    /** ================== insulation ================== */
    dto.datasData.insulation = dto.datasData.insulation || {};
    dto.datasData.insulation.insulation_operating = { mrid: entity.oldCableInfo.insulation_max_operating_temp || '' };
    const insulationMaxTemp = entity.temperature.find(t => t.mrid === entity.oldCableInfo.insulation_max_operating_temp) || {};
    dto.datasData.insulation.insulation_operating.value = insulationMaxTemp.value || '';
    dto.datasData.insulation.insulation_operating.unit = insulationMaxTemp.unit ? (insulationMaxTemp.multiplier ? `${insulationMaxTemp.multiplier}|${insulationMaxTemp.unit}` : insulationMaxTemp.unit) : '';

    dto.datasData.insulation.insulation_type = { value: entity.concentricNeutral.insulation_material || '' };
    dto.datasData.insulation.thickness = { mrid: entity.concentricNeutral.insulation_thickness || '' };
    const insulationThickness = entity.length.find(l => l.mrid === entity.concentricNeutral.insulation_thickness) || {};
    dto.datasData.insulation.thickness.value = insulationThickness.value || '';
    dto.datasData.insulation.thickness.unit = insulationThickness.unit ? (insulationThickness.multiplier ? `${insulationThickness.multiplier}|${insulationThickness.unit}` : insulationThickness.unit) : '';

    dto.datasData.insulation.diameter = { mrid: entity.concentricNeutral.diameter_over_insulation || '' };
    const diameterOverInsulation = entity.length.find(l => l.mrid === entity.concentricNeutral.diameter_over_insulation) || {};
    dto.datasData.insulation.diameter.value = diameterOverInsulation.value || '';
    dto.datasData.insulation.diameter.unit = diameterOverInsulation.unit ? (diameterOverInsulation.multiplier ? `${diameterOverInsulation.multiplier}|${diameterOverInsulation.unit}` : diameterOverInsulation.unit) : '';

    /** ================== insulation screen ================== */
    dto.datasData.insulation_screen = dto.datasData.insulation_screen || {};
    dto.datasData.insulation_screen.material = { value: entity.oldCableInfo.screen_material || '' };
    dto.datasData.insulation_screen.thickness = { mrid: entity.oldCableInfo.screen_thickness || '' };
    const screenThickness = entity.length.find(l => l.mrid === entity.oldCableInfo.screen_thickness) || {};
    dto.datasData.insulation_screen.thickness.value = screenThickness.value || '';
    dto.datasData.insulation_screen.thickness.unit = screenThickness.unit ? (screenThickness.multiplier ? `${screenThickness.multiplier}|${screenThickness.unit}` : screenThickness.unit) : '';

    dto.datasData.insulation_screen.diameter = { mrid: entity.concentricNeutral.diameter_over_screen || '' };
    const diameterOverScreen = entity.length.find(l => l.mrid === entity.concentricNeutral.diameter_over_screen) || {};
    dto.datasData.insulation_screen.diameter.value = diameterOverScreen.value || '';
    dto.datasData.insulation_screen.diameter.unit = diameterOverScreen.unit ? (diameterOverScreen.multiplier ? `${diameterOverScreen.multiplier}|${diameterOverScreen.unit}` : diameterOverScreen.unit) : '';

    /** ================== armour bedding ================== */
    dto.datasData.armour_bedding = dto.datasData.armour_bedding || {};
    dto.datasData.armour_bedding.material = { value: entity.oldCableInfo.armour_bedding_material || '' };
    dto.datasData.armour_bedding.thickness = { mrid: entity.oldCableInfo.armour_bedding_thickness || '' };
    const armourBeddingThickness = entity.length.find(l => l.mrid === entity.oldCableInfo.armour_bedding_thickness) || {};
    dto.datasData.armour_bedding.thickness.value = armourBeddingThickness.value || '';
    dto.datasData.armour_bedding.thickness.unit = armourBeddingThickness.unit ? (armourBeddingThickness.multiplier ? `${armourBeddingThickness.multiplier}|${armourBeddingThickness.unit}` : armourBeddingThickness.unit) : '';

    dto.datasData.armour_bedding.diameter = { mrid: entity.oldCableInfo.diameter_bedding_over_armour || '' };
    const diameterBeddingOverArmour = entity.length.find(l => l.mrid === entity.oldCableInfo.diameter_bedding_over_armour) || {};
    dto.datasData.armour_bedding.diameter.value = diameterBeddingOverArmour.value || '';
    dto.datasData.armour_bedding.diameter.unit = diameterBeddingOverArmour.unit ? (diameterBeddingOverArmour.multiplier ? `${diameterBeddingOverArmour.multiplier}|${diameterBeddingOverArmour.unit}` : diameterBeddingOverArmour.unit) : '';

    /** ================== sheath reinforcing ================== */
    dto.datasData.sheath_reinforcing = dto.datasData.sheath_reinforcing || {};
    dto.datasData.sheath_reinforcing.material = { value: entity.oldCableInfo.sheath_reinforcing_material || '' };
    dto.datasData.sheath_reinforcing.thickness = { mrid: entity.oldCableInfo.sheath_reinforcing_thickness || '' };
    const sheathReinforcingThickness = entity.length.find(l => l.mrid === entity.oldCableInfo.sheath_reinforcing_thickness) || {};
    dto.datasData.sheath_reinforcing.thickness.value = sheathReinforcingThickness.value || '';
    dto.datasData.sheath_reinforcing.thickness.unit = sheathReinforcingThickness.unit ? (sheathReinforcingThickness.multiplier ? `${sheathReinforcingThickness.multiplier}|${sheathReinforcingThickness.unit}` : sheathReinforcingThickness.unit) : '';

    dto.datasData.sheath_reinforcing.diameter = { mrid: entity.oldCableInfo.diameter_over_sheath_reinforcing || '' };
    const diameterOverSheathReinforcing = entity.length.find(l => l.mrid === entity.oldCableInfo.diameter_over_sheath_reinforcing) || {};
    dto.datasData.sheath_reinforcing.diameter.value = diameterOverSheathReinforcing.value || '';
    dto.datasData.sheath_reinforcing.diameter.unit = diameterOverSheathReinforcing.unit ? (diameterOverSheathReinforcing.multiplier ? `${diameterOverSheathReinforcing.multiplier}|${diameterOverSheathReinforcing.unit}` : diameterOverSheathReinforcing.unit) : '';

    dto.datasData.sheath_reinforcing.width = { mrid: entity.oldCableInfo.sheath_reinforcing_width || '' };
    const sheathReinforcingWidth = entity.length.find(l => l.mrid === entity.oldCableInfo.sheath_reinforcing_width) || {};
    dto.datasData.sheath_reinforcing.width.value = sheathReinforcingWidth.value || '';
    dto.datasData.sheath_reinforcing.width.unit = sheathReinforcingWidth.unit ? (sheathReinforcingWidth.multiplier ? `${sheathReinforcingWidth.multiplier}|${sheathReinforcingWidth.unit}` : sheathReinforcingWidth.unit) : '';

    dto.datasData.sheath_reinforcing.lengthOfLay = { mrid: entity.oldCableInfo.sheath_reinforcing_length_lay || '' };
    const sheathReinforcingLengthLay = entity.length.find(l => l.mrid === entity.oldCableInfo.sheath_reinforcing_length_lay) || {};
    dto.datasData.sheath_reinforcing.lengthOfLay.value = sheathReinforcingLengthLay.value || '';
    dto.datasData.sheath_reinforcing.lengthOfLay.unit = sheathReinforcingLengthLay.unit ? (sheathReinforcingLengthLay.multiplier ? `${sheathReinforcingLengthLay.multiplier}|${sheathReinforcingLengthLay.unit}` : sheathReinforcingLengthLay.unit) : '';

    dto.datasData.sheath_reinforcing.numOfTapes = { value: entity.oldCableInfo.sheath_reinforcing_no_tape || '' };

    /** ================== concentric neutral ================== */
    dto.datasData.concentric_neutral = dto.datasData.concentric_neutral || {};
    dto.datasData.concentric_neutral.material = { value: entity.oldCableInfo.concentric_material || '' };
    dto.datasData.concentric_neutral.construction = { value: entity.oldCableInfo.concentric_contruction || '' };
    dto.datasData.concentric_neutral.thickness = { mrid: entity.oldCableInfo.concentric_thickness || '' };
    const concentricThickness = entity.length.find(l => l.mrid === entity.oldCableInfo.concentric_thickness) || {};
    dto.datasData.concentric_neutral.thickness.value = concentricThickness.value || '';
    dto.datasData.concentric_neutral.thickness.unit = concentricThickness.unit ? (concentricThickness.multiplier ? `${concentricThickness.multiplier}|${concentricThickness.unit}` : concentricThickness.unit) : '';

    dto.datasData.concentric_neutral.diameter = { mrid: entity.concentricNeutral.diameter_over_neutral || '' };
    const concentricDiameter = entity.length.find(l => l.mrid === entity.concentricNeutral.diameter_over_neutral) || {};
    dto.datasData.concentric_neutral.diameter.value = concentricDiameter.value || '';
    dto.datasData.concentric_neutral.diameter.unit = concentricDiameter.unit ? (concentricDiameter.multiplier ? `${concentricDiameter.multiplier}|${concentricDiameter.unit}` : concentricDiameter.unit) : '';

    dto.datasData.concentric_neutral.lengthOfLay = { mrid: entity.oldCableInfo.concentric_length_lay || '' };
    const concentricLengthLay = entity.length.find(l => l.mrid === entity.oldCableInfo.concentric_length_lay) || {};
    dto.datasData.concentric_neutral.lengthOfLay.value = concentricLengthLay.value || '';
    dto.datasData.concentric_neutral.lengthOfLay.unit = concentricLengthLay.unit ? (concentricLengthLay.multiplier ? `${concentricLengthLay.multiplier}|${concentricLengthLay.unit}` : concentricLengthLay.unit) : '';

    dto.datasData.concentric_neutral.area = { mrid: entity.oldCableInfo.concentric_area || '' };
    const concentricArea = entity.area.find(a => a.mrid === entity.oldCableInfo.concentric_area) || {};
    dto.datasData.concentric_neutral.area.value = concentricArea.value || '';
    dto.datasData.concentric_neutral.area.unit = concentricArea.unit ? (concentricArea.multiplier ? `${concentricArea.multiplier}|${concentricArea.unit}` : concentricArea.unit) : '';

    dto.datasData.concentric_neutral.numOfWires = { value: entity.oldCableInfo.concentric_no_of_wires || '' };

    /** ================== armour ================== */
    dto.datasData.armour = dto.datasData.armour || {};
    dto.datasData.armour.material = { value: entity.oldCableInfo.armour_material || '' };
    dto.datasData.armour.thickness = { mrid: entity.oldCableInfo.armour_thickness || '' };
    const armourThickness = entity.length.find(l => l.mrid === entity.oldCableInfo.armour_thickness) || {};
    dto.datasData.armour.thickness.value = armourThickness.value || '';
    dto.datasData.armour.thickness.unit = armourThickness.unit ? (armourThickness.multiplier ? `${armourThickness.multiplier}|${armourThickness.unit}` : armourThickness.unit) : '';

    dto.datasData.armour.diameter = { mrid: entity.oldCableInfo.diameter_over_armour || '' };
    const diameterOverArmour = entity.length.find(l => l.mrid === entity.oldCableInfo.diameter_over_armour) || {};
    dto.datasData.armour.diameter.value = diameterOverArmour.value || '';
    dto.datasData.armour.diameter.unit = diameterOverArmour.unit ? (diameterOverArmour.multiplier ? `${diameterOverArmour.multiplier}|${diameterOverArmour.unit}` : diameterOverArmour.unit) : '';

    dto.datasData.armour.layerOfTapes = { value: entity.oldCableInfo.armour_layer_tape || '' };
    dto.datasData.armour.crossSectional = { mrid: entity.oldCableInfo.armour_cross_sectional_area_tap || '' };
    const armourCrossSectional = entity.area.find(a => a.mrid === entity.oldCableInfo.armour_cross_sectional_area_tap) || {};
    dto.datasData.armour.crossSectional.value = armourCrossSectional.value || '';
    dto.datasData.armour.crossSectional.unit = armourCrossSectional.unit ? (armourCrossSectional.multiplier ? `${armourCrossSectional.multiplier}|${armourCrossSectional.unit}` : armourCrossSectional.unit) : '';

    /** ================== jacket ================== */
    dto.datasData.oversheath = dto.datasData.oversheath || {};
    dto.datasData.oversheath.thickness = { mrid: entity.oldCableInfo.jacket_thickness || '' };
    const jacketThickness = entity.length.find(l => l.mrid === entity.oldCableInfo.jacket_thickness) || {};
    dto.datasData.oversheath.thickness.value = jacketThickness.value || '';
    dto.datasData.oversheath.thickness.unit = jacketThickness.unit ? (jacketThickness.multiplier ? `${jacketThickness.multiplier}|${jacketThickness.unit}` : jacketThickness.unit) : '';

    dto.datasData.oversheath.material = { value: entity.concentricNeutral.outer_jacket_kind || '' };
    dto.datasData.oversheath.diameter = { mrid: entity.concentricNeutral.diameter_over_jacket || '' };
    const diameterOverJacket = entity.length.find(l => l.mrid === entity.concentricNeutral.diameter_over_jacket) || {};
    dto.datasData.oversheath.diameter.value = diameterOverJacket.value || '';
    dto.datasData.oversheath.diameter.unit = diameterOverJacket.unit ? (diameterOverJacket.multiplier ? `${diameterOverJacket.multiplier}|${diameterOverJacket.unit}` : diameterOverJacket.unit) : '';

    /** ================== joint ================== */
    dto.datasData.jointsData = dto.datasData.jointsData || {};
    dto.datasData.jointsData.rated_u = { mrid: entity.joint.rated_u || '' };
    const jointRatedU = entity.voltage.find(v => v.mrid === entity.joint.rated_u) || {};
    dto.datasData.jointsData.rated_u.value = jointRatedU.value || '';
    dto.datasData.jointsData.rated_u.unit = jointRatedU.unit ? (jointRatedU.multiplier ? `${jointRatedU.multiplier}|${jointRatedU.unit}` : jointRatedU.unit) : '';

    dto.datasData.jointsData.rated_current = { mrid: entity.joint.rated_current || '' };
    const jointRatedCurrent = entity.currentFlow.find(c => c.mrid === entity.joint.rated_current) || {};
    dto.datasData.jointsData.rated_current.value = jointRatedCurrent.value || '';
    dto.datasData.jointsData.rated_current.unit = jointRatedCurrent.unit ? (jointRatedCurrent.multiplier ? `${jointRatedCurrent.multiplier}|${jointRatedCurrent.unit}` : jointRatedCurrent.unit) : '';

    dto.datasData.jointsData.category = { value: entity.joint.category || '' };
    dto.datasData.jointsData.construction = { value: entity.joint.construction || '' };
    dto.datasData.jointsData.service_condition = { value: entity.joint.service_condition || '' };

    /** ================== terminal ================== */
    dto.datasData.terminalsData = dto.datasData.terminalsData || {};
    dto.datasData.terminalsData.rated_u = { mrid: entity.terminal.rated_u || '' };
    const terminalRatedU = entity.voltage.find(v => v.mrid === entity.terminal.rated_u) || {};
    dto.datasData.terminalsData.rated_u.value = terminalRatedU.value || '';
    dto.datasData.terminalsData.rated_u.unit = terminalRatedU.unit ? (terminalRatedU.multiplier ? `${terminalRatedU.multiplier}|${terminalRatedU.unit}` : terminalRatedU.unit) : '';

    dto.datasData.terminalsData.bil = { mrid: entity.terminal.bil || '' };
    const terminalBil = entity.voltage.find(v => v.mrid === entity.terminal.bil) || {};
    dto.datasData.terminalsData.bil.value = terminalBil.value || '';
    dto.datasData.terminalsData.bil.unit = terminalBil.unit ? (terminalBil.multiplier ? `${terminalBil.multiplier}|${terminalBil.unit}` : terminalBil.unit) : '';

    dto.datasData.terminalsData.bsl = { mrid: entity.terminal.bsl || '' };
    const terminalBsl = entity.frequency.find(f => f.mrid === entity.terminal.bsl) || {};
    dto.datasData.terminalsData.bsl.value = terminalBsl.value || '';
    dto.datasData.terminalsData.bsl.unit = terminalBsl.unit ? (terminalBsl.multiplier ? `${terminalBsl.multiplier}|${terminalBsl.unit}` : terminalBsl.unit) : '';

    dto.datasData.terminalsData.type = { value: entity.terminal.type || '' };
    dto.datasData.terminalsData.connector_type = { value: entity.terminal.connector_type || '' };
    dto.datasData.terminalsData.service_condition = { value: entity.terminal.service_condition || '' };
    dto.datasData.terminalsData.class = { value: entity.terminal.class || '' };

    /** ================== sheath voltage limiter ================== */
    dto.datasData.sheathLimitsData = dto.datasData.sheathLimitsData || {};
    dto.datasData.sheathLimitsData.rated_voltage_ur = { mrid: entity.sheathVoltageLimiter.rated_voltage_ur || '' };
    const sheathRatedU = entity.voltage.find(v => v.mrid === entity.sheathVoltageLimiter.rated_voltage_ur) || {};
    dto.datasData.sheathLimitsData.rated_voltage_ur.value = sheathRatedU.value || '';
    dto.datasData.sheathLimitsData.rated_voltage_ur.unit = sheathRatedU.unit ? (sheathRatedU.multiplier ? `${sheathRatedU.multiplier}|${sheathRatedU.unit}` : sheathRatedU.unit) : '';

    dto.datasData.sheathLimitsData.max_continuous_operating_voltage = { mrid: entity.sheathVoltageLimiter.max_continuous_operating_voltage || '' };
    const sheathMaxU = entity.voltage.find(v => v.mrid === entity.sheathVoltageLimiter.max_continuous_operating_voltage) || {};
    dto.datasData.sheathLimitsData.max_continuous_operating_voltage.value = sheathMaxU.value || '';
    dto.datasData.sheathLimitsData.max_continuous_operating_voltage.unit = sheathMaxU.unit ? (sheathMaxU.multiplier ? `${sheathMaxU.multiplier}|${sheathMaxU.unit}` : sheathMaxU.unit) : '';

    dto.datasData.sheathLimitsData.nominal_discharge_current = { mrid: entity.sheathVoltageLimiter.nominal_discharge_current || '' };
    const sheathNominalCurrent = entity.frequency.find(f => f.mrid === entity.sheathVoltageLimiter.nominal_discharge_current) || {};
    dto.datasData.sheathLimitsData.nominal_discharge_current.value = sheathNominalCurrent.value || '';
    dto.datasData.sheathLimitsData.nominal_discharge_current.unit = sheathNominalCurrent.unit ? (sheathNominalCurrent.multiplier ? `${sheathNominalCurrent.multiplier}|${sheathNominalCurrent.unit}` : sheathNominalCurrent.unit) : '';

    dto.datasData.sheathLimitsData.high_current_impulse_withstand = { mrid: entity.sheathVoltageLimiter.high_current_impulse_withstand || '' };
    dto.datasData.sheathLimitsData.long_duration_current_impulse_withstand = { mrid: entity.sheathVoltageLimiter.long_duration_current_impulse_withstand || '' };
    dto.datasData.sheathLimitsData.short_circuit_withstand = { mrid: entity.sheathVoltageLimiter.short_circuit_withstand || '' };

    return dto;
}



