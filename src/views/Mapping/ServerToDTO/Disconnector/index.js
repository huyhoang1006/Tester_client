import DisconnectorDTO from "@/views/Dto/Disconnector";
import uuid from "@/utils/uuid";

// ─── Lookup maps ─────────────────────────────────────────────────────────────

const ASSET_TYPE_MAP = {
    'CENTER_BREAK':     'centerBreak',
    'DOUBLE_BREAK':     'doubleBreak',
    'HORIZONTAL_KNEE':  'horizontalKnee',
    'PANTOGRAPH':       'pantograph',
    'VERTICAL_BREAK':   'verticalBreak',
}

// ─── Mapper ──────────────────────────────────────────────────────────────────

export const mapServerToDto = (serverData) => {
    const dto = new DisconnectorDTO();
    if (!serverData) return dto;

    const assetInfo = serverData.assetInfo || {};
    const core      = serverData.core      || {};

    // 1. IDs
    dto.mrid               = serverData.mRID || serverData.mrid || null
    dto.assetInfoId        = assetInfo.id    ? String(assetInfo.id) : uuid.newUuid()
    dto.psrId              = assetInfo.ownerId ? String(assetInfo.ownerId) : null
    dto.productAssetModelId = uuid.newUuid()
    dto.lifecycleDateId    = uuid.newUuid()
    dto.assetPsrId         = uuid.newUuid()

    // 2. Properties
    dto.properties.mrid              = dto.mrid
    dto.properties.type              = ASSET_TYPE_MAP[core.assetType] || core.assetType || ''
    dto.properties.kind              = 'Disconnector'
    dto.properties.serial_no         = assetInfo.serialNo         || ''
    dto.properties.manufacturer      = assetInfo.manufacturerName || ''
    dto.properties.manufacturer_type = ''
    dto.properties.manufacturing_year = assetInfo.manufacturingYear
        ? String(assetInfo.manufacturingYear)
        : ''
    dto.properties.country_of_origin = assetInfo.countryName  || ''
    dto.properties.apparatus_id      = assetInfo.apparatusId  || ''
    dto.properties.comment           = assetInfo.description  || ''

    // 3. Ratings
    dto.ratings.rated_voltage = {
        mrid:  uuid.newUuid(),
        value: core.ratedVoltage !== null && core.ratedVoltage !== undefined
            ? String(core.ratedVoltage) : '',
        unit:  'k|' + (core.ratedVoltageUnit || 'V'),
    }

    dto.ratings.rated_frequency = {
        mrid:  uuid.newUuid(),
        value: core.ratedFrequency !== null && core.ratedFrequency !== undefined
            ? String(core.ratedFrequency) : '',
        unit:  core.ratedFrequencyUnit || 'Hz',
    }

    dto.ratings.rated_current = {
        mrid:  uuid.newUuid(),
        value: core.ratedCurrent !== null && core.ratedCurrent !== undefined
            ? String(core.ratedCurrent) : '',
        unit:  core.ratedCurrentUnit || 'A',
    }

    dto.ratings.short_time_withstand_current = {
        mrid:  uuid.newUuid(),
        value: core.shortTimeWithstandCurrent !== null && core.shortTimeWithstandCurrent !== undefined
            ? String(core.shortTimeWithstandCurrent) : '',
        unit:  'k|' + (core.shortTimeWithstandCurrentUnit || 'A'),
    }

    dto.ratings.rated_duration_of_short_circuit = {
        mrid:  uuid.newUuid(),
        value: core.shortCircuitRatedDuration !== null && core.shortCircuitRatedDuration !== undefined
            ? String(core.shortCircuitRatedDuration) : '',
        unit:  core.shortCircuitRatedDurationUnit || 's',
    }

    dto.ratings.power_freq_withstand_voltage_earth_poles = {
        mrid:  uuid.newUuid(),
        value: core.pfWithstandToEarthPoles !== null && core.pfWithstandToEarthPoles !== undefined
            ? String(core.pfWithstandToEarthPoles) : '',
        unit:  'k|' + (core.pfWithstandToEarthPolesUnit || 'V'),
    }

    dto.ratings.power_freq_withstand_voltage_isolating_distance = {
        mrid:  uuid.newUuid(),
        value: core.pfWithstandIsolatingDistance !== null && core.pfWithstandIsolatingDistance !== undefined
            ? String(core.pfWithstandIsolatingDistance) : '',
        unit:  core.pfWithstandIsolatingDistanceUnit || 'Hz',
    }

    return dto;
};