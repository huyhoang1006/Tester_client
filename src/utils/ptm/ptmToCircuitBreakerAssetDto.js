/* eslint-disable */
import uuid from '@/utils/uuid'

const str = (value) => (value === null || value === undefined) ? '' : String(value)

const entry = (asset, name) => asset && asset.raw ? asset.raw[name] : null

const hasValue = (value) => value !== '' && value !== null && value !== undefined

const scaledValue = (source, factor) => {
    if (!source || !hasValue(source.value)) return ''
    const numeric = Number(source.value)
    if (!Number.isFinite(numeric)) return str(source.value)
    return str(numeric * factor)
}

const normalizeTankType = (value) => {
    const normalized = str(value).replace(/[\s_-]/g, '').toLowerCase()
    if (normalized === 'livetank') return 'liveTank'
    if (normalized === 'deadtank') return 'deadTank'
    return value || ''
}

const inferAssetType = (mediumValue, tankValue) => {
    const medium = str(mediumValue).replace(/[\s_-]/g, '').toLowerCase()
    const tank = str(tankValue).replace(/[\s_-]/g, '').toLowerCase()
    if (medium === 'oil') return tank === 'deadtank' ? 'DeadTankOCB' : 'MiniOil'
    if (medium === 'air') return 'AirBlast'
    if (medium === 'vacuum') return 'Vacuum'
    if (medium.indexOf('sf6') === 0) return tank === 'deadtank' ? 'DeadTankSF6' : 'LiveSF6'
    return ''
}

const booleanValue = (value) => {
    const normalized = str(value).trim().toLowerCase()
    if (normalized === 'true') return true
    if (normalized === 'false') return false
    return ''
}

const componentRow = (name) => ({
    mrid: '',
    component: name,
    rated_voltage: { mrid: '', value: '', unit: 'V' },
    rated_current: { mrid: '', value: '', unit: 'A' },
    power: '',
    frequency: { mrid: '', value: '', unit: 'Hz' },
})

/**
 * Apply the Circuit Breaker nameplate and its Operating Mechanism from PTM.
 * Empty/NaN PTM values never erase existing client data.
 */
