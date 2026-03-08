export const mapVoltageLevelEntityToServer = (entity) => {
    if (!entity) return null

    const voltageLevel = entity.voltageLevel || {}
    const baseVoltage = entity.baseVoltage || {}
    const voltages = entity.voltage || []

    const highVoltage = voltages.find(v => v.mrid === voltageLevel.high_voltage_limit) || {}
    const lowVoltage = voltages.find(v => v.mrid === voltageLevel.low_voltage_limit) || {}
    const nominalVoltage = voltages.find(v => v.mrid === baseVoltage.nominal_voltage) || {}

    const serverData = {
        mRID: voltageLevel.mrid || null,
        name: voltageLevel.name || '',
        aliasName: voltageLevel.alias_name || '',
        description: voltageLevel.description || '',
        type: voltageLevel.type || '',
        psrType: null,
        assetDatasheet: null,
        location: null,
        highVoltageLimit: highVoltage.mrid ? {
            mRID: highVoltage.mrid || null,
            value: highVoltage.value || null,
            unit: highVoltage.unit || null,
            multiplier: highVoltage.multiplier || null
        } : null,
        lowVoltageLimit: lowVoltage.mrid ? {
            mRID: lowVoltage.mrid || null,
            value: lowVoltage.value || null,
            unit: lowVoltage.unit || null,
            multiplier: lowVoltage.multiplier || null
        } : null,
        baseVoltage: baseVoltage.mrid ? {
            mRID: baseVoltage.mrid || null,
            nominalVoltage: nominalVoltage.mrid ? {
                mRID: nominalVoltage.mrid || null,
                value: nominalVoltage.value || null,
                unit: nominalVoltage.unit || null,
                multiplier: nominalVoltage.multiplier || null
            } : null
        } : null,
        status: null,
        persons: []
    }

    return serverData
}
