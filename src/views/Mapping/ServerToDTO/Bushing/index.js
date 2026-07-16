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

const normalizeUnit = (raw, defaultUnit) => {
    if (raw === 'PERCENT') return '%'
    return raw || defaultUnit
}

const unitLabel = (raw, defaultLabel) => normalizeUnit(raw, defaultLabel);

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

const reverseMap = (map) => Object.fromEntries(Object.entries(map).map(([key, value]) => [value, key]))

const ASSET_TYPE_TO_SERVER = reverseMap(ASSET_TYPE_MAP)
const INSUL_TYPE_TO_SERVER = reverseMap(INSUL_TYPE_MAP)

const textT = (val) => {
    if (val === null || val === undefined) return null
    const text = String(val).trim()
    return text ? text : null
}

const numT = (val) => {
    if (val === null || val === undefined || val === '') return null
    const value = Number(val)
    return Number.isFinite(value) ? value : null
}

const intT = (val) => {
    if (val === null || val === undefined || val === '') return null
    const value = parseInt(val, 10)
    return Number.isFinite(value) ? value : null
}

const idT = (val) => {
    const text = textT(val)
    return text && /^\d+$/.test(text) ? Number(text) : null
}

const joinUnit = (unit) => {
    const text = textT(unit)
    return text ? text.replace('|', '') : null
}

const toServerEnum = (value, knownMap = {}) => {
    const text = textT(value)
    if (!text) return null
    if (knownMap[text]) return knownMap[text]
    return text
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .replace(/[^A-Za-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .toUpperCase()
}

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
    dto.properties.manufacturer      = assetInfo.manufacturer || assetInfo.manufacturerName || '';
    dto.properties.manufacturer_type = assetInfo.manufacturerType || '';
    dto.properties.manufacturer_year = assetInfo.manufacturingYear ? String(assetInfo.manufacturingYear) : '';
    dto.properties.country_of_origin = assetInfo.country || assetInfo.countryName || '';
    dto.properties.apparatus_id      = assetInfo.apparatusId      || '';
    dto.properties.comment           = assetInfo.description      || '';

    dto.configuration.number_of_phase = assetInfo.numberOfPhase !== null && assetInfo.numberOfPhase !== undefined
        ? String(assetInfo.numberOfPhase)
        : '';
    dto.configuration.phase = assetInfo.phase || '';

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
        unit:  normalizeUnit(bushing.dfC1Unit, '%'),
    };
    dto.bushing.cap_c1 = {
        mrid: '', value: str(bushing.capC1),
        label: unitLabel(bushing.capC1Unit, 'pF'),
        unit:  splitUnit(bushing.capC1Unit, 'p|F'),
    };
    dto.bushing.df_c2 = {
        mrid: '', value: str(bushing.dfC2),
        label: unitLabel(bushing.dfC2Unit, '%'),
        unit:  normalizeUnit(bushing.dfC2Unit, '%'),
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

export const mapDtoToServer = (dto, ownerType) => {
    if (!dto) return null

    const p = dto.properties || {}
    const b = dto.bushing || {}
    const c = dto.configuration || {}

    return {
        assetInfo: {
            ownerId: idT(dto.psrId),
            ownerType: textT(ownerType),
            assetName: textT(p.apparatus_id) || textT(p.serial_no) || 'Bushing',
            serialNo: textT(p.serial_no),
            phase: textT(c.phase),
            numberOfPhase: intT(c.number_of_phase),
            manufacturer: textT(p.manufacturer),
            manufacturerId: null,
            manufacturerType: textT(p.manufacturer_type),
            manufacturingYear: intT(p.manufacturer_year),
            country: textT(p.country_of_origin),
            countryOfOriginId: null,
            apparatusId: textT(p.apparatus_id),
            description: textT(p.comment)
        },
        bushing: {
            id: idT(p.mrid),
            winding: null,
            assetType: toServerEnum(p.type, ASSET_TYPE_TO_SERVER),
            assetInfoId: idT(dto.assetInfoId),
            position: textT(c.phase),
            ratedFrequency: numT(b.rated_frequency?.value),
            ratedFrequencyUnit: joinUnit(b.rated_frequency?.unit) || 'Hz',
            insulLevelLLL: numT(b.insulation_level?.value),
            insulLevelUnit: joinUnit(b.insulation_level?.unit),
            voltageLGround: numT(b.voltage_l_ground?.value),
            voltageLGroundUnit: joinUnit(b.voltage_l_ground?.unit),
            maxSystemVoltage: numT(b.max_system_voltage?.value),
            maxSystemVoltageUnit: joinUnit(b.max_system_voltage?.unit),
            ratedCurrent: numT(b.rated_current?.value),
            ratedCurrentUnit: joinUnit(b.rated_current?.unit),
            dfC1: numT(b.df_c1?.value),
            dfC1Unit: joinUnit(b.df_c1?.unit),
            capC1: numT(b.cap_c1?.value),
            capC1Unit: joinUnit(b.cap_c1?.unit),
            dfC2: numT(b.df_c2?.value),
            dfC2Unit: joinUnit(b.df_c2?.unit),
            capC2: numT(b.cap_c2?.value),
            capC2Unit: joinUnit(b.cap_c2?.unit),
            insulType: toServerEnum(b.insulation_type, INSUL_TYPE_TO_SERVER)
        }
    }
}
