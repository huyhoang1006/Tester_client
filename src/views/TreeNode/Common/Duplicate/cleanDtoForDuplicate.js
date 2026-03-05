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

            if (dto.properties && (dto.properties.kind === 'Circuit breaker' || dto.asset === 'Circuit breaker')) {
                dto.breakerRatingInfoId = null
                dto.breakerContactSystemInfoId = null
                dto.breakerOtherInfoId = null
                dto.operatingMechanismId = null
                dto.operatingMechanismInfoId = null
                dto.operatingMechanismLifecycleDateId = null
                dto.operatingMechanismProductAssetModelId = null
                dto.assessmentLimitBreakerInfoId = null

                // Xóa mrid trong các mảng linh kiện của bộ truyền động (Trip/Close Coils)
                if (dto.operating) {
                    if (Array.isArray(dto.operating.trip_coil_component)) {
                        dto.operating.trip_coil_component.forEach(item => { item.mrid = null });
                    }
                    if (Array.isArray(dto.operating.close_coil_component)) {
                        dto.operating.close_coil_component.forEach(item => { item.mrid = null });
                    }
                }
            }
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
                if (depth > 12 || !obj) return
                if (Array.isArray(obj)) {
                    obj.forEach((item) => clearRecursive(item, depth + 1))
                } else if (obj && typeof obj === 'object') {
                    if ('mrid' in obj) obj.mrid = null
                    if ('id' in obj) obj.id = null
                    Object.values(obj).forEach((val) => {
                        if (val && typeof val === 'object') clearRecursive(val, depth + 1)
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

            // LƯU Ý: Không clear impedances ở đây để giữ ID cũ cho việc mapping bên duplicateAsset
            // if (dto.impedances) clearRecursive(dto.impedances)

            if (dto.others) clearRecursive(dto.others)

            // Tap changer xử lý riêng bên dưới
            // if (dto.tap_changers) clearRecursive(dto.tap_changers)

            if (dto.voltage) clearRecursive(dto.voltage)
            if (dto.frequency) clearRecursive(dto.frequency)
            if (dto.currentFlow) clearRecursive(dto.currentFlow)
            if (dto.seconds) clearRecursive(dto.seconds)
            // Power Cable specific
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
            if (dto.percent) clearRecursive(dto.percent)
            if (dto.dissipationFactor) clearRecursive(dto.dissipationFactor)
            if (dto.reactorRating) clearRecursive(dto.reactorRating)
            if (dto.reactorOther) clearRecursive(dto.reactorOther)

            // Transformer specific
            if (dto.bushing_data) {
                clearRecursive(dto.bushing_data);
                ['prim', 'sec', 'tert'].forEach(w => {
                    if (dto.bushing_data[w]) {
                        dto.bushing_data[w].forEach(b => {
                            b.assetInfoId = null
                            b.productAssetModelId = null
                            b.lifecycleDateId = null
                        })
                    }
                })
            }
            if (dto.surge_arrester) {
                clearRecursive(dto.surge_arrester);
                ['prim', 'sec', 'tert'].forEach(w => {
                    if (dto.surge_arrester[w]) {
                        dto.surge_arrester[w].forEach(s => {
                            if (s.properties) {
                                s.properties.assetInfoId = null
                                s.properties.productAssetModelId = null
                                s.properties.lifecycleDateId = null
                            }
                            if (s.ratings && s.ratings.table) {
                                s.ratings.table.forEach(t => t.assetInfoId = null)
                            }
                        })
                    }
                })
            }
            if (dto.oldTransformerEndInfo) clearRecursive(dto.oldTransformerEndInfo)

            // LƯU Ý: Không clear shortCircuitTestTransformerEndInfo ở đây để giữ liên kết với impedances
            // if (dto.shortCircuitTestTransformerEndInfo) clearRecursive(dto.shortCircuitTestTransformerEndInfo)

            // Xử lý Tap Changer
            if (dto.tap_changers) {
                if (dto.tap_changers.mrid) dto.tap_changers.mrid = null;
                if (dto.tap_changers.productAssetModelId) dto.tap_changers.productAssetModelId = null
                if (dto.tap_changers.assetInfoId) dto.tap_changers.assetInfoId = null

                // Xóa ID của các dòng trong bảng Voltage Table
                if (dto.tap_changers.voltage_table && Array.isArray(dto.tap_changers.voltage_table)) {
                    dto.tap_changers.voltage_table.forEach(row => {
                        row.id = null; // Quan trọng: Mapper dùng field này làm mrid
                        if (row.voltage) {
                            row.voltage.mrid = null;
                        }
                    });
                }
            }
        },
    }
}