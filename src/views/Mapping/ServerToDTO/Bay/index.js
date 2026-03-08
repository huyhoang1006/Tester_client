export const mapServerToDto = (serverData) => {
    if (!serverData) return {};

    // Map dữ liệu từ JSON Server sang cấu trúc mà Client View (Bay/index.vue) hiểu
    return {
        mrid: serverData.mRID || '',
        name: serverData.name || '',
        aliasName: serverData.aliasName || '',
        description: serverData.description || '',

        // Các cờ boolean (nếu cần hiển thị)
        bayEnergyMeasFlag: serverData.bayEnergyMeasFlag,
        bayPowerMeasFlag: serverData.bayPowerMeasFlag,

        // Giữ lại các cấu hình nếu có
        breakerConfiguration: serverData.breakerConfiguration,
        busBarConfiguration: serverData.busBarConfiguration
    };
};