export const applyPtmToCircuitBreakerAssetDto = (dto, breakerAsset, operatingAsset) => {
    const applied = []
    const skipped = []

    const put = (target, key, value, label) => {
        if (!target || !hasValue(value)) return false
        const before = target[key]
        target[key] = value
        applied.push({ field: label, from: hasValue(before) ? str(before) : '(empty)', to: str(value) })
        return true
    }

    const putMeasure = (target, source, label, expectedUnit, factor) => {
        if (!target || !source || !hasValue(source.value)) return false
        const actualUnit = str(source.unit).trim()
        if (expectedUnit && actualUnit && expectedUnit.indexOf(actualUnit) < 0) {
            skipped.push({ field: label, reason: `unit mismatch - PTM says "${actualUnit}"` })
            return false
        }
        const value = scaledValue(source, factor === undefined ? 1 : factor)
        if (!hasValue(value)) return false
        const before = target.value
        target.value = value
        applied.push({ field: label, from: hasValue(before) ? str(before) : '(empty)', to: value })
        return true
    }

    put(dto.properties, 'serial_no', breakerAsset && breakerAsset.serialNumber, 'properties.serial_no')
    put(dto.properties, 'manufacturer', breakerAsset && breakerAsset.manufacturer, 'properties.manufacturer')
    put(dto.properties, 'manufacturer_type', breakerAsset && breakerAsset.manufacturerType, 'properties.manufacturer_type')
    put(dto.properties, 'manufacturer_year', breakerAsset && breakerAsset.manufacturingYear, 'properties.manufacturer_year')
    put(dto.properties, 'comment', breakerAsset && breakerAsset.comment, 'properties.comment')
    put(dto.properties, 'apparatus_id', breakerAsset && (breakerAsset.apparatusId || breakerAsset.assetSystemCode), 'properties.apparatus_id')
    dto.properties.kind = 'Circuit breaker'

    const raw = (breakerAsset && breakerAsset.raw) || {}
    const phaseCount = entry(breakerAsset, 'NumberOfPhases')
    const interrupters = entry(breakerAsset, 'NumberOfInterruptersPerPhase')
    if (phaseCount && hasValue(phaseCount.value)) put(dto.circuitBreaker, 'numberOfPhases', Number(phaseCount.value), 'circuitBreaker.numberOfPhases')
    put(dto.circuitBreaker, 'phase', breakerAsset && breakerAsset.phase, 'circuitBreaker.phase')
    if (interrupters && hasValue(interrupters.value)) put(dto.circuitBreaker, 'interruptersPerPhase', Number(interrupters.value), 'circuitBreaker.interruptersPerPhase')
    put(dto.circuitBreaker, 'poleOperation', raw.PoleOperationType && raw.PoleOperationType.value, 'circuitBreaker.poleOperation')
    put(dto.circuitBreaker, 'interruptingMedium', raw.InterruptingMedium && raw.InterruptingMedium.value, 'circuitBreaker.interruptingMedium')
    put(dto.circuitBreaker, 'tankType', normalizeTankType(raw.TankType && raw.TankType.value), 'circuitBreaker.tankType')
    put(dto.circuitBreaker, 'hasPIR', booleanValue(raw.PreInsertionResistor && raw.PreInsertionResistor.value), 'circuitBreaker.hasPIR')
    put(dto.circuitBreaker, 'hasGradingCapacitors', booleanValue(raw.GradingCapacitor && raw.GradingCapacitor.value), 'circuitBreaker.hasGradingCapacitors')

    const inferredType = inferAssetType(
        raw.InterruptingMedium && raw.InterruptingMedium.value,
        raw.TankType && raw.TankType.value
    )
    put(dto.properties, 'type', inferredType, 'properties.type')

    const ratedFrequency = entry(breakerAsset, 'RatedFrequency')
    if (ratedFrequency && hasValue(ratedFrequency.value)) {
        const value = str(ratedFrequency.value)
        if (['50', '60', '16.7'].includes(value)) {
            putMeasure(dto.ratings.rated_frequency, ratedFrequency, 'ratings.rated_frequency', ['Hz'], 1)
        } else {
            put(dto.ratings.rated_frequency, 'value', 'Custom', 'ratings.rated_frequency')
            putMeasure(dto.ratings.rated_frequency_custom, ratedFrequency, 'ratings.rated_frequency_custom', ['Hz'], 1)
        }
    }
    putMeasure(dto.ratings.rated_voltage_ll, entry(breakerAsset, 'RatedVoltage'), 'ratings.rated_voltage_ll', ['V'], 0.001)
    putMeasure(dto.ratings.rated_current, entry(breakerAsset, 'RatedCurrent'), 'ratings.rated_current', ['A'], 1)
    putMeasure(dto.ratings.rated_short_circuit_breaking_current, entry(breakerAsset, 'RatedShortCircuitBreakingCurrent'), 'ratings.rated_short_circuit_breaking_current', ['A'], 0.001)
    putMeasure(dto.ratings.short_circuit_nominal_duration, entry(breakerAsset, 'ShortCircuitNominalDuration'), 'ratings.short_circuit_nominal_duration', ['s'], 1)
    putMeasure(dto.ratings.rated_insulation_level, entry(breakerAsset, 'RatedImpulseWithstandVoltage'), 'ratings.rated_insulation_level', ['V'], 0.001)
    putMeasure(dto.ratings.rated_interrupting_time, entry(breakerAsset, 'RatedInterruptingTime'), 'ratings.rated_interrupting_time', ['s'], 1000)
    put(dto.ratings, 'interrupting_duty_cycle', raw.InterruptingDutyCycle && raw.InterruptingDutyCycle.value, 'ratings.interrupting_duty_cycle')
    putMeasure(dto.ratings.rated_power_at_closing, entry(breakerAsset, 'RatedPowerAtClosing'), 'ratings.rated_power_at_closing', ['W'], 1)
    putMeasure(dto.ratings.rated_power_at_opening, entry(breakerAsset, 'RatedPowerAtOpening'), 'ratings.rated_power_at_opening', ['W'], 1)
    putMeasure(dto.ratings.rated_power_at_motor_charge, entry(breakerAsset, 'RatedPowerAtMotorCharge'), 'ratings.rated_power_at_motor_charge', ['W'], 1)

    putMeasure(dto.circuitBreaker.pirValue, entry(breakerAsset, 'PIRValue'), 'circuitBreaker.pirValue', ['Ohm'], 1)
    putMeasure(dto.circuitBreaker.capacitorValue, entry(breakerAsset, 'CapacitorsValue'), 'circuitBreaker.capacitorValue', ['Farad'], 1e12)
    putMeasure(dto.contactSystem.nominal_total_travel, entry(breakerAsset, 'NominalStroke'), 'contactSystem.nominal_total_travel', ['m'], 1000)
    putMeasure(dto.contactSystem.damping_time, entry(breakerAsset, 'DampingTime'), 'contactSystem.damping_time', ['s'], 1000)
    putMeasure(dto.contactSystem.nozzle_length, entry(breakerAsset, 'NozzleLength'), 'contactSystem.nozzle_length', ['m'], 1000)
    putMeasure(dto.others.total_weight_with_gas, entry(breakerAsset, 'TotalWeightWithOilGas'), 'others.total_weight_with_gas', ['kg'], 1)
    putMeasure(dto.others.weight_of_gas, entry(breakerAsset, 'WeightOfOilGas'), 'others.weight_of_gas', ['kg'], 1)
    putMeasure(dto.others.volume_of_gas, entry(breakerAsset, 'VolumeOfOilGas'), 'others.volume_of_gas', ['l'], 1)
    putMeasure(dto.others.rated_gas_pressure, entry(breakerAsset, 'RatedGasPressure'), 'others.rated_gas_pressure', ['Pascal', 'Pa'], 1)
    putMeasure(dto.others.rated_gas_temperature, entry(breakerAsset, 'RatedGasPressureTemperature'), 'others.rated_gas_temperature', ['C', '°C'], 1)

    if (operatingAsset) {
        const operatingRaw = operatingAsset.raw || {}
        put(dto.operating, 'type', operatingRaw.Type && operatingRaw.Type.value, 'operating.type')
        put(dto.operating, 'serial_no', operatingAsset.serialNumber, 'operating.serial_no')
        put(dto.operating, 'manufacturer', operatingAsset.manufacturer, 'operating.manufacturer')
        put(dto.operating, 'manufacturer_type', operatingAsset.manufacturerType, 'operating.manufacturer_type')
        put(dto.operating, 'manufacturer_year', operatingAsset.manufacturingYear, 'operating.manufacturer_year')
        put(dto.operating, 'comment', operatingAsset.comment, 'operating.comment')

        const tripCountEntry = entry(operatingAsset, 'NumberOfTripCoils')
        const closeCountEntry = entry(operatingAsset, 'NumberOfCloseCoils')
        const tripCount = tripCountEntry && hasValue(tripCountEntry.value) ? Number(tripCountEntry.value) : 0
        const closeCount = closeCountEntry && hasValue(closeCountEntry.value) ? Number(closeCountEntry.value) : 0
        if (tripCount > 0) put(dto.operating, 'number_of_trip_coil', tripCount, 'operating.number_of_trip_coil')
        if (closeCount > 0) put(dto.operating, 'number_of_close_coil', closeCount, 'operating.number_of_close_coil')

        putMeasure(dto.operating.rated_operating_pressure, entry(operatingAsset, 'RatedOperatingPressure'), 'operating.rated_operating_pressure', ['Pascal', 'Pa'], 1)
        putMeasure(dto.operating.rated_operating_pressure_temperature, entry(operatingAsset, 'RatedOperatingPressureTemperature'), 'operating.rated_operating_pressure_temperature', ['C', '°C'], 1)

        const tripRows = []
        const closeRows = []
        const components = operatingAsset.components || []
        for (const component of components) {
            const componentType = str(component.componentType).replace(/[\s_-]/g, '').toLowerCase()
            let target = null
            if (componentType === 'tripcoil') {
                target = componentRow(`Trip coil ${tripRows.length + 1}`)
                tripRows.push(target)
            } else if (componentType === 'closecoil') {
                target = componentRow(`Close coil ${closeRows.length + 1}`)
                closeRows.push(target)
            } else if (componentType === 'auxiliarycircuits') {
                target = dto.operating.auxiliary_circuits
            } else if (componentType === 'motor') {
                target = dto.operating.motor
            }
            if (!target) continue
            putMeasure(target.rated_voltage, component.ratedVoltage, `${target.component}.rated_voltage`, ['V'], 1)
            putMeasure(target.rated_current, component.ratedCurrent, `${target.component}.rated_current`, ['A'], 1)
            putMeasure(target.frequency, component.ratedFrequency, `${target.component}.frequency`, ['Hz'], 1)
            put(target, 'power', component.ac ? 'AC' : 'DC', `${target.component}.power`)
        }

        while (tripRows.length < tripCount) tripRows.push(componentRow(`Trip coil ${tripRows.length + 1}`))
        while (closeRows.length < closeCount) closeRows.push(componentRow(`Close coil ${closeRows.length + 1}`))
        if (tripRows.length > 0) dto.operating.trip_coil_component = tripRows
        if (closeRows.length > 0) dto.operating.close_coil_component = closeRows
    }

    return { dto, applied, skipped }
}

export const ensureCircuitBreakerDtoIds = (dto) => {
    const topLevelIds = [
        'assetInfoId',
        'productAssetModelId',
        'lifecycleDateId',
        'assetPsrId',
        'operatingMechanismId',
        'operatingMechanismInfoId',
        'operatingMechanismLifecycleDateId',
        'operatingMechanismProductAssetModelId',
        'assessmentLimitBreakerInfoId',
        'breakerRatingInfoId',
        'breakerContactSystemInfoId',
        'breakerOtherInfoId',
    ]
    for (const key of topLevelIds) {
        if (!dto[key]) dto[key] = uuid.newUuid()
    }
    if (!dto.properties.mrid) dto.properties.mrid = uuid.newUuid()

    const fill = (value) => {
        if (Array.isArray(value)) {
            value.forEach(fill)
        } else if (value && typeof value === 'object') {
            if (Object.prototype.hasOwnProperty.call(value, 'mrid') && !value.mrid) {
                value.mrid = uuid.newUuid()
            }
            Object.keys(value).forEach(key => fill(value[key]))
        }
    }
    fill(dto)
    return dto
}

export default { applyPtmToCircuitBreakerAssetDto, ensureCircuitBreakerDtoIds }
