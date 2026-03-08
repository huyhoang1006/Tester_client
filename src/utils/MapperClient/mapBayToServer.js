export const mapBayEntityToServer = (entity) => {
    if (!entity) return null

    const serverData = {
        mRID: entity.mrid || null,
        name: entity.name || '',
        aliasName: entity.alias_name || '',
        description: entity.description || '',
        bayEnergyMeasFlag: entity.bay_energy_meas_flag || false,
        bayPowerMeasFlag: entity.bay_power_meas_flag || false,
        breakerConfiguration: entity.breaker_configuration || '',
        busBarConfiguration: entity.bus_bar_configuration || '',
        psrType: null,
        assetDatasheet: null,
        location: null
    }

    return serverData
}
