/* eslint-disable */
import * as SubstationMapper from '@/views/Mapping/Substation'

const toDisplayPower = (power, peak) => {
    if (!power || !power.mrid) {
        return { mrid: '', value: '', unit: peak ? 'MWp' : 'MW' }
    }
    const prefix = power.multiplier === 'k' ? 'k' : 'M'
    return {
        mrid: power.mrid,
        value: power.value == null ? '' : power.value,
        unit: `${prefix}W${peak ? 'p' : ''}`
    }
}

export function mapEntityToDto(entity) {
    const surrogate = {
        ...entity,
        substation: entity.powerPlant || {},
        personSubstation: {
            mrid: entity.personPowerPlant ? entity.personPowerPlant.mrid : '',
            person_id: entity.personPowerPlant ? entity.personPowerPlant.person_id : '',
            substation_id: entity.powerPlant ? entity.powerPlant.mrid : ''
        }
    }
    const dto = SubstationMapper.mapEntityToDto(surrogate)
    dto.type = entity.powerPlant && entity.powerPlant.plant_type
        ? entity.powerPlant.plant_type
        : ''
    return dto
}

export function mapEntityToCapacity(entity) {
    const units = Array.isArray(entity.generatingUnits) ? entity.generatingUnits : []
    return {
        plantType: entity.powerPlant && entity.powerPlant.plant_type
            ? entity.powerPlant.plant_type
            : '',
        acCapacity: toDisplayPower(entity.acCapacity, false),
        dcCapacity: toDisplayPower(entity.dcCapacity, true),
        generatingUnits: units.map((unit) => ({
            mrid: unit.mrid || '',
            quantity: unit.quantity == null ? '' : unit.quantity,
            acRatedPower: unit.nominalPower && unit.nominalPower.value != null
                ? unit.nominalPower.value
                : '',
            acUnit: unit.nominalPower && unit.nominalPower.multiplier === 'k' ? 'kW' : 'MW',
            dcRatedPower: unit.dcRatedPower && unit.dcRatedPower.value != null
                ? unit.dcRatedPower.value
                : '',
            dcUnit: unit.dcRatedPower && unit.dcRatedPower.multiplier === 'k' ? 'kWp' : 'MWp',
            nominalPowerId: unit.nominalPower ? unit.nominalPower.mrid || '' : '',
            dcRatedPowerId: unit.dcRatedPower ? unit.dcRatedPower.mrid || '' : '',
            userIdentifiedObjectId: unit.userIdentifiedObject
                ? unit.userIdentifiedObject.mrid || ''
                : ''
        }))
    }
}
