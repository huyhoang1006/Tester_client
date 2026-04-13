import BayDto from "@/views/Dto/Bay";

export const mapServerToDto = (serverData) => {
    const dto = new BayDto();
    if (!serverData) return dto;

    // 1. Identification
    dto.bayId     = serverData.mRID      || serverData.mrid || '';
    dto.name      = serverData.name      || '';
    dto.aliasName = serverData.aliasName || serverData.shortName || serverData.name || '';

    // 2. Bay specific — JSON dùng camelCase
    dto.bay_energy_meas_flag   = serverData.bayEnergyMeasFlag   ?? '';
    dto.bay_power_meas_flag    = serverData.bayPowerMeasFlag    ?? '';
    dto.breaker_configuration  = serverData.breakerConfiguration || '';
    dto.bus_bar_configuration  = serverData.busBarConfiguration  || '';

    // 3. Relations — DTO dùng '', entity/DB dùng null
    dto.voltage_level = serverData.voltageLevel?.mRID
        || serverData.voltageLevel?.mrid
        || serverData.voltage_level
        || null

    dto.substation = serverData.substation?.mRID
        || serverData.substation?.mrid
        || serverData.substationId
        || null

    return dto;
};