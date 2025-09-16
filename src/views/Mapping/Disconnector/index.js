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
    entity.asset.asset_info = dto.assetInfoId

    /** ================== attachment ================== */
    entity.attachment.mrid = dto.attachmentId || null
    entity.attachment.data = dto.attachment || null // giữ object raw nếu cần

    /** ================== lifecycle date ================== */
    entity.lifecycleDate.mrid = dto.lifecycleDateId || null
    entity.lifecycleDate.manufactured_date = dto.properties.manufacturing_year || null

    /** ================== assetPsr ================== */
    entity.assetPsr.mrid = dto.assetPsrId || null
    entity.assetPsr.psr_id = dto.psrId || null
    entity.assetPsr.asset_id = dto.properties.mrid || null

    entity.disconnectorInfo.mrid = dto.assetInfoId || null

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

    }
    console.log('entity', entity)
    return entity
}

export const disconnectorEntityToDto = (entity) => {
    const dto = new DisconnectorDto()

    //properties
    dto.properties.mrid = entity.asset.mrid || '';
    dto.properties.kind = entity.asset.kind || '';
    dto.properties.type = entity.asset.type || '';
    dto.properties.serial_no = entity.asset.serial_number || '';
    dto.assetInfoId = entity.asset.asset_info || '';
    dto.properties.manufacturer = entity.productAssetModel.manufacturer || '';
    dto.productAssetModelId = entity.productAssetModel.mrid || '';
    dto.properties.manufacturer_type = entity.asset.manufacturer_type || '';
    dto.properties.country_of_origin = entity.asset.country_of_origin || '';
    dto.properties.apparatus_id = entity.asset.name || '';
    dto.properties.comment = entity.asset.description || '';
    dto.locationId = entity.asset.location || '';
    dto.productAssetModelId = entity.asset.product_asset_model || '';

    // lifecycle date
    dto.lifecycleDateId = entity.asset.lifecycle_date || '';
    dto.properties.manufacturing_year = entity.lifecycleDate.manufactured_date || '';

    //assetPsr
    dto.assetPsrId = entity.assetPsr.mrid || '';
    dto.psrId = entity.assetPsr.psr_id || '';

    //attachment
    dto.attachmentId = entity.attachment.mrid || '';
    dto.attachment = entity.attachment;

    return dto;

}
