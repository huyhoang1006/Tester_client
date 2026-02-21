import PowerCableDTO from "@/views/Dto/PowerCable";

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
        dto.datasData.sheathLimitsData.high_current_impulse_withstand = mapServerUnit(svl.highCurrentImpulseWithstand); // 40 kA
        dto.datasData.sheathLimitsData.long_duration_current_impulse_withstand = mapServerUnit(svl.longDurationCurrentImpulseWithstand); // 200 A
        dto.datasData.sheathLimitsData.short_circuit_withstand = mapServerUnit(svl.shortCircuitWithstand); // 5 kA
    }
    return dto;
};

// Helper: Chuyển đổi an toàn sang số
const safeNumber = (val) => {
    if (val === '' || val === null || val === undefined) return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
};

const safeInt = (val, defaultVal = 0) => {
    if (val === '' || val === null || val === undefined) return defaultVal;
    const num = parseInt(val, 10);
    return isNaN(num) ? defaultVal : num;
};

const mapDtoUnitToServer = (dtoUnit) => {
    if (!dtoUnit) return null;
    const { mrid = '', value = '', unit = '' } = dtoUnit;
    const numValue = safeNumber(value);

    // Mặc định nếu không có unit
    if (!unit) return { mRID: mrid, value: numValue };

    const [multiplier, realUnit] = unit.includes('|') ? unit.split('|') : ['none', unit];

    return {
        mRID: mrid,
        value: numValue,
        unit: realUnit,
        multiplier: multiplier || 'none'
    };
};

