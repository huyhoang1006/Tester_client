export default {
    methods: {
        cleanDtoForDuplicate(dto) {
            if (!dto) return

            // Xóa IDs của entity chính (cần tạo mới)
            if (dto.properties) dto.properties.mrid = null
            dto.mrid = null
            dto.id = null
            dto.assetInfoId = null
            dto.lifecycleDateId = null
            dto.assetPsrId = null
            dto.attachmentId = null
            dto.productAssetModelId = null // Tạo ProductAssetModel mới

            // Old info IDs
            if (dto.oldSurgeArresterInfoId) dto.oldSurgeArresterInfoId = null
            if (dto.oldPowerTransformerInfoId) dto.oldPowerTransformerInfoId = null
            if (dto.oldCableInfoId) dto.oldCableInfoId = null

            // Giữ lại foreign keys: locationId, psrId (tham chiếu đến entities độc lập)
            if (dto.breakerRatingInfoId) dto.breakerRatingInfoId = null
            if (dto.breakerContactSystemInfoId) dto.breakerContactSystemInfoId = null
            if (dto.breakerOtherInfoId) dto.breakerOtherInfoId = null
            if (dto.operatingMechanismId) dto.operatingMechanismId = null
            if (dto.operatingMechanismInfoId) dto.operatingMechanismInfoId = null
            if (dto.operatingMechanismLifecycleDateId) dto.operatingMechanismLifecycleDateId = null
            if (dto.operatingMechanismProductAssetModelId) dto.operatingMechanismProductAssetModelId = null
            if (dto.assessmentLimitBreakerInfoId) dto.assessmentLimitBreakerInfoId = null
            // Xóa mrid trong ratings (giữ value và unit)
            if (dto.ratings) {
                const ratingFields = [
                    'rated_voltage',
                    'rated_frequency',
                    'rated_current',
                    'short_time_withstand_current',
                    'rated_duration_of_short_circuit',
                    'power_freq_withstand_voltage_earth_poles',
                    'power_freq_withstand_voltage_isolating_distance'
                ]
                ratingFields.forEach((field) => {
                    if (dto.ratings[field] && dto.ratings[field].mrid) {
                        dto.ratings[field].mrid = null
                    }
                })
            }

            // Xóa mrid/id trong nested objects (giữ dữ liệu)
            const clearRecursive = (obj, depth = 0) => {
                if (depth > 5) return
                if (Array.isArray(obj)) {
                    obj.forEach((item) => clearRecursive(item, depth + 1))
                } else if (obj && typeof obj === 'object') {
                    if ('mrid' in obj && obj.mrid !== null) obj.mrid = null
                    if ('id' in obj && obj.id !== null) obj.id = null
                    Object.values(obj).forEach((val) => {
                        if (val !== null && typeof val === 'object') {
                            clearRecursive(val, depth + 1)
                        }
                    })
                }
            }
            if (dto.bushing) clearRecursive(dto.bushing)
            if (dto.ratings) clearRecursive(dto.ratings)
            if (dto.circuitBreaker) clearRecursive(dto.circuitBreaker)
            if (dto.contactSystem) clearRecursive(dto.contactSystem)
            if (dto.others) clearRecursive(dto.others)
            if (dto.operating) clearRecursive(dto.operating)
            if (dto.assessmentLimits) clearRecursive(dto.assessmentLimits)
            if (dto.winding_configuration) clearRecursive(dto.winding_configuration)
            if (dto.impedances) clearRecursive(dto.impedances)
            if (dto.others) clearRecursive(dto.others)
            if (dto.tap_changers) clearRecursive(dto.tap_changers)
            if (dto.voltage) clearRecursive(dto.voltage)
            if (dto.frequency) clearRecursive(dto.frequency)
            if (dto.currentFlow) clearRecursive(dto.currentFlow)
            if (dto.seconds) clearRecursive(dto.seconds)
            // Power Cable specific: temperature, area, length, datasData, othersData, ratingsData
            if (dto.temperature) clearRecursive(dto.temperature)
            if (dto.area) clearRecursive(dto.area)
            if (dto.length) clearRecursive(dto.length)
            if (dto.datasData) clearRecursive(dto.datasData)
            if (dto.othersData) clearRecursive(dto.othersData)
            if (dto.ratingsData) clearRecursive(dto.ratingsData)
            if (dto.configsData) clearRecursive(dto.configsData)
            if (dto.ctConfiguration) clearRecursive(dto.ctConfiguration)
            if (dto.vt_Configuration) clearRecursive(dto.vt_Configuration)
            if (dto.capacitance) clearRecursive(dto.capacitance)
            if (dto.percent) clearRecursive(dto.percent) // Bushing specific: DF C1, DF C2
            if (dto.dissipationFactor) clearRecursive(dto.dissipationFactor)
            // Reactor specific: reactorRating (includes inductance), reactorOther
            if (dto.reactorRating) clearRecursive(dto.reactorRating)
            if (dto.reactorOther) clearRecursive(dto.reactorOther)
        },
    }
}