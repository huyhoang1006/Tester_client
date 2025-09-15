import DisconnectorEntity from '@/views/Entity/Disconnector'
import DisconnectorDto from '@/views/Dto/Disconnector'
import Voltage from '@/views/Cim/Voltage'
import Frequency from '@/views/Cim/Frequency'
import CurrentFlow from '@/views/Cim/CurrentFlow'
import Seconds from '@/views/Cim/Seconds'

/**
 * Helper để map đơn vị đo (đơn vị đo là các đơn vị như Voltage, Frequency, CurrentFlow, Seconds)
 */
const mappingUnit = (map, unitDto) => {
    if (!map || !unitDto) return

    map.mrid = unitDto.mrid || null
    map.value = unitDto.value || null

    const unitParts = (unitDto.unit || '').split('|') // ví dụ: "k|V"
    map.multiplier = unitParts.length > 1 ? unitParts[0] : null
    map.unit = unitParts.length > 1 ? unitParts[1] : unitParts[0] || null
}

/**
 * ================ Dto -> Entity ================
 */
export const disconnectorDtoToEntity = (dto) => {
    const entity = new DisconnectorEntity()

    if (!dto) return entity

    /** ================== properties ================== */
    entity.asset.mrid = dto.properties.mrid || null
    entity.asset.kind = dto.properties.kind || null
    entity.asset.type = dto.properties.type || null
    entity.asset.serial_number = dto.properties.serial_no || null
    entity.asset.asset_info = dto.assetInfoId || null

    entity.productAssetModel.manufacturer = dto.properties.manufacturer || null
    entity.asset.manufacturer_type = dto.properties.manufacturer_type || null
    entity.asset.country_of_origin = dto.properties.country_of_origin || null
    entity.asset.name = dto.properties.apparatus_id || null
    entity.asset.description = dto.properties.comment || null
    entity.productAssetModel.mrid = dto.productAssetModelId || null
    entity.asset.location = dto.locationId || null
    entity.asset.product_asset_model = dto.productAssetModelId || null

    /** ================== attachment ================== */
    entity.attachment.mrid = dto.attachmentId || null
    entity.attachment.data = dto.attachment || null // giữ object raw nếu cần

    /** ================== lifecycle date ================== */
    entity.lifecycleDate.mrid = dto.lifecycleDateId || null
    entity.lifecycleDate.manufactured_date = dto.properties.manufacturing_year || null

    /** ================== assetPsr ================== */
    entity.assetPsr.mrid = dto.assetPsrId || null
    entity.assetPsr.psr_id = dto.psrId || null
    entity.assetPsr.asset_id = dto.assetInfoId || null

    /** ================== Ratings ================== */
    if (dto.ratings) {
        // Voltage
        if (dto.ratings.rated_voltage) {
            entity.disconnectorInfo.rated_voltage = dto.ratings.rated_voltage.mrid || null
            const newVoltage = new Voltage()
            mappingUnit(newVoltage, dto.ratings.rated_voltage)
            entity.voltage.push(newVoltage)
        }

        // Frequency
        if (dto.ratings.rated_frequency) {
            entity.disconnectorInfo.rated_frequency = dto.ratings.rated_frequency.mrid || null
            const newFreq = new Frequency()
            mappingUnit(newFreq, dto.ratings.rated_frequency)
            entity.frequency.push(newFreq)
        }

        // Current
        if (dto.ratings.rated_current) {
            entity.disconnectorInfo.rated_current = dto.ratings.rated_current.mrid || null
            const newCurrent = new CurrentFlow()
            mappingUnit(newCurrent, dto.ratings.rated_current)
            entity.currentFlow.push(newCurrent)
        }

        // Short-time withstand current
        if (dto.ratings.short_time_withstand_current) {
            entity.disconnectorInfo.short_time_withstand_current = dto.ratings.short_time_withstand_current.mrid || null
            const newShortTime = new CurrentFlow()
            mappingUnit(newShortTime, dto.ratings.short_time_withstand_current)
            entity.currentFlow.push(newShortTime)
        }

        // Rated duration of short circuit
        if (dto.ratings.rated_duration_of_short_circuit) {
            entity.disconnectorInfo.rated_duration_short_circuit = dto.ratings.rated_duration_of_short_circuit.mrid || null
            const newDuration = new Seconds()
            mappingUnit(newDuration, dto.ratings.rated_duration_of_short_circuit)
            entity.seconds.push(newDuration)
        }

        // Withstand voltage earth poles
        if (dto.ratings.power_freq_withstand_voltage_earth_poles) {
            entity.disconnectorInfo.withstand_voltage_earth_poles = dto.ratings.power_freq_withstand_voltage_earth_poles.mrid || null
            const newWithstand = new Voltage()
            mappingUnit(newWithstand, dto.ratings.power_freq_withstand_voltage_earth_poles)
            entity.voltage.push(newWithstand)
        }

        // Power frequency isolating distance (DB expects FK to frequency)
        // Map to rated_frequency.mrid to satisfy FK constraint to table `frequency`
        if (dto.ratings.rated_frequency) {
            entity.disconnectorInfo.power_frequency_isolating_distance = dto.ratings.rated_frequency.mrid || null
        }

        entity.disconnectorInfo.mrid = dto.properties.mrid || null

    }
    console.log('entity', entity)
    return entity
}

