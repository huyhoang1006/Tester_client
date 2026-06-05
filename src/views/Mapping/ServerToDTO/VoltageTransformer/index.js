import VoltageTransformerDto from "@/views/Dto/VoltageTransformer";
import uuid from "@/utils/uuid";

// ─── Lookup maps ─────────────────────────────────────────────────────────────

const ASSET_TYPE_MAP = {
    'IVT':      'IVT',
    'CVT_CCVT': 'CVTCCTV',
}

const MULTIPLIER_MAP = {
    'ONE_TO_SQRT3': '3sqrt',
    'ONE_TO_3':     '3',
    'ONE_TO_ONE':   '1',
    'ONE_TO_1':     '1',
}

// ─── Reverse maps (client → server) for push ────────────────────────────────

const ASSET_TYPE_TO_SERVER = {
    'CVTCCTV': 'CVT_CCVT',
    'IVT':     'IVT',
}

const MULTIPLIER_TO_SERVER = {
    '3sqrt': 'ONE_TO_SQRT3',
    '3':     'ONE_TO_3',
    '1':     'ONE_TO_ONE',
}

const STANDARD_TO_SERVER = {
    'IEC60044':  'IEC_60044',
    'IEC61869':  'IEC_61869',
    'IEEEC5713': 'IEEE_C57_13',
    'ANSIC931':  'ANSI_C93_1',
}

// ─── Mapper ──────────────────────────────────────────────────────────────────

export const mapServerToDto = (serverData) => {
    const dto = new VoltageTransformerDto();
    if (!serverData) return dto;

    const info       = serverData.assetInfoResponseDTO || {};
    const core       = serverData.voltageTransformerCoreResponseDTO || {};
    const configList = serverData.voltageTransformerConfigResponseDTOList || [];

    // 1. IDs - Đảm bảo mrid của Core và các ID thực thể phụ không bao giờ null
    // Lỗi SQLITE_CONSTRAINT thường do các trường này bị null khi insert
    dto.mrid            = core.mRID || core.mrid || info.id || uuid.newUuid(); 
    dto.assetInfoId     = info.id ? String(info.id) : uuid.newUuid();
    dto.psrId           = info.ownerId ? String(info.ownerId) : null;

    // Bắt buộc sinh UUID cho các thực thể phụ nếu server không trả về 
    // để tránh lỗi NOT NULL constraint trên bảng identified_object
    dto.productAssetModelId = uuid.newUuid();
    dto.lifecycleDateId     = uuid.newUuid();
    dto.assetPsrId          = uuid.newUuid();

    // 2. Properties
    dto.properties.mrid              = dto.mrid;
    dto.properties.asset_type        = ASSET_TYPE_MAP[core.assetType] || core.assetType || '';
    dto.properties.type              = ASSET_TYPE_MAP[core.assetType] || core.assetType || '';
    dto.properties.kind              = 'Voltage transformer';
    dto.properties.serial_no         = info.serialNo         || '';
    dto.properties.manufacturer      = info.manufacturerName || '';
    dto.properties.country_of_origin = info.countryName      || '';
    dto.properties.apparatus_id      = info.apparatusId      || '';
    dto.properties.comment           = info.description      || '';
    dto.properties.manufacturing_year = info.manufacturingYear
        ? String(info.manufacturingYear)
        : '';

    // 3. Ratings
    dto.ratings.standard = (core.standard || '').replace(/_/g, '');

    // Rated frequency
    const freqValue = core.ratedFrequency !== null && core.ratedFrequency !== undefined
        ? String(core.ratedFrequency)
        : '';

    if (['50', '60', '16.7'].includes(freqValue)) {
        dto.ratings.rated_frequency = {
            mrid:  uuid.newUuid(), // Sinh mrid cho object giá trị
            value: freqValue,
            unit:  core.ratedFrequencyUnit || 'Hz',
        }
    } else if (freqValue) {
        dto.ratings.rated_frequency = {
            mrid:         uuid.newUuid(),
            value:        'Custom',
            unit:         core.ratedFrequencyUnit || 'Hz',
        }
        dto.ratings.rated_frequency_custom = freqValue;
    }

    // UPR & Rated Voltage
    // FIX: server trả uprValue/uprUnit (không phải rvValue/rvUnit)
    // uprUnit format từ server: "k_V" → cần convert sang "k|V"
    dto.ratings.upr = MULTIPLIER_MAP[core.uprMultiplier] || core.uprMultiplier || '';

    const rawUprUnit = core.uprUnit || 'k_V';
    const rvUnitStr  = rawUprUnit.replace('_', '|');   // "k_V" → "k|V"
    dto.ratings.rated_voltage = {
        mrid:  uuid.newUuid(),
        value: core.uprValue !== null && core.uprValue !== undefined ? String(core.uprValue) : '',
        unit:  rvUnitStr,
    }

    // Capacitance C1, C2
    const cUnitStr = core.cunit || 'p|F';
    dto.ratings.c1 = {
        mrid:  uuid.newUuid(),
        value: core.c1Value !== null ? String(core.c1Value) : '',
        unit:  cUnitStr,
    }
    dto.ratings.c2 = {
        mrid:  uuid.newUuid(),
        value: core.c2Value !== null ? String(core.c2Value) : '',
        unit:  cUnitStr,
    }

    // 4. VT Configuration
    dto.vt_Configuration.windings = core.windings || '';
    dto.vt_Configuration.dataVT   = configList.map(config => {
        const usrMultUI = MULTIPLIER_MAP[config.usrMultiplier] || '';
        const burdenMultUI = MULTIPLIER_MAP[config.ratedBurdenMultiplier] || '';

        return {
            mrid:               config.id ? String(config.id) : uuid.newUuid(),
            name:               config.name || '',
            usr_formula:        MULTIPLIER_MAP[config.usrFormula] || config.usrFormula || '',
            rated_power_factor: config.cos !== null && config.cos !== undefined ? Number(config.cos) : '',
            usr_rated_voltage: {
                mrid:       uuid.newUuid(),
                value:      config.usrValue !== null ? String(config.usrValue) : '',
                unit:       usrMultUI ? `${usrMultUI}|${config.usrUnit || 'V'}` : (config.usrUnit || 'V'),
                multiplier: usrMultUI,
            },
            rated_burden: {
                mrid:       uuid.newUuid(),
                value:      config.ratedBurden !== null ? String(config.ratedBurden) : '',
                unit:       burdenMultUI ? `${burdenMultUI}|${config.ratedBurdenUnit || 'VA'}` : (config.ratedBurdenUnit || 'VA'),
                multiplier: burdenMultUI,
            },
        }
    })

    return dto;
};

