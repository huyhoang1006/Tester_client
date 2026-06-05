import SurgeArresterDto from "@/views/Dto/SurgeAsset";
import uuid from "@/utils/uuid";

const str = (val) => (val !== null && val !== undefined) ? String(val) : ''

// Tách unit từ server "kV" → "k|V", "kA" → "k|A", giữ nguyên nếu đã có pipe hoặc không có multiplier
const splitUnit = (raw, defaultUnit) => {
    const u = raw || defaultUnit
    if (!u) return defaultUnit
    if (u.includes('|')) return u
    const multipliers = ['k', 'M', 'G', 'm', 'µ', 'n', 'p']
    for (const mult of multipliers) {
        if (u.length > 1 && u.startsWith(mult)) return mult + '|' + u.slice(mult.length)
    }
    return u
}

export const mapServerToDto = (serverData) => {
    const dto = new SurgeArresterDto();
    if (!serverData) return dto;

    const assetInfo  = serverData.assetInfo          || {};
    const sa         = serverData.surgeArrester       || {};
    const ratingList = serverData.surgeArresterRatingList || [];

    // 1. IDs — không dùng integer ID từ server, luôn sinh UUID
    dto.assetInfoId         = uuid.newUuid()
    dto.psrId               = assetInfo.ownerId ? String(assetInfo.ownerId) : null
    dto.productAssetModelId = uuid.newUuid()
    dto.lifecycleDateId     = uuid.newUuid()
    dto.assetPsrId          = uuid.newUuid()

    // 2. Properties
    dto.properties.mrid              = null
    dto.properties.kind              = 'Surge Arrester'
    dto.properties.type              = sa.assetType || ''
    dto.properties.serial_no         = assetInfo.serialNo         || ''
    dto.properties.manufacturer      = assetInfo.manufacturerName || ''
    dto.properties.manufacturer_type = assetInfo.manufacturerType || ''
    dto.properties.manufacturer_year = assetInfo.manufacturingYear
        ? String(assetInfo.manufacturingYear)
        : ''
    dto.properties.country_of_origin = assetInfo.countryName  || ''
    dto.properties.apparatus_id      = assetInfo.apparatusId  || ''
    dto.properties.comment           = assetInfo.description  || ''

    // 3. Ratings
    dto.ratings.unitStack  = ratingList.length || ''
    dto.ratings.tableRating = ratingList.map(r => ({
        mrid:        uuid.newUuid(),
        assetInfoId: uuid.newUuid(),  // không dùng r.id từ server
        position:    r.position || '',
        serial:      r.serialNo || '',

        ratedVoltage: {
            mrid:  uuid.newUuid(),
            value: str(r.ratedVoltage),
            unit:  splitUnit(r.voltageUnit, 'k|V'),
        },
        maximumVoltage: {
            mrid:  uuid.newUuid(),
            value: str(r.maxSystemVoltage),
            unit:  splitUnit(r.voltageUnit, 'k|V'),
        },
        continousVoltage: {
            mrid:  uuid.newUuid(),
            value: str(r.continousOperatingVoltage),
            unit:  splitUnit(r.voltageUnit, 'k|V'),
        },
        shortCurrent: {
            mrid:  uuid.newUuid(),
            value: str(r.shortTimeWithstandCurrent),
            unit:  splitUnit(r.currentUnit, 'k|A'),
        },
        ratedCircuit: {
            mrid:  uuid.newUuid(),
            value: str(r.shortCircuitRatedDuration),
            unit:  r.ratedDurationUnit || 's',
        },
        polesVoltage: {
            mrid:  uuid.newUuid(),
            value: str(r.pfWithstandToEarthPoles),
            unit:  splitUnit(r.voltageUnit, 'k|V'),
        },
        isoVoltage: {
            mrid:  uuid.newUuid(),
            value: str(r.pfWithstandIsolatingDistance),
            unit:  splitUnit(r.voltageUnit, 'k|V'),
        },
    }))

    return dto;
};

// ═══════════════════════════════════════════════════════════════════════════════
// Mapper: DTO → server JSON (push/upload)
// ═══════════════════════════════════════════════════════════════════════════════

// số: '' / null → null, còn lại parseFloat
const numS = (val) => (val !== null && val !== undefined && val !== '') ? parseFloat(val) : null

// unit DTO 'k|V' → server 'kV' (gộp lại, bỏ pipe). 'A' giữ nguyên.
const joinUnit = (u) => {
    if (!u) return null
    return u.includes('|') ? u.replace('|', '') : u
}

// Gắn FK vào payload CHỈ khi có giá trị thật (chỉ đẩy khi asset đã có sẵn)
const attachFK = (payload, dto) => {
    const fkKeys = {
        mRID:                dto.mrid || dto.properties?.mrid,
        assetInfoId:         dto.assetInfoId,
        productAssetModelId: dto.productAssetModelId,
        lifecycleDateId:     dto.lifecycleDateId,
        assetPsrId:          dto.assetPsrId,
        locationId:          dto.locationId,
        attachmentId:        dto.attachmentId,
    }
    for (const [k, v] of Object.entries(fkKeys)) {
        if (v !== null && v !== undefined && v !== '') payload[k] = v
    }
    return payload
}

export const mapDtoToServer = (dto, ownerType) => {
    if (!dto) return null

    const p     = dto.properties || {}
    const table = dto.ratings?.tableRating || []

    const payload = {
        assetInfo: {
            ownerId:           dto.psrId || null,
            ownerType:         ownerType || null,   // BAY | SUBSTATION — server đọc từ body
            serialNo:          p.serial_no         || null,
            manufacturer:      p.manufacturer      || null,   // TÊN hãng
            manufacturerType:  p.manufacturer_type || null,
            manufacturingYear: numS(p.manufacturer_year),
            country:           p.country_of_origin || null,   // TÊN nước
            apparatusId:       p.apparatus_id      || null,
            description:       p.comment           || null,
        },

        surgeArrester: {
            assetType: p.type || null,
        },

        surgeArresterRatingList: table.map((r, idx) => ({
            position:     r.position ?? (idx + 1),
            serialNo:     r.serial || null,

            ratedVoltage:              numS(r.ratedVoltage?.value),
            maxSystemVoltage:          numS(r.maximumVoltage?.value),
            continousOperatingVoltage: numS(r.continousVoltage?.value),
            // các điện áp dùng chung 1 voltageUnit (lấy từ ratedVoltage)
            voltageUnit:               joinUnit(r.ratedVoltage?.unit),

            shortTimeWithstandCurrent: numS(r.shortCurrent?.value),
            currentUnit:               joinUnit(r.shortCurrent?.unit),

            shortCircuitRatedDuration: numS(r.ratedCircuit?.value),
            ratedDurationUnit:         joinUnit(r.ratedCircuit?.unit),

            pfWithstandToEarthPoles:      numS(r.polesVoltage?.value),
            pfWithstandIsolatingDistance: numS(r.isoVoltage?.value),
        })),
    }

    return attachFK(payload, dto)
}