/* eslint-disable */
import uuid from '@/utils/uuid'
import OldTransformerEndInfo from '@/views/Cim/OldTransformerEndInfo'

const str = value => value === null || value === undefined ? '' : String(value)

const numericValue = measurement => {
    const value = measurement && typeof measurement === 'object' && 'value' in measurement
        ? measurement.value
        : measurement
    if (value === '' || value === null || value === undefined) return null
    const number = Number(value)
    return Number.isFinite(number) ? number : null
}

const setWhenPresent = (target, key, value, applied, label) => {
    if (value === '' || value === null || value === undefined) return
    target[key] = value
    applied.push(label || key)
}

const voltageRating = (winding, label) => {
    const volts = numericValue(winding.voltageRated)
    const lineNeutralVolts = numericValue(winding.voltageLn)
    const insulationVolts = numericValue(winding.insulationLevel)
    return {
        mrid: '',
        winding: label,
        voltage_ll: { mrid: '', value: volts === null ? '' : str(volts / 1000), unit: 'k|V' },
        voltage_ln: { mrid: '', value: lineNeutralVolts === null ? '' : str(lineNeutralVolts / 1000), unit: 'k|V' },
        insul_level_ll: { mrid: '', value: insulationVolts === null ? '' : str(insulationVolts / 1000), unit: 'k|V' },
        voltage_regulation: '',
        insulation_class: '',
    }
}

const currentCell = rating => ({
    mrid: '',
    data: {
        mrid: '',
        value: rating && numericValue(rating.currentRated) !== null
            ? str(numericValue(rating.currentRated))
            : '',
        unit: 'A',
    },
})

const windingLabel = index => ['Prim', 'Sec', 'Tert'][index] || `Winding ${index + 1}`

const buildRatings = profile => {
    const windings = profile.windings || []
    const voltageRatings = windings.slice(0, 3).map((winding, index) => voltageRating(winding, windingLabel(index)))
    if (Array.isArray(profile.powerRatings) && profile.powerRatings.length > 0) {
        const powerRatings = profile.powerRatings.map(rating => {
            const ratedPower = numericValue(rating.powerRated)
            const fallbackPower = numericValue(profile.impedanceBasePower)
            const va = ratedPower === null ? fallbackPower : ratedPower
            return {
                mrid: '',
                rated_power: { mrid: '', value: va === null ? '' : str(va / 1000000), unit: 'M|VA' },
                cooling_class: rating.coolingClass || profile.usedCoolingClass || '',
                temp_rise_wind: {
                    mrid: '',
                    value: numericValue(rating.temperatureRiseWinding) === null
                        ? ''
                        : str(numericValue(rating.temperatureRiseWinding)),
                    unit: '°C',
                },
            }
        })
        const currentRatings = profile.powerRatings.map(rating => ({
            mrid: '',
            prim: currentCell({ currentRated: rating.currentRatedPrimary }),
            sec: currentCell({ currentRated: rating.currentRatedSecondary }),
            tert: currentCell({ currentRated: rating.currentRatedTertiary }),
        }))
        return { voltageRatings, powerRatings, currentRatings }
    }

    const ratingCount = windings.reduce(
        (maximum, winding) => Math.max(maximum, (winding.powerRatings || []).length), 0
    )
    const powerRatings = []
    const currentRatings = []

    for (let index = 0; index < ratingCount; index++) {
        const ratings = windings.map(winding => (winding.powerRatings || [])[index] || null)
        const base = ratings.find(Boolean)
        const va = base ? numericValue(base.powerRated) : null
        powerRatings.push({
            mrid: '',
            rated_power: { mrid: '', value: va === null ? '' : str(va / 1000000), unit: 'M|VA' },
            cooling_class: (base && base.coolingClass) || profile.usedCoolingClass || '',
            temp_rise_wind: { mrid: '', value: '', unit: '°C' },
        })
        currentRatings.push({
            mrid: '',
            prim: currentCell(ratings[0]),
            sec: currentCell(ratings[1]),
            tert: currentCell(ratings[2]),
        })
    }

    return { voltageRatings, powerRatings, currentRatings }
}

const impedanceMeasurement = (measurement, divisor, unit) => {
    const value = numericValue(measurement)
    return { mrid: '', value: value === null ? '' : str(value / divisor), unit }
}

const nestedImpedanceMeasurement = (measurement, divisor, unit) => ({
    mrid: '',
    data: impedanceMeasurement(measurement, divisor, unit),
})

