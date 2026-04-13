/* eslint-disable */
import CircuitBreakerDto from "@/views/Dto/CircuitBreaker";
import uuid from "@/utils/uuid";

// ─── Lookup maps ─────────────────────────────────────────────────────────────

const ASSET_TYPE_MAP = {
    'Live tank SF6 breaker':           'LiveSF6',
    'Minimum oil breaker':             'MiniOil',
    'Air-blast breaker':               'AirBlast',
    'Dead tank SF6 breaker':           'DeadTankSF6',
    'Dead tank oil breaker (OCB)':     'DeadTankOCB',
    'Vacuum breaker':                  'Vacuum',
    'Generator circuit breaker (GCB)': 'GenCirGCB',
    'Gas insulated switchgear (GIS)':  'GasInsuGIS',
    'Miscellaneous':                   'Miscell',
}

const OPERATING_TYPE_MAP = {
    'Spring':    'Spring',
    'Hydraulic': 'hydraulic',
    'Pneumatic': 'Pneumatic',
    'Motor':     'Motor',
    'Magnetic':  'magnetic',
}

const extractYear = (dateStr) => {
    if (!dateStr) return ''
    const match = String(dateStr).match(/^(\d{4})/)
    return match ? match[1] : ''
}

const str = (val) => (val !== null && val !== undefined) ? String(val) : ''

// ─── Mapper ──────────────────────────────────────────────────────────────────

export const mapServerToDto = (serverData) => {
    const dto = new CircuitBreakerDto();
    if (!serverData) return dto;

    const assetInfo    = serverData.assetInfo            || {};
    const lifecycle    = serverData.lifecycleDate        || {};
    const opMech       = serverData.operatingMechanism   || {};
    const opAssetInfo  = opMech.assetInfo                || {};
    const opLifecycle  = opMech.lifeCycleDate || opMech.lifecycleDate || {};
    const opPam        = opMech.productAssetModel        || {};
    const manufacturer = opPam.manufacturer              || {};
    const manufOrg     = manufacturer.organisation       || {};

    // 1. IDs — luôn sinh UUID
    dto.assetInfoId                           = uuid.newUuid()
    dto.productAssetModelId                   = uuid.newUuid()
    dto.lifecycleDateId                       = uuid.newUuid()
    dto.assetPsrId                            = uuid.newUuid()
    dto.breakerRatingInfoId                   = uuid.newUuid()
    dto.breakerContactSystemInfoId            = uuid.newUuid()
    dto.breakerOtherInfoId                    = uuid.newUuid()
    dto.operatingMechanismId                  = uuid.newUuid()
    dto.operatingMechanismInfoId              = uuid.newUuid()
    dto.operatingMechanismLifecycleDateId     = uuid.newUuid()
    dto.operatingMechanismProductAssetModelId = uuid.newUuid()
    dto.assessmentLimitBreakerInfoId          = uuid.newUuid()

    // 2. Properties
    dto.properties.mrid              = null
    dto.properties.kind              = 'Circuit breaker'

    // Asset.type → UI value
    dto.properties.type              = ASSET_TYPE_MAP[serverData.type] || serverData.type || ''

    // Asset.serial_number
    dto.properties.serial_no         = serverData.serialNumber || ''

    // ✅ manufacturer = tên hãng: assetInfo.manufacturerType (ABB, Siemens...)
    dto.properties.manufacturer      = manufOrg.name
        || manufacturer.name
        || assetInfo.manufacturerType
        || opAssetInfo.manufacturerType
        || ''

    // AssetInfo.manufacturer_type = loại sản phẩm của hãng
    dto.properties.manufacturer_type = assetInfo.manufacturerType
        || opAssetInfo.manufacturerType
        || ''

    // manufacturing year
    dto.properties.manufacturer_year = extractYear(lifecycle.manufacturedDate)

    // country_of_origin
    dto.properties.country_of_origin = serverData.countryOfOrigin || ''

    // ✅ apparatus_id = model number: assetInfo.productAssetModel hoặc lotNumber
    dto.properties.apparatus_id      = serverData.lotNumber
        || assetInfo.productAssetModel
        || serverData.position
        || ''

    // description
    dto.properties.comment           = serverData.description || ''

    // 3. Ratings — server chưa trả về chi tiết → giữ default
    // Sau này khi server có: rated_voltage, rated_current, rated_frequency,
    // rated_interrupting_time, rated_insulation_level... thì map vào đây

    // 4. CircuitBreaker section — server chưa trả về → giữ default

    // 5. Operating mechanism
    dto.operating.type              = OPERATING_TYPE_MAP[opMech.type] || opMech.type || ''
    dto.operating.serial_no         = opMech.serialNumber             || ''
    dto.operating.comment           = opMech.description              || ''
    dto.operating.manufacturer_year = extractYear(opLifecycle.manufacturedDate)
    dto.operating.manufacturer_type = opAssetInfo.manufacturerType    || ''
    dto.operating.manufacturer      = manufOrg.name || manufacturer.name || ''

    // 6. Others, ContactSystem, Assessment — server chưa trả về → giữ default

    return dto;
};