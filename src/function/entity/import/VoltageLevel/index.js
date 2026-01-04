import uuid from '@/utils/uuid'

export const importVoltageLevel = async (dto, parentNode, { electronAPI, mappings }) => {
    try {
        if (
            parentNode?.mode &&
            parentNode.mode !== 'substation' &&
            parentNode.mode !== 'voltageLevel'
        ) {
            return { success: false, message: 'Voltage Level can only be imported under a Substation or Voltage Level' }
        }

        const entity = mappings.VoltageLevelMapping.volDtoToVolEntity(dto)

        // ================== FUNCTION: CLEAR ALL MRID ==================
        const regenerateAllIds = (obj) => {
            if (!obj || typeof obj !== 'object') return

            Object.keys(obj).forEach(key => {
                const value = obj[key]

                if (key === 'mrid' || key === 'id') {
                    obj[key] = uuid.newUuid()
                } 
                else if (Array.isArray(value)) {
                    value.forEach(v => regenerateAllIds(v))
                } 
                else if (typeof value === 'object' && value !== null) {
                    regenerateAllIds(value)
                }
            })
        }

        const originalLocationId = dto.locationId || entity.voltageLevel?.location
        const mrid = entity.voltageLevel?.mrid || dto.voltageLevelId

        // ================== CÓ MRID ==================
        if (mrid) {
            // Import sang node khác → tạo mới
            if (originalLocationId && originalLocationId !== parentNode?.mrid) {
                regenerateAllIds(entity)
            } 
            else {
                try {
                    const existing = await electronAPI.getVoltageLevelEntityByMrid(mrid)

                    if (
                        existing.success &&
                        existing.data?.voltageLevel?.location === parentNode?.mrid
                    ) {
                        // Entity exists at same location - will be updated
                    } else {
                        regenerateAllIds(entity)
                    }
                } catch {
                    regenerateAllIds(entity)
                }
            }
        }

        // ================== SET LOCATION ==================
        if (parentNode?.mrid) {
            if (parentNode.mode === 'substation') {
                entity.voltageLevel.substation = parentNode.mrid
                dto.substationId = parentNode.mrid
            }
            // Clear location vì đó là FK đến bảng location riêng
            entity.voltageLevel.location = null
        }

        // ================== CREATE NEW MRID IF MISSING ==================
        if (!entity.voltageLevel.mrid || entity.voltageLevel.mrid === '') {
            entity.voltageLevel.mrid = uuid.newUuid()
        }

        // Đảm bảo voltage array tồn tại
        if (!entity.voltage) {
            entity.voltage = []
        }

        // Tạo mrid cho baseVoltage nếu thiếu (BẮT BUỘC phải có)
        if (!entity.baseVoltage) {
            const BaseVoltage = require('@/views/Cim/BaseVoltage').default
            entity.baseVoltage = new BaseVoltage()
        }
        if (!entity.baseVoltage.mrid || entity.baseVoltage.mrid === '') {
            entity.baseVoltage.mrid = uuid.newUuid()
        }
        // Liên kết baseVoltage với voltageLevel
        entity.voltageLevel.base_voltage = entity.baseVoltage.mrid

        // Kiểm tra xem nominal_voltage đã có trong entity.voltage chưa
        const hasNominalVoltage = entity.voltage.some(v => v.mrid === entity.baseVoltage.nominal_voltage)
        
        // Tạo nominalVoltage nếu thiếu hoặc chưa có trong voltage array
        if (!entity.baseVoltage.nominal_voltage || entity.baseVoltage.nominal_voltage === '' || !hasNominalVoltage) {
            const nominalVoltageId = entity.baseVoltage.nominal_voltage || uuid.newUuid()
            entity.baseVoltage.nominal_voltage = nominalVoltageId
            
            // Tạo voltage record cho nominal_voltage nếu chưa có
            if (!hasNominalVoltage) {
                const Voltage = require('@/views/Cim/Voltage').default
                const nominalVoltage = new Voltage()
                nominalVoltage.mrid = nominalVoltageId
                nominalVoltage.value = dto.base_voltage_value || null
                nominalVoltage.unit = dto.base_voltage_unit || null
                nominalVoltage.multiplier = dto.base_voltage_multiplier || null
                entity.voltage.push(nominalVoltage)
            }
        }

        // Tạo mrid cho các voltage nếu thiếu
        if (entity.voltage && entity.voltage.length > 0) {
            for (const v of entity.voltage) {
                if (!v.mrid || v.mrid === '') {
                    v.mrid = uuid.newUuid()
                }
            }
        }

        const result = await electronAPI.insertVoltageLevelEntity(entity)
        return { ...result, entity }

    } catch (error) {
        console.error('Error importing Voltage Level:', error)
        return { success: false, message: error.message }
    }
}
