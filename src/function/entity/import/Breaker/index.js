import uuid from '@/utils/uuid'

export const importBreaker = async (dto, parentNode, { electronAPI, mappings }) => {
    try {
        // 1. Validate Parent
        if (
            !parentNode?.mode ||
            !['substation', 'bay', 'breaker'].includes(parentNode.mode)
        ) {
            return {
                success: false,
                message: 'Breaker can only be imported under Substation, Bay or Breaker'
            }
        }

        // --- VALIDATE PARENT EXISTENCE ---
        // Kiểm tra xem Parent Node có thực sự tồn tại trong DB không để tránh lỗi FK
        if (parentNode?.mrid) {
            let parentData = null;
            try {
                if (parentNode.mode === 'substation') {
                    const res = await electronAPI.getSubstationEntityByMrid(parentNode.mrid);
                    if (res?.success) parentData = res.data;
                } 
                else if (parentNode.mode === 'bay') {
                    const res = await electronAPI.getBayEntityByMrid(parentNode.mrid);
                    if (res?.success) parentData = res.data;
                }
                else if (parentNode.mode === 'breaker') {
                    const res = await electronAPI.getBreakerEntityByMrid(parentNode.mrid);
                    if (res?.success) parentData = res.data;
                }

                if (!parentData) {
                     console.error(`Parent node ${parentNode.mode} with ID ${parentNode.mrid} not found in DB.`);
                     return {
                        success: false,
                        message: `Cannot import: Parent ${parentNode.mode} does not exist in Database. Please refresh.`
                     }
                }
            } catch (err) {
                console.warn(`Could not verify parent existence: ${err.message}`);
                // Nếu gọi API lỗi (ví dụ chưa implement hàm), ta vẫn cho qua nhưng log warning
            }
        }
        // ---------------------------------

        // 2. Mapping DTO -> Entity
        if (!mappings?.BreakerMapping?.mapDtoToEntity) {
            return {
                success: false,
                message: 'BreakerMapping not found or mapDtoToEntity not defined'
            }
        }

        const entity = mappings.BreakerMapping.mapDtoToEntity(dto)

        if (!entity || !entity.asset) {
            console.error('Failed to map Breaker DTO:', dto)
            return {
                success: false,
                message: 'Failed to map DTO to entity - result is invalid'
            }
        }

        let oldEntity = null

        // 3. Identity Management Helper
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

        // 4. Logic Clone / Move / Duplicate Check
        if (dto.clone === true) {
            regenerateAllIds(entity)
        }
        else if (entity.asset.mrid) {
            const originalLocationId = entity.asset.location || dto.locationId

            // Nếu khác location cha hiện tại -> Coi là copy -> Đổi ID
            if (originalLocationId && originalLocationId !== parentNode?.mrid) {
                regenerateAllIds(entity)
            } 
            else {
                // Kiểm tra xem đã tồn tại trong DB chưa
                try {
                    const existing = await electronAPI.getBreakerEntityByMrid(
                        entity.asset.mrid,
                        parentNode?.mrid
                    )

                    if (
                        existing?.success &&
                        existing?.data?.asset?.location === parentNode?.mrid
                    ) {
                        oldEntity = existing.data // Tồn tại -> Update
                    } else {
                        regenerateAllIds(entity) // Không tồn tại hoặc khác chỗ -> Tạo mới
                    }
                } catch {
                    regenerateAllIds(entity)
                }
            }
        }

        // 5. Link Parent
        if (parentNode?.mrid) {
            entity.asset.location = parentNode.mrid
        }

        if (!entity.asset.mrid) {
            entity.asset.mrid = uuid.newUuid()
        }

        // --- FIX BUG: AssetPsr Missing Fields ---
        // Luôn đảm bảo AssetPsr được liên kết đúng với Asset và Parent hiện tại
        entity.assetPsr = entity.assetPsr || {}
        
        // Nếu chưa có mrid hoặc đang clone/new -> tạo mới
        if (!entity.assetPsr.mrid || dto.clone || !oldEntity) {
             entity.assetPsr.mrid = uuid.newUuid()
        }

        // Cập nhật lại liên kết Foreign Keys
        entity.assetPsr.asset_id = entity.asset.mrid
        entity.assetPsr.psr_id = parentNode?.mrid || null

        // Kiểm tra lần cuối (Safety Check)
        if (!entity.assetPsr.psr_id) {
            console.warn('Warning: Importing Breaker without a valid Parent PSR ID (psr_id is null)')
        }
        // ----------------------------------------

        // 6. Safe Entity Building (Initialize empty arrays/objects)
        const buildSafeEntity = (targetObj = {}) => {
            const obj = targetObj || {}
            
            // Các Unit Types cần thiết cho insertBreakerEntity
            const unitTypes = [
                'resistance', 'capacitance', 'voltage', 'currentFlow', 
                'second', 'activePower', 'length', 'mass', 'volume', 
                'temperature', 'frequency', 'quantity', 'pressure'
            ]

            // Các Table Types cần thiết cho insertBreakerEntity
            const tableTypes = [
                'operatingMechanismComponent', 
                'contactResistanceBreakerInfo', 
                'operatingTimeBreakerInfo', 
                'contactTravelBreakerInfo', 
                'tripOperation', 
                'closeOperation', 
                'miscellaneousBreakerInfo', 
                'coilCharacteristicsBreakerInfo', 
                'pickupVoltageBreakerInfo', 
                'motorCharacteristicsBreakerInfo', 
                'underVoltageReleaseBreakerInfo', 
                'overcurrentReleaseBreakerInfo'
            ]

            // Các mảng thông số kỹ thuật khác (nếu có dùng ở view)
            const otherArrays = [
                'insulationResistance',
                'contactResistance', 
                'dynamicResistance',
                'timingTest',
                'travelCurve',
                'motorTest',
                'coilTest',
                'vacuumTest',
                'sf6Test',
                'undervoltageTest'
            ]

            const allArrays = [...unitTypes, ...tableTypes, ...otherArrays]

            // Khởi tạo mảng rỗng nếu chưa có
            allArrays.forEach(k => {
                if (!Array.isArray(obj[k])) {
                    obj[k] = []
                }
            })

            obj.asset = obj.asset || {}
            obj.asset.attachment = obj.asset.attachment || {
                id: null,
                path: '[]',
                name: null,
                type: 'asset',
                id_foreign: null
            }
            
            obj.breakerInfo = obj.breakerInfo || {}
            obj.nameplate = obj.nameplate || {}
            obj.assetPsr = obj.assetPsr || {}
            
            // Khởi tạo object con nếu thiếu
            obj.lifecycleDate = obj.lifecycleDate || {}
            obj.operatingLifecycleDate = obj.operatingLifecycleDate || {}
            obj.productAssetModel = obj.productAssetModel || {}
            obj.operatingProductAssetModel = obj.operatingProductAssetModel || {}
            obj.oldBreakerInfo = obj.oldBreakerInfo || {}
            obj.breakerRatingInfo = obj.breakerRatingInfo || {}
            obj.breakerContactSystemInfo = obj.breakerContactSystemInfo || {}
            obj.breakerOtherInfo = obj.breakerOtherInfo || {}
            obj.oldOperatingMechanism = obj.oldOperatingMechanism || {}
            obj.oldOperatingMechanismInfo = obj.oldOperatingMechanismInfo || {}
            obj.assessmentLimitBreakerInfo = obj.assessmentLimitBreakerInfo || {}
            obj.auxiliaryContactsBreakerInfo = obj.auxiliaryContactsBreakerInfo || {}

            return obj
        }

        if (!oldEntity) {
            oldEntity = buildSafeEntity({})
        } else {
            // Đảm bảo oldEntity cũng đầy đủ cấu trúc
            buildSafeEntity(oldEntity)
        }

        // QUAN TRỌNG: Áp dụng Safe Build cho entity mới để tránh lỗi undefined khi map()
        buildSafeEntity(entity)

        // Chuẩn hóa attachment
        const normalizeAssetAttachment = (obj) => {
            if (!obj.asset) obj.asset = {}
            if (!obj.asset.attachment) {
                obj.asset.attachment = {
                    id: null,
                    path: '[]',
                    name: null,
                    type: 'asset',
                    id_foreign: null
                }
            } else if (!obj.asset.attachment.path) {
                obj.asset.attachment.path = '[]'
            }
        }

        normalizeAssetAttachment(oldEntity)
        normalizeAssetAttachment(entity)

        // 7. Persistence
        const result = await electronAPI.insertBreakerEntity(oldEntity, entity)

        return { ...result, entity }

    } catch (error) {
        console.error('Error importing breaker:', error)
        return { success: false, message: error.message }
    }
}