const applyImpedances = (dto, profile, applied) => {
    const referenceTemperature = numericValue(profile.impedanceReferenceTemperature)
    if (referenceTemperature !== null) {
        dto.impedances.ref_temp.value = str(referenceTemperature)
        dto.impedances.ref_temp.unit = '°C'
    }

    const positionMap = {
        PrimSec: 'prim_sec',
        PrimTert: 'prim_tert',
        SecTert: 'sec_tert',
    }
    const importedImpedances = {}
    let impedanceCount = 0
    ;(profile.shortCircuitImpedances || []).forEach(source => {
        const key = positionMap[source.position]
        if (!key) return
        importedImpedances[key] = importedImpedances[key] || []
        importedImpedances[key].push({
            mrid: uuid.newUuid(),
            short_circuit_impedances_uk: impedanceMeasurement(source.uk, 1, '%'),
            base_power: nestedImpedanceMeasurement(source.basePower, 1000, 'k|VA'),
            base_voltage: nestedImpedanceMeasurement(source.baseVoltage, 1000, 'k|V'),
            load_losses_pk: impedanceMeasurement(source.loadLosses, 1, 'W'),
            oltc_position: source.oltcPosition || '',
            detc_position: source.detcPosition || '',
        })
        impedanceCount += 1
    })
    Object.keys(importedImpedances).forEach(key => {
        dto.impedances[key] = importedImpedances[key]
    })

    const zero = dto.impedances.zero_sequence_impedance
    const basePower = numericValue(profile.impedanceBasePower)
    const baseVoltage = numericValue(profile.impedanceBaseVoltage)
    if (basePower !== null) {
        zero.base_power.data.value = str(basePower / 1000)
        zero.base_power.data.unit = 'k|VA'
    }
    if (baseVoltage !== null) {
        zero.base_voltage.data.value = str(baseVoltage / 1000)
        zero.base_voltage.data.unit = 'k|V'
    }
    ;(profile.zeroSequenceImpedances || []).forEach(source => {
        const key = { Prim: 'prim', Sec: 'sec' }[source.winding] || 'zero'
        const value = numericValue(source.value)
        if (value !== null) zero.zero_percent[key].data.value = str(value)
    })

    if (referenceTemperature !== null || impedanceCount > 0 || (profile.zeroSequenceImpedances || []).length > 0) {
        applied.push('impedances')
    }
}

const applyVectorGroup = (dto, profile, applied) => {
    const windings = profile.windings || []
    const vector = dto.winding_configuration.vector_group
    if (windings[0] && windings[0].configuration) vector.prim = windings[0].configuration
    if (windings[1]) {
        vector.sec.i = windings[1].configuration || ''
        vector.sec.value = windings[1].phaseShift || ''
    }
    if (windings[2]) {
        vector.tert.i = windings[2].configuration || ''
        vector.tert.value = windings[2].phaseShift || ''
    }
    if (profile.vectorGroup || windings.some(winding => winding.configuration)) {
        dto.winding_configuration.vector_group_data = profile.vectorGroup || 'configured'
        dto.winding_configuration.vector_group_custom = ''
        dto.winding_configuration.unsupported_vector_group = ''
        applied.push('vector group')
    }
}

const applyTapChanger = (dto, profile, applied) => {
    const index = (profile.windings || []).findIndex(winding => winding.tapChanger)
    if (index < 0) return
    const source = profile.windings[index].tapChanger
    dto.tap_changers.mode = str(source.type).toLowerCase()
    dto.tap_changers.winding = windingLabel(index)
    dto.tap_changers.tap_scheme = source.tapScheme || ''
    dto.tap_changers.no_of_taps = str((source.taps || []).length)
    dto.tap_changers.voltage_table = (source.taps || []).map(tap => ({
        id: uuid.newUuid(),
        tap: tap.name || str(tap.listIndex + 1),
        voltage: {
            mrid: uuid.newUuid(),
            value: tap.voltageRated && tap.voltageRated.value !== undefined
                ? str(tap.voltageRated.value)
                : '',
            unit: 'V',
        },
    }))
    applied.push('tap changer')
}

