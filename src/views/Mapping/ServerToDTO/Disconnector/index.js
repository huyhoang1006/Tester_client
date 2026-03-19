import DisconnectorDTO from "@/views/Dto/Disconnector";

export const mapServerToDto = (serverData) => {
    const dto = new DisconnectorDTO();
    if (!serverData) return dto;

    const assetInfo = serverData.assetInfo || {};
    const core = serverData.core || {};

    // 1. Map Properties
    dto.properties.mrid = core.id ? String(core.id) : '';
    dto.properties.serial_no = assetInfo.serialNo || '';
    dto.properties.apparatus_id = assetInfo.apparatusId || '';
    dto.properties.kind = 'Disconnector';
    dto.properties.type = core.assetType || '';
    dto.properties.manufacturer = assetInfo.manufacturerName || '';
    dto.properties.manufacturing_year = assetInfo.manufacturingYear || '';
    dto.properties.country_of_origin = assetInfo.countryName || '';
    dto.properties.comment = assetInfo.description || '';

    // 2. Map Ratings
    // Hàm helper để convert đơn vị từ Server (kV, kA) sang format UI (k|V, k|A)
    const formatUnit = (unitStr) => {
        if (!unitStr) return '';
        if (unitStr === 'kV') return 'k|V';
        if (unitStr === 'kA') return 'k|A';
        if (unitStr === 'Hz') return 'Hz';
        if (unitStr === 'A') return 'A';
        if (unitStr === 's') return 's';
        // Fallback tự động cắt nếu có prefix (m, k, M, G)
        if (unitStr.length > 1 && ['m', 'k', 'M', 'G'].includes(unitStr.charAt(0))) {
            return unitStr.charAt(0) + '|' + unitStr.substring(1);
        }
        return unitStr;
    };

    const mapRating = (val, unit) => ({
        mrid: '',
        value: val !== null && val !== undefined ? val : '',
        unit: formatUnit(unit)
    });

    dto.ratings.rated_voltage = mapRating(core.ratedVoltage, core.ratedVoltageUnit);
    dto.ratings.rated_frequency = mapRating(core.ratedFrequency, core.ratedFrequencyUnit);
    dto.ratings.rated_current = mapRating(core.ratedCurrent, core.ratedCurrentUnit);
    dto.ratings.short_time_withstand_current = mapRating(core.shortTimeWithstandCurrent, core.shortTimeWithstandCurrentUnit);
    dto.ratings.rated_duration_of_short_circuit = mapRating(core.shortCircuitRatedDuration, core.shortCircuitRatedDurationUnit);
    dto.ratings.power_freq_withstand_voltage_earth_poles = mapRating(core.pfWithstandToEarthPoles, core.pfWithstandToEarthPolesUnit);
    dto.ratings.power_freq_withstand_voltage_isolating_distance = mapRating(core.pfWithstandIsolatingDistance, core.pfWithstandIsolatingDistanceUnit);

    // 3. IDs
    dto.assetInfoId = assetInfo.id ? String(assetInfo.id) : '';
    dto.assetPsrId = core.id ? String(core.id) : '';

    return dto;
};