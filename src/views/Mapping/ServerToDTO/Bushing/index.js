import BushingAssetDto from "@/views/Dto/BushingAsset/index.js";

const str = (val) => (val !== null && val !== undefined) ? String(val) : '';

// "kV" → "k|V", "pF" → "p|F", giữ nguyên nếu không có multiplier hoặc đã có pipe
const splitUnit = (raw, defaultUnit) => {
    const u = raw || defaultUnit;
    if (!u) return defaultUnit;
    if (u.includes('|')) return u;
    const multipliers = ['k', 'M', 'G', 'm', 'µ', 'n', 'p'];
    for (const mult of multipliers) {
        if (u.length > 1 && u.startsWith(mult)) return mult + '|' + u.slice(mult.length);
    }
    return u;
};

const unitLabel = (raw, defaultLabel) => raw || defaultLabel;

const ASSET_TYPE_MAP = {
    'WITH_POTENTIAL_TAP': 'With potential tap',
    'WITH_TEST_TAP':      'With test tap',
    'WITHOUT_TAP':        'Without tap',
};

const INSUL_TYPE_MAP = {
    'COMPOUND':                 'compound',
    'OIL_IMPREGNATED_PAPER':    'oilImpregnatedPaper',
    'OTHER':                    'other',
    'RESIN_BONDED_PAPER':       'resinBondedPaper',
    'RESIN_IMPREGNATED_PAPER':  'resinImpregnatedPaper',
    'SOLID_PORCELAIN':          'solidPorcelain',
    'PORCELAIN_DRY_TYPE':       'porcelainDryType',
    'COMPOSITE_DRY_TYPE':       'compositeDryType',
};

export const mapServerToDto = (serverData) => {
    const dto = new BushingAssetDto();
    if (!serverData) return dto;

    const assetInfo = serverData.assetInfo || {};
    const bushing   = serverData.bushing   || {};

    // 1. Properties
    dto.properties.mrid              = bushing.id ? String(bushing.id) : '';
    dto.properties.serial_no         = assetInfo.serialNo         || '';
    dto.properties.kind              = 'Bushing';
    dto.properties.type              = ASSET_TYPE_MAP[bushing.assetType] || bushing.assetType || '';
    dto.properties.manufacturer      = assetInfo.manufacturerName || '';
    dto.properties.manufacturer_type = assetInfo.manufacturerType || '';
    dto.properties.manufacturer_year = assetInfo.manufacturingYear ? String(assetInfo.manufacturingYear) : '';
    dto.properties.country_of_origin = assetInfo.countryName      || '';
    dto.properties.apparatus_id      = assetInfo.apparatusId      || '';
    dto.properties.comment           = assetInfo.description      || '';

    // 2. Bushing ratings — label hiển thị + unit format pipe
    dto.bushing.rated_frequency = {
        mrid: '', value: str(bushing.ratedFrequency),
        label: unitLabel(bushing.ratedFrequencyUnit, 'Hz'),
        unit:  bushing.ratedFrequencyUnit || 'Hz',
    };
    dto.bushing.insulation_level = {
        mrid: '', value: str(bushing.insulLevelLLL),
        label: unitLabel(bushing.insulLevelUnit, 'kV'),
        unit:  splitUnit(bushing.insulLevelUnit, 'k|V'),
    };
    dto.bushing.voltage_l_ground = {
        mrid: '', value: str(bushing.voltageLGround),
        label: unitLabel(bushing.voltageLGroundUnit, 'kV'),
        unit:  splitUnit(bushing.voltageLGroundUnit, 'k|V'),
    };
    dto.bushing.max_system_voltage = {
        mrid: '', value: str(bushing.maxSystemVoltage),
        label: unitLabel(bushing.maxSystemVoltageUnit, 'kV'),
        unit:  splitUnit(bushing.maxSystemVoltageUnit, 'k|V'),
    };
    dto.bushing.rated_current = {
        mrid: '', value: str(bushing.ratedCurrent),
        label: unitLabel(bushing.ratedCurrentUnit, 'A'),
        unit:  bushing.ratedCurrentUnit || 'A',
    };
    dto.bushing.df_c1 = {
        mrid: '', value: str(bushing.dfC1),
        label: unitLabel(bushing.dfC1Unit, '%'),
        unit:  bushing.dfC1Unit || '%',
    };
    dto.bushing.cap_c1 = {
        mrid: '', value: str(bushing.capC1),
        label: unitLabel(bushing.capC1Unit, 'pF'),
        unit:  splitUnit(bushing.capC1Unit, 'p|F'),
    };
    dto.bushing.df_c2 = {
        mrid: '', value: str(bushing.dfC2),
        label: unitLabel(bushing.dfC2Unit, '%'),
        unit:  bushing.dfC2Unit || '%',
    };
    dto.bushing.cap_c2 = {
        mrid: '', value: str(bushing.capC2),
        label: unitLabel(bushing.capC2Unit, 'pF'),
        unit:  splitUnit(bushing.capC2Unit, 'p|F'),
    };
    dto.bushing.insulation_type = INSUL_TYPE_MAP[bushing.insulType] || bushing.insulType || '';

    // 3. IDs
    dto.assetInfoId = assetInfo.id ? String(assetInfo.id) : '';
    dto.assetPsrId  = bushing.id   ? String(bushing.id)   : '';
    dto.psrId       = assetInfo.ownerId ? String(assetInfo.ownerId) : null;

    return dto;
};