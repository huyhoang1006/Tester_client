import DisconnectorDTO from '@/views/Dto/Disconnector'
import uuid from '@/utils/uuid'

// Tách unit từ server "kV" → "k|V", "kA" → "k|A", "V" → "V", "A" → "A"
// Server có thể trả sẵn dạng "kV" hoặc chỉ "V"
const splitUnit = (raw, defaultUnit) => {
    const u = raw || defaultUnit
    if (!u) return defaultUnit
    // Nếu đã có pipe thì giữ nguyên
    if (u.includes('|')) return u
    // Multiplier prefixes: k (kilo), M (mega), m (milli), G, etc
    const multipliers = ['k', 'M', 'G', 'm', 'µ', 'n', 'p']
    for (const mult of multipliers) {
        if (u.length > 1 && u.startsWith(mult)) {
            return mult + '|' + u.slice(mult.length)
        }
    }
    return u // không có multiplier
}

// ─── Lookup maps ─────────────────────────────────────────────────────────────

const ASSET_TYPE_MAP = {
    CENTER_BREAK: 'centerBreak',
    DOUBLE_BREAK: 'doubleBreak',
    HORIZONTAL_KNEE: 'horizontalKnee',
    PANTOGRAPH: 'pantograph',
    VERTICAL_BREAK: 'verticalBreak'
}

// ─── Mapper ──────────────────────────────────────────────────────────────────

export const mapServerToDto = (serverData) => {
    const dto = new DisconnectorDTO()
    if (!serverData) return dto

    const assetInfo = serverData.assetInfo || {}
    const core = serverData.core || {}

    // 1. IDs
    dto.mrid = serverData.mRID || serverData.mrid || null
    dto.assetInfoId = assetInfo.id ? String(assetInfo.id) : uuid.newUuid()
    dto.psrId = assetInfo.ownerId ? String(assetInfo.ownerId) : null
    dto.productAssetModelId = uuid.newUuid()
    dto.lifecycleDateId = uuid.newUuid()
    dto.assetPsrId = uuid.newUuid()

    // 2. Properties
    dto.properties.mrid = dto.mrid
    dto.properties.type = ASSET_TYPE_MAP[core.assetType] || core.assetType || ''
    dto.properties.kind = 'Disconnector'
    dto.properties.serial_no = assetInfo.serialNo || ''
    dto.properties.manufacturer = assetInfo.manufacturer || ''
    dto.properties.manufacturer_type = assetInfo.manufacturerType || ''
    dto.properties.manufacturing_year = assetInfo.manufacturingYear ? String(assetInfo.manufacturingYear) : ''
    dto.properties.country_of_origin = assetInfo.country || ''
    dto.properties.apparatus_id = assetInfo.apparatusId || ''
    dto.properties.comment = assetInfo.description || ''
    dto.config.phase = assetInfo.phase || ''
    dto.config.number_of_phase = assetInfo.numberOfPhase ?? ''

    // 3. Ratings
    dto.ratings.rated_voltage = {
        mrid: uuid.newUuid(),
        value: core.ratedVoltage !== null && core.ratedVoltage !== undefined ? String(core.ratedVoltage) : '',
        unit: splitUnit(core.ratedVoltageUnit, 'k|V')
    }

    dto.ratings.rated_frequency = {
        mrid: uuid.newUuid(),
        value: core.ratedFrequency !== null && core.ratedFrequency !== undefined ? String(core.ratedFrequency) : '',
        unit: core.ratedFrequencyUnit || 'Hz'
    }

    dto.ratings.rated_current = {
        mrid: uuid.newUuid(),
        value: core.ratedCurrent !== null && core.ratedCurrent !== undefined ? String(core.ratedCurrent) : '',
        unit: core.ratedCurrentUnit || 'A'
    }

    dto.ratings.short_time_withstand_current = {
        mrid: uuid.newUuid(),
        value: core.shortTimeWithstandCurrent !== null && core.shortTimeWithstandCurrent !== undefined ? String(core.shortTimeWithstandCurrent) : '',
        unit: splitUnit(core.shortTimeWithstandCurrentUnit, 'k|A')
    }

    dto.ratings.rated_duration_of_short_circuit = {
        mrid: uuid.newUuid(),
        value: core.shortCircuitRatedDuration !== null && core.shortCircuitRatedDuration !== undefined ? String(core.shortCircuitRatedDuration) : '',
        unit: core.shortCircuitRatedDurationUnit || 's'
    }

    dto.ratings.power_freq_withstand_voltage_earth_poles = {
        mrid: uuid.newUuid(),
        value: core.pfWithstandToEarthPoles !== null && core.pfWithstandToEarthPoles !== undefined ? String(core.pfWithstandToEarthPoles) : '',
        unit: splitUnit(core.pfWithstandToEarthPolesUnit, 'k|V')
    }

    dto.ratings.power_freq_withstand_voltage_isolating_distance = {
        mrid: uuid.newUuid(),
        value: core.pfWithstandIsolatingDistance !== null && core.pfWithstandIsolatingDistance !== undefined ? String(core.pfWithstandIsolatingDistance) : '',
        unit: splitUnit(core.pfWithstandIsolatingDistanceUnit, 'k|V')
    }

    return dto
}

