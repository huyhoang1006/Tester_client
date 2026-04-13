import SurgeArresterDto from "@/views/Dto/SurgeAsset";
import uuid from "@/utils/uuid";

const str = (val) => (val !== null && val !== undefined) ? String(val) : ''

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
    dto.properties.manufacturer_type = ''
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
            unit:  'k|' + (r.voltageUnit || 'V'),
        },
        maximumVoltage: {
            mrid:  uuid.newUuid(),
            value: str(r.maxSystemVoltage),
            unit:  'k|' + (r.voltageUnit || 'V'),
        },
        continousVoltage: {
            mrid:  uuid.newUuid(),
            value: str(r.continousOperatingVoltage),
            unit:  'k|' + (r.voltageUnit || 'V'),
        },
        shortCurrent: {
            mrid:  uuid.newUuid(),
            value: str(r.shortTimeWithstandCurrent),
            unit:  'k|' + (r.currentUnit || 'A'),
        },
        ratedCircuit: {
            mrid:  uuid.newUuid(),
            value: str(r.shortCircuitRatedDuration),
            unit:  r.ratedDurationUnit || 's',
        },
        polesVoltage: {
            mrid:  uuid.newUuid(),
            value: str(r.pfWithstandToEarthPoles),
            unit:  'k|' + (r.voltageUnit || 'V'),
        },
        isoVoltage: {
            mrid:  uuid.newUuid(),
            value: str(r.pfWithstandIsolatingDistance),
            unit:  'k|' + (r.voltageUnit || 'V'),
        },
    }))

    return dto;
};