export const applyPtmToTransformerAssetDto = (dto, asset) => {
    const applied = []
    const profile = asset.transformerProfile || {}
    const windings = profile.windings || []

    setWhenPresent(dto.properties, 'serial_no', asset.serialNumber, applied, 'serial number')
    setWhenPresent(dto.properties, 'manufacturer', asset.manufacturer, applied, 'manufacturer')
    setWhenPresent(dto.properties, 'manufacturer_type', asset.manufacturerType, applied, 'manufacturer type')
    setWhenPresent(dto.properties, 'manufacturer_year', asset.manufacturingYear, applied, 'manufacturing year')
    setWhenPresent(dto.properties, 'apparatus_id', asset.apparatusId || asset.serialNumber, applied, 'apparatus id')
    setWhenPresent(dto.properties, 'comment', asset.comment, applied, 'comment')

    const isAuto = !!profile.isAutotransformer
    dto.properties.type = isAuto
        ? (windings.length >= 3 ? 'Auto w/ tert' : 'Auto w/o tert')
        : (windings.length >= 3 ? 'Three-winding' : 'Two-winding')
    applied.push('transformer type')

    setWhenPresent(dto.winding_configuration, 'phases', profile.numberOfPhases, applied, 'number of phases')
    setWhenPresent(dto.winding_configuration, 'phase', asset.phase, applied, 'phase')
    applyVectorGroup(dto, profile, applied)

    const frequency = numericValue(profile.frequencyRated)
    if (frequency !== null) {
        dto.ratings.rated_frequency.value = str(frequency)
        dto.ratings.rated_frequency.custom_value = ''
        dto.ratings.rated_frequency.unit = 'Hz'
        applied.push('rated frequency')
    }

    if (windings.length > 0) {
        const ratings = buildRatings(profile)
        dto.ratings.voltage_ratings = ratings.voltageRatings
        dto.ratings.power_ratings = ratings.powerRatings
        dto.ratings.current_ratings = ratings.currentRatings
        applied.push('winding ratings')
    }

    const insulationMedium = { Oil: 'Mineral oil' }[profile.insulationMedium] || profile.insulationMedium
    const tankType = { FreeBreathing: 'Free breathing' }[profile.tankType] || profile.tankType
    dto.others.category = profile.category || dto.others.category
    dto.others.status = profile.status || dto.others.status
    dto.others.insulation_medium = insulationMedium || dto.others.insulation_medium
    dto.others.tank_type = tankType || dto.others.tank_type
    const fluidWeight = numericValue(profile.fluidWeight)
    const fluidVolume = numericValue(profile.fluidVolume)
    const totalWeight = numericValue(profile.totalWeight)
    if (fluidWeight !== null) {
        dto.others.insulation.key = 'Weight'
        dto.others.insulation.weight.value = str(fluidWeight)
    } else if (fluidVolume !== null) {
        dto.others.insulation.key = 'Volume'
        dto.others.insulation.volume.value = str(fluidVolume)
    }
    if (totalWeight !== null) dto.others.total_weight.value = str(totalWeight)
    windings.slice(0, 3).forEach((winding, index) => {
        const key = ['prim', 'sec', 'tert'][index]
        if (key && winding.conductorMaterial) dto.others.winding[key] = winding.conductorMaterial
    })
    applyTapChanger(dto, profile, applied)
    applyImpedances(dto, profile, applied)

    return { applied, skipped: [] }
}

export const applyCpxpertToTransformerAssetDto = applyPtmToTransformerAssetDto

const fillMrids = object => {
    if (Array.isArray(object)) {
        object.forEach(fillMrids)
        return
    }
    if (!object || typeof object !== 'object') return
    if ('mrid' in object && !object.mrid) object.mrid = uuid.newUuid()
    Object.keys(object).forEach(key => fillMrids(object[key]))
}

export const ensureTransformerDtoIds = dto => {
    if (!dto.properties.mrid) dto.properties.mrid = uuid.newUuid()
    if (!dto.oldPowerTransformerInfoId) dto.oldPowerTransformerInfoId = uuid.newUuid()
    if (!dto.productAssetModelId) dto.productAssetModelId = uuid.newUuid()
    if (!dto.lifecycleDateId) dto.lifecycleDateId = uuid.newUuid()
    if (!dto.assetPsrId) dto.assetPsrId = uuid.newUuid()

    const endCount = dto.properties.type === 'Three-winding' || dto.properties.type === 'Auto w/ tert' ? 3 : 2
    if (!Array.isArray(dto.oldTransformerEndInfo)) dto.oldTransformerEndInfo = []
    while (dto.oldTransformerEndInfo.length < endCount) {
        const end = new OldTransformerEndInfo()
        end.mrid = uuid.newUuid()
        end.end_number = dto.oldTransformerEndInfo.length + 1
        dto.oldTransformerEndInfo.push(end)
    }
    if (dto.oldTransformerEndInfo.length > endCount) dto.oldTransformerEndInfo.splice(endCount)

    fillMrids(dto.ratings)
    fillMrids(dto.impedances)
    fillMrids(dto.others)
    fillMrids(dto.oldTransformerEndInfo)
    fillMrids(dto.bushing_data)
    fillMrids(dto.surge_arrester)
    const shortCircuitRelations = dto.shortCircuitTestTransformerEndInfo || []
    ;['prim_sec', 'prim_tert', 'sec_tert'].forEach(key => {
        ;(dto.impedances[key] || []).forEach(item => {
            if (shortCircuitRelations.some(relation => relation.short_circuit_test_id === item.mrid)) return
            shortCircuitRelations.push({
                mrid: uuid.newUuid(),
                short_circuit_test_id: item.mrid,
                transformer_end_info_id: '',
            })
        })
    })
    dto.shortCircuitTestTransformerEndInfo = shortCircuitRelations
    if (dto.tap_changers && dto.tap_changers.mode) {
        fillMrids(dto.tap_changers)
        if (!dto.tap_changers.assetInfoId) dto.tap_changers.assetInfoId = uuid.newUuid()
        if (!dto.tap_changers.productAssetModelId) dto.tap_changers.productAssetModelId = uuid.newUuid()
    }
    return dto
}

export default { applyPtmToTransformerAssetDto, applyCpxpertToTransformerAssetDto, ensureTransformerDtoIds }
