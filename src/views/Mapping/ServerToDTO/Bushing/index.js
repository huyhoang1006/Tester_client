import BushingAssetDto from "@/views/Dto/BushingAsset/index.js";

export const mapServerToDto = (serverData) => {
    const dto = new BushingAssetDto();
    if (!serverData) return dto;

    const assetInfo = serverData.assetInfo || {};
    const bushing = serverData.bushing || {};

    // 1. Map Properties
    dto.properties.mrid = bushing.id ? String(bushing.id) : '';
    dto.properties.serial_no = assetInfo.serialNo || '';
    dto.properties.apparatus_id = assetInfo.apparatusId || '';
    dto.properties.kind = 'Bushing';
    dto.properties.type = bushing.assetType || '';
    dto.properties.manufacturer = assetInfo.manufacturerName || '';
    dto.properties.manufacturer_year = assetInfo.manufacturingYear || '';
    dto.properties.country_of_origin = assetInfo.countryName || '';
    dto.properties.comment = assetInfo.description || '';

    // 2. Map Bushing data (ratings) - Dùng !== null để giữ lại số 0
    dto.bushing.rated_frequency = {
        mrid: '',
        value: bushing.ratedFrequency !== null ? bushing.ratedFrequency : '',
        unit: bushing.ratedFrequencyUnit || 'Hz'
    };
    dto.bushing.insulation_level = {
        mrid: '',
        value: bushing.insulLevelLLL !== null ? bushing.insulLevelLLL : '',
        unit: bushing.insulLevelUnit || 'kV'
    };
    dto.bushing.voltage_l_ground = {
        mrid: '',
        value: bushing.voltageLGround !== null ? bushing.voltageLGround : '',
        unit: bushing.voltageLGroundUnit || 'kV'
    };
    dto.bushing.max_system_voltage = {
        mrid: '',
        value: bushing.maxSystemVoltage !== null ? bushing.maxSystemVoltage : '',
        unit: bushing.maxSystemVoltageUnit || 'kV'
    };
    dto.bushing.rated_current = {
        mrid: '',
        value: bushing.ratedCurrent !== null ? bushing.ratedCurrent : '',
        unit: bushing.ratedCurrentUnit || 'A'
    };
    dto.bushing.df_c1 = {
        mrid: '',
        value: bushing.dfC1 !== null ? bushing.dfC1 : '',
        unit: bushing.dfC1Unit || '%'
    };
    dto.bushing.cap_c1 = {
        mrid: '',
        value: bushing.capC1 !== null ? bushing.capC1 : '',
        unit: bushing.capC1Unit || 'pF'
    };
    dto.bushing.df_c2 = {
        mrid: '',
        value: bushing.dfC2 !== null ? bushing.dfC2 : '',
        unit: bushing.dfC2Unit || '%'
    };
    dto.bushing.cap_c2 = {
        mrid: '',
        value: bushing.capC2 !== null ? bushing.capC2 : '',
        unit: bushing.capC2Unit || 'pF'
    };
    dto.bushing.insulation_type = bushing.insulType || '';

    // 3. IDs
    dto.assetInfoId = assetInfo.id ? String(assetInfo.id) : '';
    dto.assetPsrId = bushing.id ? String(bushing.id) : '';

    return dto;
};