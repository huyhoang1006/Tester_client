import uuid from '@/utils/uuid'
import ReactorEntity from '@/views/Flatten/Reactor'

export const importReactor = async (dto, parentNode, {electronAPI, mappings}) => {
    try {
        if (
            parentNode && parentNode.mode &&
            parentNode.mode !== 'substation' &&
            parentNode.mode !== 'bay' &&
            parentNode.mode !== 'reactor'
        ) {
            return { success: false, message: 'Reactor can only be imported under a Substation, Bay or Reactor' }
        }

        // Map DTO sang Entity
        const entity = mappings.ReactorMapping.mapDtoToEntity(dto)
        let existingEntity = null
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
                    const existing = await electronAPI.getReactorEntityByMrid(
                        entity.asset.mrid,
                        parentMrid
                    )

                    if (existing.success && existing.data && existing.data.asset && existing.data.asset.location === parentMrid) {
                        existingEntity = existing.data
                    } else {
                        resetMrid()
                    }
                } catch (e) {
                    console.warn('Could not fetch existing Reactor:', e)
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

            // Tạo mrid mới cho reactor (asset_info)
            const newReactorInfoMrid = uuid.newUuid()
            if (entity.reactor) {
                entity.reactor.mrid = newReactorInfoMrid
            }
            entity.asset.asset_info = newReactorInfoMrid

            // Tạo mrid mới cho các unit values và cập nhật references
            if (entity.voltage && entity.voltage.length > 0) {
                const newVoltageMrid = uuid.newUuid()
                entity.voltage[0].mrid = newVoltageMrid
                if (entity.reactor) entity.reactor.rated_voltage = newVoltageMrid
            }

            if (entity.currentFlow && entity.currentFlow.length > 0) {
                const newCurrentFlowMrid = uuid.newUuid()
                entity.currentFlow[0].mrid = newCurrentFlowMrid
                if (entity.reactor) entity.reactor.rated_current = newCurrentFlowMrid
            }

            if (entity.frequency && entity.frequency.length > 0) {
                const newFrequencyMrid = uuid.newUuid()
                entity.frequency[0].mrid = newFrequencyMrid
                if (entity.reactor) entity.reactor.rated_frequency = newFrequencyMrid
            }

            if (entity.reactivePower && entity.reactivePower.length > 0) {
                const newReactivePowerMrid = uuid.newUuid()
                entity.reactivePower[0].mrid = newReactivePowerMrid
                if (entity.reactor) entity.reactor.rated_power = newReactivePowerMrid
            }

            if (entity.inductance && entity.inductance.length > 0) {
                const newInductanceMrid = uuid.newUuid()
                entity.inductance[0].mrid = newInductanceMrid
                if (entity.reactor) entity.reactor.inductance = newInductanceMrid
            }

            if (entity.mass && entity.mass.length > 0) {
                const newMassMrid = uuid.newUuid()
                entity.mass[0].mrid = newMassMrid
                if (entity.productAssetModel) entity.productAssetModel.weight_total = newMassMrid
            }
        }

        // Không cần set asset.location - dùng assetPsr để liên kết với parent
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

        const emptyEntity = existingEntity || new ReactorEntity()
        const result = await electronAPI.insertReactorEntity(emptyEntity, entity)
        return { ...result, entity }

    } catch (error) {
        console.error('Error importing reactor:', error)
        return { success: false, message: error.message }
    }
}
