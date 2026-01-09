import uuid from '@/utils/uuid'

export const importVoltageLevel = async (data, parentNode, { electronAPI, mappings }) => {
    try {
        // Bước 1: Validate parent node
        if (parentNode && parentNode.mode && parentNode.mode !== 'substation' && parentNode.mode !== 'voltageLevel') {
            return { 
                success: false, 
                message: 'Voltage Level can only be imported under a Substation or Voltage Level' 
            }
        }

        // Bước 2: Chuyển đổi data sang Entity format
        let entity = convertToEntity(data, mappings)

        // Bước 3: Xử lý MRID (tạo mới hoặc update)
        const shouldCreateNew = await checkIfShouldCreateNew(entity, data, parentNode, electronAPI)
        if (shouldCreateNew) {
            regenerateAllIds(entity)
        }

        // Bước 4: Gán parent relationship
        assignParentRelationship(entity, parentNode)

        // Bước 5: Đảm bảo tất cả các ID cần thiết tồn tại
        ensureRequiredIds(entity, data)

        // Bước 6: Lưu vào database
        const result = await electronAPI.insertVoltageLevelEntity(entity)
        return { ...result, entity }

    } catch (error) {
        console.error('Error importing Voltage Level:', error)
        return { success: false, message: error.message }
    }
}

function convertToEntity(data, mappings) {
    if (data.voltageLevel && data.baseVoltage) {
        // Đã là Entity - clone để tránh mutate original
        return JSON.parse(JSON.stringify(data))
    } else {
        // Là DTO - chuyển đổi sang Entity
        return mappings.VoltageLevelMapping.volDtoToVolEntity(data)
    }
}

async function checkIfShouldCreateNew(entity, data, parentNode, electronAPI) {
    const originalLocationId = data.locationId || (entity.voltageLevel && entity.voltageLevel.location)
    const mrid = (entity.voltageLevel && entity.voltageLevel.mrid) || data.voltageLevelId

    if (!mrid) {
        return true // Không có MRID → tạo mới
    }

    // Kiểm tra xem có import sang location khác không
    if (originalLocationId && parentNode && parentNode.mrid && originalLocationId !== parentNode.mrid) {
        return true // Import sang location khác → tạo mới
    }

    // Kiểm tra xem entity có tồn tại trong DB không
    try {
        const existing = await electronAPI.getVoltageLevelEntityByMrid(mrid)
        if (existing.success && existing.data && existing.data.voltageLevel) {
            const existingLocation = existing.data.voltageLevel.location
            const targetLocation = parentNode && parentNode.mrid
            
            if (existingLocation === targetLocation) {
                return false // Cùng location → update
            } else {
                return true // Khác location → tạo mới
            }
        }
    } catch (error) {
        // Lỗi khi query → coi như không tồn tại → tạo mới
    }

    return true // Mặc định tạo mới
}

function regenerateAllIds(obj) {
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

function assignParentRelationship(entity, parentNode) {
    if (!parentNode || !parentNode.mrid) return

    if (parentNode.mode === 'substation') {
        entity.voltageLevel.substation = parentNode.mrid
    }
    
    // Clear location vì đó là FK đến bảng location riêng
    entity.voltageLevel.location = null
}


function ensureRequiredIds(entity, data) {
    const BaseVoltage = require('@/views/Cim/BaseVoltage').default
    const Voltage = require('@/views/Cim/Voltage').default

    // 1. Đảm bảo VoltageLevel có MRID
    if (!entity.voltageLevel.mrid) {
        entity.voltageLevel.mrid = uuid.newUuid()
    }

    // 2. Đảm bảo voltage array tồn tại
    if (!entity.voltage) {
        entity.voltage = []
    }

    // 3. Đảm bảo BaseVoltage tồn tại và có MRID
    if (!entity.baseVoltage) {
        entity.baseVoltage = new BaseVoltage()
    }
    if (!entity.baseVoltage.mrid) {
        entity.baseVoltage.mrid = uuid.newUuid()
    }

    // 4. Liên kết BaseVoltage với VoltageLevel
    entity.voltageLevel.base_voltage = entity.baseVoltage.mrid

    // 5. Đảm bảo nominal_voltage tồn tại
    const hasNominalVoltage = entity.voltage.some(v => v.mrid === entity.baseVoltage.nominal_voltage)
    
    if (!entity.baseVoltage.nominal_voltage || !hasNominalVoltage) {
        const nominalVoltageId = entity.baseVoltage.nominal_voltage || uuid.newUuid()
        entity.baseVoltage.nominal_voltage = nominalVoltageId
        
        // Tạo voltage record cho nominal_voltage nếu chưa có
        if (!hasNominalVoltage) {
            const nominalVoltage = new Voltage()
            nominalVoltage.mrid = nominalVoltageId
            nominalVoltage.value = data.base_voltage_value || null
            nominalVoltage.unit = data.base_voltage_unit || null
            nominalVoltage.multiplier = data.base_voltage_multiplier || null
            entity.voltage.push(nominalVoltage)
        }
    }

    // 6. Đảm bảo tất cả voltage có MRID
    entity.voltage.forEach(v => {
        if (!v.mrid) {
            v.mrid = uuid.newUuid()
        }
    })
}
