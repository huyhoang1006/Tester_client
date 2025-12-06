import DisconnectorEntity from '@/views/Flatten/Disconnector'
import DisconnectorDto from '@/views/Dto/Disconnector'
import Voltage from '@/views/Cim/Voltage'
import Frequency from '@/views/Cim/Frequency'
import CurrentFlow from '@/views/Cim/CurrentFlow'
import Seconds from '@/views/Cim/Seconds'
import uuid from '@/utils/uuid'

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
    if (dto.attachment && dto.attachment.path) {
        // nếu path là object array thì stringify, nếu đã là string thì giữ nguyên
        entity.attachment.path = typeof dto.attachment.path === 'string'
            ? dto.attachment.path
            : JSON.stringify(dto.attachment.path)
    }

    /** ================== lifecycle date ================== */
    entity.lifecycleDate.mrid = dto.lifecycleDateId || null
    entity.lifecycleDate.manufactured_date = dto.properties.manufacturing_year || null
    // liên kết lifecycle vào asset để phía DB insert asset có thể tham chiếu
    entity.asset.lifecycle_date = dto.lifecycleDateId || null

    /** ================== assetPsr ================== */
    entity.assetPsr.mrid = dto.assetPsrId || null
    entity.assetPsr.psr_id = dto.psrId || null
    entity.assetPsr.asset_id = dto.properties.mrid || null

    entity.disconnectorInfo.mrid = dto.assetInfoId || null
    // Ensure AssetInfo receives manufacturer_type and product_asset_model via SwitchInfo chain
    entity.disconnectorInfo.manufacturer_type = dto.properties.manufacturer_type || null
    entity.disconnectorInfo.product_asset_model = dto.productAssetModelId || null

    /** ================== Ratings ================== */
    if (dto.ratings) {
        // Voltage
        if (dto.ratings.rated_voltage && dto.ratings.rated_voltage.value) {
            // Tạo mrid nếu chưa có
            if (!dto.ratings.rated_voltage.mrid) {
                dto.ratings.rated_voltage.mrid = uuid.newUuid()
            }
            entity.disconnectorInfo.rated_voltage = dto.ratings.rated_voltage.mrid
            const newVoltage = new Voltage()
            mappingUnit(newVoltage, dto.ratings.rated_voltage)
            entity.voltage.push(newVoltage)
        }

        // Frequency
        if (dto.ratings.rated_frequency && dto.ratings.rated_frequency.value) {
            // Tạo mrid nếu chưa có
            if (!dto.ratings.rated_frequency.mrid) {
                dto.ratings.rated_frequency.mrid = uuid.newUuid()
            }
            entity.disconnectorInfo.rated_frequency = dto.ratings.rated_frequency.mrid
            const newFreq = new Frequency()
            mappingUnit(newFreq, dto.ratings.rated_frequency)
            entity.frequency.push(newFreq)
        }

        // Current
        if (dto.ratings.rated_current && dto.ratings.rated_current.value) {
            // Tạo mrid nếu chưa có
            if (!dto.ratings.rated_current.mrid) {
                dto.ratings.rated_current.mrid = uuid.newUuid()
            }
            entity.disconnectorInfo.rated_current = dto.ratings.rated_current.mrid
            const newCurrent = new CurrentFlow()
            mappingUnit(newCurrent, dto.ratings.rated_current)
            entity.currentFlow.push(newCurrent)
        }

        // Short-time withstand current
        if (dto.ratings.short_time_withstand_current && dto.ratings.short_time_withstand_current.value) {
            // Tạo mrid nếu chưa có
            if (!dto.ratings.short_time_withstand_current.mrid) {
                dto.ratings.short_time_withstand_current.mrid = uuid.newUuid()
            }
            entity.disconnectorInfo.short_time_withstand_current = dto.ratings.short_time_withstand_current.mrid
            const newShortTime = new CurrentFlow()
            mappingUnit(newShortTime, dto.ratings.short_time_withstand_current)
            entity.currentFlow.push(newShortTime)
        }

        // Rated duration of short circuit
        if (dto.ratings.rated_duration_of_short_circuit && dto.ratings.rated_duration_of_short_circuit.value) {
            // Tạo mrid nếu chưa có
            if (!dto.ratings.rated_duration_of_short_circuit.mrid) {
                dto.ratings.rated_duration_of_short_circuit.mrid = uuid.newUuid()
            }
            entity.disconnectorInfo.rated_duration_short_circuit = dto.ratings.rated_duration_of_short_circuit.mrid
            const newDuration = new Seconds()
            mappingUnit(newDuration, dto.ratings.rated_duration_of_short_circuit)
            entity.seconds.push(newDuration)
        }

        // Withstand voltage earth poles
        if (dto.ratings.power_freq_withstand_voltage_earth_poles && dto.ratings.power_freq_withstand_voltage_earth_poles.value) {
            // Tạo mrid nếu chưa có
            if (!dto.ratings.power_freq_withstand_voltage_earth_poles.mrid) {
                dto.ratings.power_freq_withstand_voltage_earth_poles.mrid = uuid.newUuid()
            }
            entity.disconnectorInfo.withstand_voltage_earth_poles = dto.ratings.power_freq_withstand_voltage_earth_poles.mrid
            const newWithstand = new Voltage()
            mappingUnit(newWithstand, dto.ratings.power_freq_withstand_voltage_earth_poles)
            entity.voltage.push(newWithstand)
        }

        // Power frequency isolating distance (own frequency value)
        if (dto.ratings.power_freq_withstand_voltage_isolating_distance && dto.ratings.power_freq_withstand_voltage_isolating_distance.value) {
            if (!dto.ratings.power_freq_withstand_voltage_isolating_distance.mrid) {
                dto.ratings.power_freq_withstand_voltage_isolating_distance.mrid = uuid.newUuid()
            }
            entity.disconnectorInfo.power_frequency_isolating_distance = dto.ratings.power_freq_withstand_voltage_isolating_distance.mrid
            const isoFreq = new Frequency()
            mappingUnit(isoFreq, dto.ratings.power_freq_withstand_voltage_isolating_distance)
            entity.frequency.push(isoFreq)
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
    dto.properties.manufacturer_type = (entity.disconnectorInfo && entity.disconnectorInfo.manufacturer_type)
        ? entity.disconnectorInfo.manufacturer_type
        : (entity.asset.manufacturer_type || '');
    dto.properties.country_of_origin = entity.asset.country_of_origin || '';
    dto.properties.apparatus_id = entity.asset.name || '';
    dto.properties.comment = entity.asset.description || '';
    dto.locationId = entity.asset.location || '';
    dto.productAssetModelId = entity.productAssetModel.mrid || '';
    // lifecycle date
    dto.lifecycleDateId = entity.asset.lifecycle_date || '';
    dto.properties.manufacturing_year = entity.lifecycleDate.manufactured_date || '';

    //assetPsr
    dto.assetPsrId = entity.assetPsr.mrid || '';
    dto.psrId = entity.assetPsr.psr_id || '';

    //attachment
    dto.attachmentId = entity.attachment.mrid || '';
    dto.attachment = entity.attachment;

    // =============== Ratings ===============
    const info = entity.disconnectorInfo || {}
    // helper to find unit by mrid in a list
    const pickUnit = (list, mrid) => {
        if (!mrid || !Array.isArray(list)) return null
        return list.find(u => u && u.mrid === mrid) || null
    }

    // Voltage
    const ratedVoltage = pickUnit(entity.voltage, info.rated_voltage)
    if (ratedVoltage) {
        dto.ratings.rated_voltage.mrid = ratedVoltage.mrid || ''
        dto.ratings.rated_voltage.value = ratedVoltage.value || ''
        dto.ratings.rated_voltage.unit = [ratedVoltage.multiplier, ratedVoltage.unit].filter(Boolean).join('|') || ''
    }

    const withstandEarthPoles = pickUnit(entity.voltage, info.withstand_voltage_earth_poles)
    if (withstandEarthPoles) {
        dto.ratings.power_freq_withstand_voltage_earth_poles.mrid = withstandEarthPoles.mrid || ''
        dto.ratings.power_freq_withstand_voltage_earth_poles.value = withstandEarthPoles.value || ''
        dto.ratings.power_freq_withstand_voltage_earth_poles.unit = [withstandEarthPoles.multiplier, withstandEarthPoles.unit].filter(Boolean).join('|') || ''
    }

    // Frequency
    const ratedFrequency = pickUnit(entity.frequency, info.rated_frequency)
    if (ratedFrequency) {
        dto.ratings.rated_frequency.mrid = ratedFrequency.mrid || ''
        dto.ratings.rated_frequency.value = ratedFrequency.value || ''
        dto.ratings.rated_frequency.unit = ratedFrequency.unit || ''
    }

    const powerFreqIsoDistance = pickUnit(entity.frequency, info.power_frequency_isolating_distance)
    if (powerFreqIsoDistance) {
        dto.ratings.power_freq_withstand_voltage_isolating_distance.mrid = powerFreqIsoDistance.mrid || ''
        dto.ratings.power_freq_withstand_voltage_isolating_distance.value = powerFreqIsoDistance.value || ''
        dto.ratings.power_freq_withstand_voltage_isolating_distance.unit = powerFreqIsoDistance.unit || ''
    }

    // Current
    const ratedCurrent = pickUnit(entity.currentFlow, info.rated_current)
    if (ratedCurrent) {
        dto.ratings.rated_current.mrid = ratedCurrent.mrid || ''
        dto.ratings.rated_current.value = ratedCurrent.value || ''
        dto.ratings.rated_current.unit = ratedCurrent.unit || ''
    }

    const shortTimeWithstand = pickUnit(entity.currentFlow, info.short_time_withstand_current)
    if (shortTimeWithstand) {
        dto.ratings.short_time_withstand_current.mrid = shortTimeWithstand.mrid || ''
        dto.ratings.short_time_withstand_current.value = shortTimeWithstand.value || ''
        dto.ratings.short_time_withstand_current.unit = [shortTimeWithstand.multiplier, shortTimeWithstand.unit].filter(Boolean).join('|') || ''
    }

    // Seconds
    const ratedDurationSC = pickUnit(entity.seconds, info.rated_duration_short_circuit)
    if (ratedDurationSC) {
        dto.ratings.rated_duration_of_short_circuit.mrid = ratedDurationSC.mrid || ''
        dto.ratings.rated_duration_of_short_circuit.value = ratedDurationSC.value || ''
        dto.ratings.rated_duration_of_short_circuit.unit = ratedDurationSC.unit || ''
    }

    return dto;
}