// ─── DTO → Server JSON (push to server) ──────────────────────────────────────

export const mapDtoToServer = (dto) => {
    console.log('Mapping DTO to Server format:', dto)
    if (!dto) return null

    return {
        VoltageTransformer: {
            mrid: dto.properties?.mrid || null,

            properties: {
                mrid:              dto.properties?.mrid              || null,
                type:              ASSET_TYPE_TO_SERVER[dto.properties?.asset_type] || dto.properties?.asset_type || null,
                kind:              dto.properties?.kind              || null,
                serial_no:         dto.properties?.serial_no         || null,
                manufacturer:      dto.properties?.manufacturer      || null,
                manufacturer_type: dto.properties?.manufacturer_type || null,
                manufacturer_year: dto.properties?.manufacturing_year
                    || dto.properties?.manufacturer_year
                    || null,
                country_of_origin: dto.properties?.country_of_origin || null,
                apparatus_id:      dto.properties?.apparatus_id      || null,
                comment:           dto.properties?.comment           || null,
            },

            ratings: {
                // DTO standard là string "IEC60044" → map vào value
                standard: {
                    mrid:  null,
                    value: (() => {
                        const raw = typeof dto.ratings?.standard === 'string'
                            ? dto.ratings.standard
                            : (dto.ratings?.standard?.value || null)
                        return STANDARD_TO_SERVER[raw] || raw || null
                    })(),
                    unit:  null,
                },

                rated_frequency_custom: dto.ratings?.rated_frequency_custom || null,

                rated_frequency: {
                    mrid:  dto.ratings?.rated_frequency?.mrid || null,
                    value: dto.ratings?.rated_frequency?.value
                        ? parseFloat(dto.ratings.rated_frequency.value)
                        : null,
                    unit:  dto.ratings?.rated_frequency?.unit || null,
                },

                uprRatio: {
                    mrid:  dto.ratings?.uprRatio?.mrid  || null,
                    value: dto.ratings?.uprRatio?.value || null,
                    // unit DTO default = 'string' (rác) → bỏ qua, chỉ gửi unit thật
                    unit:  (dto.ratings?.uprRatio?.unit && dto.ratings.uprRatio.unit !== 'string')
                        ? dto.ratings.uprRatio.unit
                        : null,
                },

                upr: MULTIPLIER_TO_SERVER[dto.ratings?.upr] || null,

                c1: {
                    mrid:  dto.ratings?.c1?.mrid || null,
                    value: dto.ratings?.c1?.value ? parseFloat(dto.ratings.c1.value) : null,
                    unit:  dto.ratings?.c1?.unit || null,
                },

                c2: {
                    mrid:  dto.ratings?.c2?.mrid || null,
                    value: dto.ratings?.c2?.value ? parseFloat(dto.ratings.c2.value) : null,
                    unit:  dto.ratings?.c2?.unit || null,
                },

                rated_voltage: {
                    mrid:  dto.ratings?.rated_voltage?.mrid || null,
                    value: dto.ratings?.rated_voltage?.value
                        ? parseFloat(dto.ratings.rated_voltage.value)
                        : null,
                    unit:  dto.ratings?.rated_voltage?.unit || null,
                },
            },

            locationId:          dto.locationId          || null,
            psrId:               dto.psrId               || null,
            assetPsrId:          dto.assetPsrId          || null,
            assetInfoId:         dto.assetInfoId         || null,
            productAssetModelId: dto.productAssetModelId || null,
            lifecycleDateId:     dto.lifecycleDateId     || null,
            attachmentId:        dto.attachmentId        || null,

            vt_Configuration: {
                windings: dto.vt_Configuration?.windings || 0,
                dataVT: (dto.vt_Configuration?.dataVT || []).map(vt => ({
                    mrid: vt.mrid || null,

                    // DTO usr_formula là string "3sqrt" → map vào value, convert sang server format
                    usr_formula: {
                        mrid:       null,
                        value:      (() => {
                            const raw = typeof vt.usr_formula === 'string'
                                ? vt.usr_formula
                                : (vt.usr_formula?.value || null)
                            return MULTIPLIER_TO_SERVER[raw] || raw || null
                        })(),
                        unit:       vt.usr_formula?.unit       || null,
                        multiplier: vt.usr_formula?.multiplier || null,
                    },

                    usr_rated_voltage: {
                        mrid:       vt.usr_rated_voltage?.mrid || null,
                        value:      vt.usr_rated_voltage?.value
                            ? parseFloat(vt.usr_rated_voltage.value) : null,
                        unit:       vt.usr_rated_voltage?.unit       || null,
                        multiplier: vt.usr_rated_voltage?.multiplier || null,
                    },

                    rated_burden: {
                        mrid:       vt.rated_burden?.mrid || null,
                        value:      vt.rated_burden?.value
                            ? parseFloat(vt.rated_burden.value) : null,
                        unit:       vt.rated_burden?.unit       || null,
                        multiplier: vt.rated_burden?.multiplier || null,
                    },

                    // DTO rated_power_factor là number 7 → map vào value
                    rated_power_factor: {
                        mrid:       null,
                        value:      typeof vt.rated_power_factor === 'number'
                            ? vt.rated_power_factor
                            : (vt.rated_power_factor?.value
                                ? parseFloat(vt.rated_power_factor.value)
                                : null),
                        unit:       vt.rated_power_factor?.unit       || null,
                        multiplier: vt.rated_power_factor?.multiplier || null,
                    },
                })),
            },
        },
    }
}