export const mapDtoToServer = (dto) => {
    if (!dto) return {};

    const server = {};

    // --- ROOT LEVEL ---
    server.mRID = dto.properties.mrid;
    server.name = dto.properties.apparatus_id || dto.properties.name || "Unnamed Cable";
    server.aliasName = dto.properties.name || "";
    server.description = dto.properties.comment;

    // --- ASSET DATA ---
    server.assetData = {
        serialNumber: dto.properties.serial_no,
        lotNumber: dto.properties.manufacturer_year,
        countryOfOrigin: dto.properties.country_of_origin,
        type: "UndergroundCable",
        kind: "Power",
        critical: false,
        inUseState: true,
        initialCondition: "New",

        // Product Asset Model
        productAssetModel: {
            modelNumber: dto.properties.manufacturer_type,
            manufacturer: {
                name: dto.properties.manufacturer
            }
        },

        // Status (Default value để tránh null)
        status: {
            value: "in_service",
            dateTime: new Date().toISOString()
        },

        // Initial Loss Of Life (Default)
        initialLossOfLife: {
            value: 0,
            unit: "%",
            multiplier: "none"
        }
    };

    // --- CABLE INFO ---
    const pCount = safeInt(dto.configsData.phases.value, 3); // Mặc định 3 pha như mẫu
    let cCount = 1;
    if (dto.configsData.cores.value === 'Multiple') cCount = 3;
    else if (dto.configsData.cores.value !== 'Single') cCount = safeInt(dto.configsData.cores.value, 1);

    server.cableInfo = {
        name: (server.name || "") + " Info",
        __type: "OldCableInfo", // QUAN TRỌNG: Giống mẫu Postman
        phaseCount: pCount,
        coreCount: cCount,

        // Ratings
        ratedU: mapDtoUnitToServer(dto.ratingsData.rated_voltage),
        maxU: mapDtoUnitToServer(dto.ratingsData.max_voltage),
        ratedFrequency: mapDtoUnitToServer(dto.ratingsData.rated_frequency),
        shortCircuitCurrent: mapDtoUnitToServer(dto.ratingsData.shortcircuit),
        ratedDurationShortCircuit: mapDtoUnitToServer(dto.ratingsData.rated_duration),

        // Dimensions & Specs
        length: mapDtoUnitToServer(dto.othersData.cable_length),
        conductorSize: mapDtoUnitToServer(dto.datasData.conductor.conductor_size),
        nominalConductorDiameter: mapDtoUnitToServer(dto.datasData.conductor.conductor_diameter),

        // Layers
        conductorShieldThickness: mapDtoUnitToServer(dto.datasData.conductor_shield.thickness),
        diameterOverShield: mapDtoUnitToServer(dto.datasData.sheath.diameter),
        sheathThickness: mapDtoUnitToServer(dto.datasData.sheath.thickness),

        // Insulation
        insulationMaxOperatingTemp: mapDtoUnitToServer(dto.datasData.insulation.insulation_operating),
        insulationThickness: mapDtoUnitToServer(dto.datasData.insulation.thickness),
        diameterOverInsulation: mapDtoUnitToServer(dto.datasData.insulation.diameter),

        // Screen & Armour
        screenThickness: mapDtoUnitToServer(dto.datasData.insulation_screen.thickness),
        diameterOverScreen: mapDtoUnitToServer(dto.datasData.insulation_screen.diameter),
        armourThickness: mapDtoUnitToServer(dto.datasData.armour.thickness),
        diameterOverArmour: mapDtoUnitToServer(dto.datasData.armour.diameter),
        armourCrossSectionalAreaTap: mapDtoUnitToServer(dto.datasData.armour.crossSectional),

        // Jacket (Oversheath)
        jacketThickness: mapDtoUnitToServer(dto.datasData.oversheath.thickness),
        diameterOverJacket: mapDtoUnitToServer(dto.datasData.oversheath.diameter),

        // String Fields
        installationMethod: dto.othersData.insulation_method.value,
        bondingType: dto.othersData.bonding_type.value,
        installLocation: dto.othersData.install_location.value,
        conductorClass: dto.datasData.conductor.conductor_class.value,
        conductorType: dto.datasData.conductor.conductor_type.value,
        sheathType: dto.datasData.sheath.sheath_type.value,
        insulationMaterial: dto.datasData.insulation.insulation_type.value,
        outerJacketKind: dto.datasData.oversheath.material.value,
        armourMaterial: dto.datasData.armour.material.value
    };

    // --- CONCENTRIC NEUTRAL ---
    if (dto.datasData.concentric_neutral) {
        server.concentricNeutral = {
            neutralStrandCount: safeInt(dto.datasData.concentric_neutral.numOfWires.value),
            diameterOverNeutral: mapDtoUnitToServer(dto.datasData.concentric_neutral.diameter),
            // Các trường khác map nếu có trong DTO
        };
    }

    // --- ACCESSORIES ---
    server.accessories = {};

    // Terminal
    if (dto.datasData.terminalsData.mrid) {
        server.accessories.terminal = {
            mRID: dto.datasData.terminalsData.mrid,
            name: "Terminal " + (server.name || ""),
            ratedU: mapDtoUnitToServer(dto.datasData.terminalsData.rated_u),
            bil: mapDtoUnitToServer(dto.datasData.terminalsData.bil),
            bsl: mapDtoUnitToServer(dto.datasData.terminalsData.bsl),
            type: dto.datasData.terminalsData.type.value,
            connectorType: dto.datasData.terminalsData.connector_type.value,
            serviceCondition: dto.datasData.terminalsData.service_condition.value,
            class: dto.datasData.terminalsData.class.value
        };
    }

    // Joint
    if (dto.datasData.jointsData.mrid) {
        server.accessories.joint = {
            mRID: dto.datasData.jointsData.mrid,
            name: "Joint " + (server.name || ""),
            ratedU: mapDtoUnitToServer(dto.datasData.jointsData.rated_u),
            ratedCurrent: mapDtoUnitToServer(dto.datasData.jointsData.rated_current),
            category: dto.datasData.jointsData.category.value,
            construction: dto.datasData.jointsData.construction.value,
            serviceCondition: dto.datasData.jointsData.service_condition.value
        };
    }

    // SVL
    if (dto.datasData.sheathLimitsData.mrid) {
        server.accessories.sheathVoltageLimiter = {
            mRID: dto.datasData.sheathLimitsData.mrid,
            name: "SVL " + (server.name || ""),
            ratedVoltageUr: mapDtoUnitToServer(dto.datasData.sheathLimitsData.rated_voltage_ur),
            maxContinuousOperatingVoltage: mapDtoUnitToServer(dto.datasData.sheathLimitsData.max_continuous_operating_voltage),
            nominalDischargeCurrent: mapDtoUnitToServer(dto.datasData.sheathLimitsData.nominal_discharge_current),
            highCurrentImpulseWithstand: mapDtoUnitToServer(dto.datasData.sheathLimitsData.high_current_impulse_withstand),
            longDurationCurrentImpulseWithstand: mapDtoUnitToServer(dto.datasData.sheathLimitsData.long_duration_current_impulse_withstand),
            shortCircuitWithstand: mapDtoUnitToServer(dto.datasData.sheathLimitsData.short_circuit_withstand)
        };
    }

    // --- ATTACHMENTS ---
    // Giả sử DTO lưu attachment dưới dạng string JSON trong path
    if (dto.attachment && dto.attachment.path && dto.attachment.path !== '[]') {
        try {
            // Nếu là mảng JSON string
            const parsed = JSON.parse(dto.attachment.path);
            if (Array.isArray(parsed)) {
                server.attachments = parsed.map(att => ({
                    id: att.id || att.mrid,
                    name: att.name,
                    path: att.path,
                    type: att.type,
                    idForeign: server.mRID
                }));
            }
        } catch (e) {
            server.attachments = [];
        }
    }

    return server;
};