import uuid from '@/utils/uuid'

export const importDisconnector = async (dto, parentNode, { electronAPI, mappings }) => {
    try {
        if (
            parentNode && parentNode.mode &&
            parentNode.mode !== 'substation' &&
            parentNode.mode !== 'bay' &&
            parentNode.mode !== 'disconnector'
        ) {
            return { success: false, message: 'Disconnector can only be imported under a Substation, Bay or Disconnector' }
        }

        // Map DTO sang Entity
        const entity = mappings.DisconnectorMapping.disconnectorDtoToEntity(dto)
        let needNewMrids = false

        const resetMrid = () => {
            if (!entity || !entity.asset) return
            entity.asset.mrid = null
            entity.asset.location = null
            needNewMrids = true
        }

        // Xử lý clone
        if (dto.clone === true) {
            resetMrid()
        }
        // Kiểm tra entity đã tồn tại chưa
        else if (entity.asset && entity.asset.mrid) {
            const originalLocationId = entity.asset.location || dto.locationId
            const parentMrid = parentNode ? parentNode.mrid : null

            if (originalLocationId && originalLocationId !== parentMrid) {
                resetMrid()
            } else {
                try {
                    const existing = await electronAPI.getDisconnectorEntityByMrid(
                        entity.asset.mrid,
                        parentMrid
                    )

                    if (!(existing.success && existing.data && existing.data.asset && existing.data.asset.location === parentMrid)) {
                        resetMrid()
                    }
                } catch (e) {
                    console.warn('Could not fetch existing Disconnector:', e)
                    resetMrid()
                }
            }
        } else {
            needNewMrids = true
        }

        // Tạo mrid mới nếu cần
        if (!entity.asset || !entity.asset.mrid) {
            entity.asset.mrid = uuid.newUuid()
            needNewMrids = true
        }

        // Nếu cần tạo mới, reset tất cả các mrid liên quan
        if (needNewMrids) {
            // Tạo mrid mới cho lifecycleDate
            const newLifecycleDateMrid = uuid.newUuid()
            if (entity.lifecycleDate) {
                entity.lifecycleDate.mrid = newLifecycleDateMrid
            }
            entity.asset.lifecycle_date = newLifecycleDateMrid

            // Tạo mrid mới cho productAssetModel
            const newProductAssetModelMrid = uuid.newUuid()
            if (entity.productAssetModel) {
                entity.productAssetModel.mrid = newProductAssetModelMrid
            }
            entity.asset.product_asset_model = newProductAssetModelMrid

            // Tạo mrid mới cho disconnectorInfo (asset_info)
            const newDisconnectorInfoMrid = uuid.newUuid()
            if (entity.disconnectorInfo) {
                entity.disconnectorInfo.mrid = newDisconnectorInfoMrid
                entity.disconnectorInfo.product_asset_model = newProductAssetModelMrid
            }
            entity.asset.asset_info = newDisconnectorInfoMrid

            if (entity.voltage && entity.voltage.length > 0) {
                entity.voltage.forEach((v, index) => {
                    const newVoltageMrid = uuid.newUuid()
                    v.mrid = newVoltageMrid
                    if (entity.disconnectorInfo) {
                        // Map theo thứ tự: rated_voltage, withstand_voltage_earth_poles
                        if (index === 0) entity.disconnectorInfo.rated_voltage = newVoltageMrid
                        else if (index === 1) entity.disconnectorInfo.withstand_voltage_earth_poles = newVoltageMrid
                    }
                })
            }

            // CurrentFlow: rated_current, short_time_withstand_current
            if (entity.currentFlow && entity.currentFlow.length > 0) {
                entity.currentFlow.forEach((c, index) => {
                    const newCurrentFlowMrid = uuid.newUuid()
                    c.mrid = newCurrentFlowMrid
                    if (entity.disconnectorInfo) {
                        if (index === 0) entity.disconnectorInfo.rated_current = newCurrentFlowMrid
                        else if (index === 1) entity.disconnectorInfo.short_time_withstand_current = newCurrentFlowMrid
                    }
                })
            }

            // Frequency: rated_frequency, power_frequency_isolating_distance
            if (entity.frequency && entity.frequency.length > 0) {
                entity.frequency.forEach((f, index) => {
                    const newFrequencyMrid = uuid.newUuid()
                    f.mrid = newFrequencyMrid
                    if (entity.disconnectorInfo) {
                        if (index === 0) entity.disconnectorInfo.rated_frequency = newFrequencyMrid
                        else if (index === 1) entity.disconnectorInfo.power_frequency_isolating_distance = newFrequencyMrid
                    }
                })
            }

            // Seconds: rated_duration_short_circuit
            if (entity.seconds && entity.seconds.length > 0) {
                const newSecondsMrid = uuid.newUuid()
                entity.seconds[0].mrid = newSecondsMrid
                if (entity.disconnectorInfo) entity.disconnectorInfo.rated_duration_short_circuit = newSecondsMrid
            }
        }

        entity.asset.location = null

        // Tạo assetPsr để liên kết với parent node
        if (parentNode && parentNode.mrid) {
            entity.assetPsr = {
                mrid: uuid.newUuid(),
                asset_id: entity.asset.mrid,
                psr_id: parentNode.mrid
            }
        } else {
            entity.assetPsr = null
        }

        // Đảm bảo attachment có format đúng
        if (!entity.asset.attachment) {
            entity.asset.attachment = {
                id: null,
                path: '[]',
                name: null,
                type: 'asset',
                id_foreign: null
            }
        } else if (!entity.asset.attachment.path) {
            entity.asset.attachment.path = '[]'
        }

        // Cũng set entity.attachment cho tương thích
        if (!entity.attachment) {
            entity.attachment = {
                id: null,
                path: '[]',
                name: null,
                type: 'asset',
                id_foreign: null
            }
        } else if (!entity.attachment.path) {
            entity.attachment.path = '[]'
        }

        // Gọi insert
        const result = await electronAPI.insertDisconnectorEntity(entity)  
        return { ...result, entity }

    } catch (error) {
        console.error('Error importing disconnector:', error)
        return { success: false, message: error.message }
    }
}
