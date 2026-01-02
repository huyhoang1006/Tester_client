import PowerCableDTO from "@/views/Dto/PowerCable";

// Helper để chuyển đổi đơn vị từ Server sang định dạng UI (ví dụ: k và V thành k|V)
const mapServerUnit = (serverObj) => {
    if (!serverObj) return { mrid: '', value: '', unit: '' };
    const multiplier = (serverObj.multiplier === 'none' || !serverObj.multiplier) ? '' : serverObj.multiplier;
    return {
        mrid: serverObj.mRID || serverObj.mrid || '',
        value: serverObj.value !== undefined ? serverObj.value : '',
        unit: multiplier ? `${multiplier}|${serverObj.unit}` : (serverObj.unit || '')
    };
};

export const mapServerToDto = (serverData) => {
    const dto = new PowerCableDTO();
    if (!serverData) return dto;

    const info = serverData.cableInfo || {};
    const asset = serverData.assetData || {};
    const model = asset.productAssetModel || {};
    const acc = serverData.accessories || {};
    const neutral = serverData.concentricNeutral || {};

    // 1. Map Properties
    dto.properties.mrid = serverData.mRID || '';
    dto.properties.serial_no = asset.serialNumber || '';
    dto.properties.apparatus_id = serverData.name || '';
    dto.properties.kind = 'Power cable';
    dto.properties.manufacturer = model.manufacturer?.name || '';
    dto.properties.manufacturer_type = model.modelNumber || '';
    dto.properties.manufacturer_year = asset.lotNumber || '';
    dto.properties.country_of_origin = asset.countryOfOrigin || '';
    dto.properties.comment = serverData.description || '';

    // 2. Map Configs
    dto.configsData.phases.value = info.phaseCount || 1;
    dto.configsData.cores.value = info.coreCount === 1 ? 'Single' : 'Multiple';

    // 3. Map Ratings
    dto.ratingsData.rated_voltage = mapServerUnit(info.ratedU);
    dto.ratingsData.max_voltage = mapServerUnit(info.maxU);
    dto.ratingsData.rated_frequency = mapServerUnit(info.ratedFrequency);
    dto.ratingsData.shortcircuit = mapServerUnit(info.shortCircuitCurrent);
    dto.ratingsData.rated_duration = mapServerUnit(info.ratedDurationShortCircuit);

    // 4. Map Others
    dto.othersData.insulation_method.value = info.installationMethod || '';
    dto.othersData.bonding_type.value = info.bondingType || '';
    dto.othersData.install_location.value = info.installLocation || '';
    dto.othersData.cable_length = mapServerUnit(info.length);

    // 5. Map Datas - Conductor, Insulation, Sheath, Armour
    dto.datasData.conductor.conductor_size = mapServerUnit(info.conductorSize);
    dto.datasData.conductor.conductor_class.value = info.conductorClass || '';
    dto.datasData.conductor.conductor_material = info.conductorMaterial || '';
    dto.datasData.conductor.conductor_type.value = info.conductorType || '';
    dto.datasData.conductor.conductor_diameter = mapServerUnit(info.nominalConductorDiameter);

    dto.datasData.insulation.insulation_type.value = info.insulationMaterial || '';
    dto.datasData.insulation.thickness = mapServerUnit(info.insulationThickness);
    dto.datasData.insulation.diameter = mapServerUnit(info.diameterOverInsulation);
    dto.datasData.insulation.insulation_operating = mapServerUnit(info.insulationMaxOperatingTemp);

    dto.datasData.sheath.thickness = mapServerUnit(info.sheathThickness);
    dto.datasData.sheath.diameter = mapServerUnit(info.diameterOverShield);
    dto.datasData.sheath.construction.value = info.sheathConstruction || '';
    dto.datasData.sheath.multicore.value = info.sheathMulticore || '';
    dto.datasData.sheath.sheath_type.value = info.sheathType || '';

    dto.datasData.armour.material.value = info.armourMaterial || '';
    dto.datasData.armour.thickness = mapServerUnit(info.armourThickness);
    dto.datasData.armour.diameter = mapServerUnit(info.diameterOverArmour);
    dto.datasData.armour.layerOfTapes.value = info.armourLayerTape || '';
    dto.datasData.armour.crossSectional = mapServerUnit(info.armourCrossSectionalAreaTap);

    dto.datasData.concentric_neutral.construction.value = info.concentricConstruction || '';
    dto.datasData.concentric_neutral.area = mapServerUnit(info.concentricArea);
    dto.datasData.concentric_neutral.lengthOfLay = mapServerUnit(info.concentricLengthLay);
    dto.datasData.concentric_neutral.material = mapServerUnit(info.concentricMaterial);
    dto.datasData.concentric_neutral.numOfWires.value = info.concentricNoOfWires || '';
    dto.datasData.concentric_neutral.thickness = mapServerUnit(info.concentricThickness);

    dto.datasData.conductor_shield.thickness = mapServerUnit(info.conductorShieldThickness);
    dto.datasData.conductor_shield.diameter = mapServerUnit(info.conductorShieldThickness);

    dto.datasData.insulation_screen.diameter = mapServerUnit(info.diameterOverScreen);
    dto.datasData.insulation_screen.thickness = mapServerUnit(info.screenThickness);
    dto.datasData.insulation_screen.material.value = info.screenMaterial || '';

    dto.datasData.sheath_reinforcing.material.value = info.sheathReinforcingMaterial || '';
    dto.datasData.sheath_reinforcing.thickness = mapServerUnit(info.sheathReinforcingThickness);
    dto.datasData.sheath_reinforcing.diameter = mapServerUnit(info.diameterOverSheathReinforcing);
    dto.datasData.sheath_reinforcing.width = mapServerUnit(info.sheathReinforcingWidth);
    dto.datasData.sheath_reinforcing.lengthOfLay = mapServerUnit(info.sheathReinforcingLengthLay);
    dto.datasData.sheath_reinforcing.numOfTapes.value = info.sheathReinforcingNoTape || '';

    dto.datasData.armour_bedding.material.value = info.armourBeddingMaterial || '';
    dto.datasData.armour_bedding.thickness = mapServerUnit(info.armourBeddingThickness);
    dto.datasData.armour_bedding.diameter = mapServerUnit(info.diameterBeddingOverAmour);

    dto.datasData.oversheath.material.value = info.outerJacketKind || '';
    dto.datasData.oversheath.diameter = mapServerUnit(info.diameterOverJacket);
    dto.datasData.oversheath.thickness = mapServerUnit(info.jacketThickness);

    // 6. Map Concentric Neutral
    if (neutral) {
        dto.datasData.concentric_neutral.mrid = neutral.mRID || '';
        dto.datasData.concentric_neutral.diameter = mapServerUnit(neutral.diameterOverNeutral);
    }

    // 7. Map Accessories - Terminal (Đầu cáp)
    if (acc.terminal) {
        const term = acc.terminal;
        dto.datasData.terminalsData.mrid = term.mRID || '';
        dto.datasData.terminalsData.rated_u = mapServerUnit(term.ratedU);
        dto.datasData.terminalsData.bil = mapServerUnit(term.bil);
        dto.datasData.terminalsData.bsl = mapServerUnit(term.bsl);
        dto.datasData.terminalsData.type.value = term.type || '';

        // CÁC TRƯỜNG BẠN ĐANG THIẾU:
        dto.datasData.terminalsData.connector_type.value = term.connectorType || ''; // Lug
        dto.datasData.terminalsData.service_condition.value = term.serviceCondition || ''; // Polluted
        dto.datasData.terminalsData.class.value = term.class || '';
    }

    // 8. Map Accessories - Joint (Hộp nối)
    if (acc.joint) {
        const joint = acc.joint;
        dto.datasData.jointsData.mrid = joint.mRID || '';
        dto.datasData.jointsData.rated_u = mapServerUnit(joint.ratedU);
        dto.datasData.jointsData.rated_current = mapServerUnit(joint.ratedCurrent);
        dto.datasData.jointsData.category.value = joint.category || '';
        dto.datasData.jointsData.construction.value = joint.construction || '';
        dto.datasData.jointsData.service_condition.value = joint.serviceCondition || '';
    }

    // 9. Map Accessories - Sheath Voltage Limiter (SVL - Chống sét van)
    if (acc.sheathVoltageLimiter) {
        const svl = acc.sheathVoltageLimiter;
        dto.datasData.sheathLimitsData.mrid = svl.mRID || '';
        dto.datasData.sheathLimitsData.rated_voltage_ur = mapServerUnit(svl.ratedVoltageUr);
        dto.datasData.sheathLimitsData.max_continuous_operating_voltage = mapServerUnit(svl.maxContinuousOperatingVoltage);
        dto.datasData.sheathLimitsData.nominal_discharge_current = mapServerUnit(svl.nominalDischargeCurrent);

        // CÁC TRƯỜNG SVL BẠN ĐANG THIẾU:
        dto.datasData.sheathLimitsData.high_current_impulse_withstand = mapServerUnit(svl.highCurrentImpulseWithstand); // 40 kA
        dto.datasData.sheathLimitsData.long_duration_current_impulse_withstand = mapServerUnit(svl.longDurationCurrentImpulseWithstand); // 200 A
        dto.datasData.sheathLimitsData.short_circuit_withstand = mapServerUnit(svl.shortCircuitWithstand); // 5 kA
    }

    return dto;
};