export const disconnectorEntityToDto = (entity) => {
    const dto = new DisconnectorDto()

    // properties
    entity.properties.mrid = dto.properties.mrid || null
    entity.properties.kind = dto.properties.kind || null
    entity.properties.type = dto.properties.type || null
    entity.properties.serial_number = dto.properties.serial_no || null // serial_no là serial_number trong entity
    entity.properties.asset_info = dto.oldSurgeArresterInfoId || null // assetInfoId là asset_info trong entity
    entity.properties.manufacturer = dto.properties.manufacturer || null
    entity.properties.manufacturer_type = dto.properties.manufacturer_type || null
    entity.properties.country_of_origin = dto.properties.country_of_origin || null
    entity.properties.name = dto.properties.apparatus_id || null
    entity.properties.description = dto.properties.comment || null
    entity.properties.unit_count = dto.ratings.unitStack || null
    entity.properties.mrid = dto.productAssetModelId || null
    entity.properties.location = dto.locationId || null
    entity.properties.product_asset_model = dto.productAssetModelId || null

    // lifecycle date
    entity.lifecycleDate.manufactured_date = dto.properties.manufacturering_year || null
    entity.lifecycleDate.mrid = dto.lifecycleDateId || null // lifecycleDateId là mrid của lifecycleDate trong entity
    entity.lifecycleDate.lifecycle_date = dto.lifecycleDateId || null

    //assetPsr
    entity.assetPsr.mrid = dto.assetPsrId || null
    entity.assetPsr.asset_id = dto.properties.mrid || null
    entity.assetPsr.psr_id = dto.psrId || null

    // ratings
    for (let voltage of entity.voltage) {
        if (voltage.mrid) {
            dto.ratings.rated_voltage = {
                mrid: voltage.mrid,
                value: voltage.value,
                unit: (voltage.multiplier ? voltage.multiplier + '|' : '') + (voltage.unit || '')
            }
        }
    }

    for (let frequency of entity.frequency) {
        if (frequency.mrid) {
            dto.ratings.rated_frequency = {
                mrid: frequency.mrid,
                value: frequency.value,
                unit: (frequency.multiplier ? frequency.multiplier + '|' : '') + (frequency.unit || '')
            }
        }
    }

    for (let current of entity.currentFlow) {
        if (current.mrid) {
            dto.ratings.rated_current = {
                mrid: current.mrid,
                value: current.value,
                unit: (current.multiplier ? current.multiplier + '|' : '') + (current.unit || '')
            }
        }
    }

    for (let seconds of entity.seconds) {
        if (seconds.mrid) {
            dto.ratings.rated_duration_of_short_circuit = {
                mrid: seconds.mrid,
                value: seconds.value,
                unit: (seconds.multiplier ? seconds.multiplier + '|' : '') + (seconds.unit || '')
            }
        }
    }

    return dto
}
