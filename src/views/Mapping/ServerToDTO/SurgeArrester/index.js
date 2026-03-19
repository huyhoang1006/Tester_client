// File: src/views/Mapping/ServerToDTO/SurgeArrester/index.js
import SurgeArresterDto from "@/views/Dto/SurgeAsset";

export const mapServerToDto = (serverData) => {
    const dto = new SurgeArresterDto();
    if (!serverData) return dto;

    const assetInfo = serverData.assetInfo || {};
    const surgeArrester = serverData.surgeArrester || {};
    const ratingsList = serverData.surgeArresterRatingList || [];

    // 1. Map Properties
    dto.properties.mrid = surgeArrester.id ? String(surgeArrester.id) : '';
    dto.properties.serial_no = assetInfo.serialNo || '';
    dto.properties.apparatus_id = assetInfo.apparatusId || '';
    dto.properties.kind = 'Surge Arrester';
    dto.properties.type = surgeArrester.assetType || '';
    dto.properties.manufacturer = assetInfo.manufacturerName || '';
    dto.properties.manufacturer_year = assetInfo.manufacturingYear || '';
    dto.properties.country_of_origin = assetInfo.countryName || '';
    dto.properties.comment = assetInfo.description || '';

    // 2. Map Ratings
    // Tính toán số lượng Unit Stack dựa trên độ dài của mảng rating
    dto.ratings.unitStack = ratingsList.length > 0 ? ratingsList.length : 1;

    // Map tableRating thành định dạng Object { mrid, value, unit } mà UI yêu cầu
    dto.ratings.tableRating = ratingsList.map((rating, index) => ({
        mrid: rating.id ? String(rating.id) : '',
        assetInfoId: '',
        position: rating.position || (index + 1),
        serial: rating.serialNo || '',
        ratedVoltage: {
            mrid: '',
            value: rating.ratedVoltage !== null ? rating.ratedVoltage : '',
            unit: 'k|V'
        },
        maximumVoltage: {
            mrid: '',
            value: rating.maxSystemVoltage !== null ? rating.maxSystemVoltage : '',
            unit: 'k|V'
        },
        continousVoltage: {
            mrid: '',
            value: rating.continousOperatingVoltage !== null ? rating.continousOperatingVoltage : '',
            unit: 'k|V'
        },
        shortCurrent: {
            mrid: '',
            value: rating.shortTimeWithstandCurrent !== null ? rating.shortTimeWithstandCurrent : '',
            unit: 'k|A'
        },
        ratedCircuit: {
            mrid: '',
            value: rating.shortCircuitRatedDuration !== null ? rating.shortCircuitRatedDuration : '',
            unit: 's'
        },
        polesVoltage: {
            mrid: '',
            value: rating.pfWithstandToEarthPoles !== null ? rating.pfWithstandToEarthPoles : '',
            unit: 'k|V'
        },
        isoVoltage: {
            mrid: '',
            value: rating.pfWithstandIsolatingDistance !== null ? rating.pfWithstandIsolatingDistance : '',
            unit: 'k|V'
        }
    }));

    // 3. Generate IDs for relationships
    dto.assetInfoId = assetInfo.id ? String(assetInfo.id) : '';
    dto.productAssetModelId = '';
    dto.lifecycleDateId = '';
    dto.assetPsrId = surgeArrester.id ? String(surgeArrester.id) : '';

    return dto;
};