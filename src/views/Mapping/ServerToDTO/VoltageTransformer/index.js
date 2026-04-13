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
    'ONE_TO_1':     '1',
}

// ─── Mapper ──────────────────────────────────────────────────────────────────

export const mapServerToDto = (serverData) => {
    const dto = new VoltageTransformerDto();
    if (!serverData) return dto;

    const assetInfo  = serverData.assetInfoResponseDTO                   || {};
    const core       = serverData.voltageTransformerCoreResponseDTO      || {};
    const configList = serverData.voltageTransformerConfigResponseDTOList || [];

    // 1. IDs
    dto.mrid            = serverData.mRID || serverData.mrid || null
    dto.assetInfoId     = assetInfo.id     ? String(assetInfo.id)      : uuid.newUuid()
    dto.psrId           = assetInfo.ownerId ? String(assetInfo.ownerId) : null

    dto.productAssetModelId = uuid.newUuid()
    dto.lifecycleDateId     = uuid.newUuid()
    dto.assetPsrId          = uuid.newUuid()

    // 2. Properties
    dto.properties.mrid              = dto.mrid
    dto.properties.asset_type        = ASSET_TYPE_MAP[core.assetType] || core.assetType || ''
    dto.properties.type              = ASSET_TYPE_MAP[core.assetType] || core.assetType || ''
    dto.properties.manufacturer_type = ''
    dto.properties.kind              = 'Voltage transformer'
    dto.properties.serial_no         = assetInfo.serialNo         || ''
    dto.properties.manufacturer      = assetInfo.manufacturerName || ''
    dto.properties.country_of_origin = assetInfo.countryName      || ''
    dto.properties.apparatus_id      = assetInfo.apparatusId      || ''
    dto.properties.comment           = assetInfo.description      || ''
    dto.properties.manufacturing_year = assetInfo.manufacturingYear
        ? String(assetInfo.manufacturingYear)
        : ''

    // 3. Ratings
    // Standard — bỏ underscore (IEC_61869 → IEC61869)
    dto.ratings.standard = (core.standard || '').replace(/_/g, '')

    // Rated frequency
    const freqValue = core.ratedFrequency !== null && core.ratedFrequency !== undefined
        ? String(core.ratedFrequency)
        : ''
    if (['50', '60', '16.7'].includes(freqValue)) {
        dto.ratings.rated_frequency = {
            mrid:  uuid.newUuid(),
            value: freqValue,
            unit:  core.ratedFrequencyUnit || 'Hz',
        }
    } else {
        dto.ratings.rated_frequency = {
            mrid:         uuid.newUuid(),
            value:        'Custom',
            unit:         core.ratedFrequencyUnit || 'Hz',
            custom_value: freqValue,
        }
        dto.ratings.rated_frequency_custom = freqValue
    }

    // UPR — uprMultiplier map sang UI value
    dto.ratings.upr = MULTIPLIER_MAP[core.uprMultiplier] || core.uprMultiplier || ''

    dto.ratings.uprRatio = {
        mrid:  uuid.newUuid(),
        value: core.uprValue !== undefined ? String(core.uprValue) : '',
        unit:  (MULTIPLIER_MAP[core.uprMultiplier] || '') + '|' + (core.uprUnit || ''),
    }

    dto.ratings.rated_voltage = {
        mrid:  uuid.newUuid(),
        value: core.uprValue !== undefined ? String(core.uprValue) : '',
        unit:  (MULTIPLIER_MAP[core.uprMultiplier] || '') + '|' + (core.uprUnit || ''),
    }

    // 4. VT Configuration
    // Trong mapper, sửa lại:
    dto.vt_Configuration.windings = core.windings || configList.length || ''
    dto.vt_Configuration.dataVT   = configList.map(config => ({
        mrid:               uuid.newUuid(),
        name:               config.name || '',
        usr_formula:        MULTIPLIER_MAP[config.usrMultiplier] || config.usrMultiplier || '',
        rated_power_factor: config.cos !== null && config.cos !== undefined ? config.cos : '',
        usr_rated_voltage: {
            mrid:       uuid.newUuid(),
            value:      config.usrValue !== null ? String(config.usrValue) : '',
            unit:       (MULTIPLIER_MAP[config.usrMultiplier] || '') + '|' + (config.usrUnit || 'V'),
            multiplier: MULTIPLIER_MAP[config.usrMultiplier]  || '',
        },
        rated_burden: {
            mrid:       uuid.newUuid(),
            value:      config.ratedBurden !== null ? String(config.ratedBurden) : '',
            unit:       'null|' + (config.ratedBurdenUnit || 'VA'),
            multiplier: '',
        },
    }))

    return dto;
};