// ═══════════════════════════════════════════════════════════════════════════════
// Mapper: DTO → server JSON (push/upload)
// ═══════════════════════════════════════════════════════════════════════════════

const ASSET_TYPE_TO_SERVER = {
    centerBreak: 'CENTER_BREAK',
    doubleBreak: 'DOUBLE_BREAK',
    horizontalKnee: 'HORIZONTAL_KNEE',
    pantograph: 'PANTOGRAPH',
    verticalBreak: 'VERTICAL_BREAK'
}

// số: '' / null → null, còn lại parseFloat
const numD = (val) => (val !== null && val !== undefined && val !== '' ? parseFloat(val) : null)
const toNumberOrNull = (val) => (val !== null && val !== undefined && val !== '' ? Number(val) : null)

// unit DTO 'k|V' → server 'kV' (gộp lại, bỏ pipe). 'A' giữ nguyên.
const joinUnit = (u) => {
    if (!u) return null
    return u.includes('|') ? u.replace('|', '') : u
}

// Gắn FK vào payload CHỈ khi có giá trị thật (không sinh uuid, không gửi null rác)
// FK là tổ chức nội bộ DB client — chỉ đẩy khi asset đã có sẵn (vd để server update)
const attachFK = (payload, dto) => {
    const fkKeys = {
        mRID: dto.mrid || dto.properties?.mrid,
        assetInfoId: dto.assetInfoId,
        productAssetModelId: dto.productAssetModelId,
        lifecycleDateId: dto.lifecycleDateId,
        assetPsrId: dto.assetPsrId,
        locationId: dto.locationId,
        attachmentId: dto.attachmentId
    }
    for (const [k, v] of Object.entries(fkKeys)) {
        if (v !== null && v !== undefined && v !== '') payload[k] = v
    }
    return payload
}

export const mapDtoToServer = (dto, ownerType) => {
    if (!dto) return null

    const p = dto.properties || {}
    const r = dto.ratings || {}

    const payload = {
        assetInfo: {
            ownerId: dto.psrId || null,
            ownerType: ownerType || null, // BAY | SUBSTATION — server đọc từ body
            serialNo: p.serial_no || null,
            manufacturer: p.manufacturer || null, // TÊN hãng (không phải id)
            manufacturerType: p.manufacturer_type || null,
            manufacturingYear: numD(p.manufacturing_year),
            country: p.country_of_origin || null, // TÊN nước (không phải id)
            apparatusId: p.apparatus_id || null,
            description: p.comment || null,
            phase: dto.config?.phase || null,
            numberOfPhase: toNumberOrNull(dto.config?.number_of_phase)
        },

        core: {
            assetType: ASSET_TYPE_TO_SERVER[p.type] || p.type || null,

            ratedVoltage: numD(r.rated_voltage?.value),
            ratedVoltageUnit: joinUnit(r.rated_voltage?.unit),

            ratedFrequency: numD(r.rated_frequency?.value),
            ratedFrequencyUnit: joinUnit(r.rated_frequency?.unit),

            ratedCurrent: numD(r.rated_current?.value),
            ratedCurrentUnit: joinUnit(r.rated_current?.unit),

            shortTimeWithstandCurrent: numD(r.short_time_withstand_current?.value),
            shortTimeWithstandCurrentUnit: joinUnit(r.short_time_withstand_current?.unit),

            shortCircuitRatedDuration: numD(r.rated_duration_of_short_circuit?.value),
            shortCircuitRatedDurationUnit: joinUnit(r.rated_duration_of_short_circuit?.unit),

            pfWithstandToEarthPoles: numD(r.power_freq_withstand_voltage_earth_poles?.value),
            pfWithstandToEarthPolesUnit: joinUnit(r.power_freq_withstand_voltage_earth_poles?.unit),

            pfWithstandIsolatingDistance: numD(r.power_freq_withstand_voltage_isolating_distance?.value),
            pfWithstandIsolatingDistanceUnit: joinUnit(r.power_freq_withstand_voltage_isolating_distance?.unit)
        }
    }

    return attachFK(payload, dto)
}
