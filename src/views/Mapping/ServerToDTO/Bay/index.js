import BayDto from "@/views/Dto/Bay";

export const mapServerToDto = (serverData) => {
    const dto = new BayDto();
    if (!serverData) return dto;

    // 1. Identification
    dto.bayId = serverData.mRID || serverData.mrid || '';
    dto.name = serverData.name || '';
    dto.aliasName = serverData.aliasName || serverData.shortName || serverData.name || '';

    // 2. Bay Specific Fields
    dto.bay_energy_meas_flag = serverData.bay_energy_meas_flag !== undefined ? serverData.bay_energy_meas_flag : '';
    dto.bay_power_meas_flag = serverData.bay_power_meas_flag !== undefined ? serverData.bay_power_meas_flag : '';
    dto.breaker_configuration = serverData.breaker_configuration || '';
    dto.bus_bar_configuration = serverData.bus_bar_configuration || '';

    // 3. Relations
    // VoltageLevel cha
    if (serverData.voltageLevel) {
        dto.voltage_level = serverData.voltageLevel.mRID || serverData.voltageLevel.mrid || '';
    } else if (serverData.voltage_level) {
        dto.voltage_level = serverData.voltage_level;
    }

    // Substation (có thể có hoặc không)
    if (serverData.substation) {
        dto.substation = serverData.substation.mRID || serverData.substation.mrid || '';
    } else if (serverData.substationId) {
        dto.substation = serverData.substationId;
    }

    return dto;
};
