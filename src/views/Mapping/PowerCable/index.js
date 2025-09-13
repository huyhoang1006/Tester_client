import PowerCableEntity from "@/views/Entity/PowerCable";
import Temperature from "@/views/Cim/Temperature";
import Voltage from "@/views/Cim/Voltage";
import Frequency from "@/views/Cim/Frequency";
import Seconds from "@/views/Cim/Seconds";
import Length from "@/views/Cim/Length";
import Area from "@/views/Cim/Area";
import PowerCableDTO from "@/views/Dto/PowerCable";

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
    entity.asset.manufacturer_type = dto.properties.manufacturer_type || null;
    entity.asset.country_of_origin = dto.properties.country_of_origin || null;
    entity.asset.name = dto.properties.apparatus_id || null;
    entity.asset.description = dto.properties.comment || null;
    entity.productAssetModel.mrid = dto.productAssetModelId || null;
    entity.asset.location = dto.locationId || null;
    entity.asset.product_asset_model = dto.productAssetModelId || null;

    /** ================== attachment ================== */
    entity.attachment.mrid = dto.attachmentId || null;
    entity.attachment = dto.attachment || null;

    // lifecycle date
    dto.lifecycleDateId = entity.asset.lifecycle_date || '';
    dto.properties.manufacturer_year = entity.lifecycleDate.manufactured_date || '';

    //assetPsr
    dto.assetPsrId = entity.assetPsr.mrid || '';
    dto.psrId = entity.assetPsr.psr_id || '';
    dto.assetInfoId = entity.assetPsr.asset_id || '';

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
    const newShortCircuitCurrent = new Temperature();
    mappingUnit(newShortCircuitCurrent, dto.ratingsData.shortcircuit);
    entity.temperature.push(newShortCircuitCurrent);

    entity.oldCableInfo.rated_duration_short_circuit = dto.ratingsData.rated_duration.mrid || null;//rated duration of short circuit
    const newRatedDurationShortCircuit = new Seconds();
    mappingUnit(newRatedDurationShortCircuit, dto.ratingsData.rated_duration);
    entity.frequency.push(newRatedDurationShortCircuit);

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

    return entity;
}

export function mapEntityToDto(entity) {
    const dto = new PowerCableDTO();
    //properties
    dto.properties.mrid = entity.surgeArrester.mrid || '';
    dto.properties.kind = entity.surgeArrester.kind || '';
    dto.properties.type = entity.surgeArrester.type || '';
    dto.properties.serial_no = entity.surgeArrester.serial_number || '';
    dto.oldSurgeArresterInfoId = entity.surgeArrester.asset_info || '';
    dto.properties.manufacturer = entity.productAssetModel.manufacturer || '';
    dto.productAssetModelId = entity.productAssetModel.mrid || '';
    dto.properties.manufacturer_type = entity.surgeArrester.manufacturer_type || '';
    dto.properties.country_of_origin = entity.surgeArrester.country_of_origin || '';
    dto.properties.apparatus_id = entity.surgeArrester.name || '';
    dto.properties.comment = entity.surgeArrester.description || '';
    dto.locationId = entity.surgeArrester.location || '';
    dto.productAssetModelId = entity.surgeArrester.product_asset_model || '';


}


