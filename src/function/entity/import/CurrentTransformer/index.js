import uuid from '@/utils/uuid'

export const importCurrentTransformer = async (dto, parentNode, { electronAPI, mappings }) => {
    try {
        if (
            parentNode?.mode &&
            parentNode.mode !== 'substation' &&
            parentNode.mode !== 'bay' &&
            parentNode.mode !== 'currentTransformer'
        ) {
            return { success: false, message: 'Current transformer can only be imported under a Substation, Bay or CurrentTransformer' }
        }

        // Map DTO to Entity
        const entity = mappings.CurrentTransformerMapping.mapDtoToEntity(dto)

        // Luôn tạo mrid mới khi import
        regenerateAllMrids(entity)

        // Set location
        if (parentNode?.mrid) {
            entity.asset.location = parentNode.mrid
        }

        // Insert vào database
        const result = await electronAPI.insertCurrentTransformerEntity({}, entity)
        
        return { ...result, entity }

    } catch (error) {
        console.error('Error importing current transformer:', error)
        return { success: false, message: error.message }
    }
}

const regenerateAllMrids = (entity) => {
    // Tạo mrid mới cho tất cả các object
    const newAssetMrid = uuid.newUuid()
    const newAssetInfoMrid = uuid.newUuid()
    const newProductAssetModelMrid = uuid.newUuid()
    const newLifecycleDateMrid = uuid.newUuid()
    const newAssetPsrMrid = uuid.newUuid()

    // Asset
    entity.asset.mrid = newAssetMrid
    entity.asset.asset_info = newAssetInfoMrid
    entity.asset.product_asset_model = newProductAssetModelMrid
    entity.asset.lifecycle_date = newLifecycleDateMrid
    entity.asset.location = null

    // AssetInfo
    if (entity.assetInfo) {
        entity.assetInfo.mrid = newAssetInfoMrid
        entity.assetInfo.product_asset_model = newProductAssetModelMrid
    }

    // OldCurrentTransformerInfo (dùng chung mrid với assetInfo)
    if (entity.oldCurrentTransformerInfo) {
        entity.oldCurrentTransformerInfo.mrid = newAssetInfoMrid
    }

    // ProductAssetModel
    if (entity.productAssetModel) {
        entity.productAssetModel.mrid = newProductAssetModelMrid
    }

    // LifecycleDate
    if (entity.lifecycleDate) {
        entity.lifecycleDate.mrid = newLifecycleDateMrid
    }

    // AssetPsr
    if (entity.assetPsr) {
        entity.assetPsr.mrid = newAssetPsrMrid
        entity.assetPsr.asset_id = newAssetMrid
        entity.assetPsr.psr_id = null
    }

    // Attachment
    if (entity.attachment?.mrid) {
        entity.attachment.mrid = uuid.newUuid()
    }

    // Regenerate unit mrids và update references
    const mridMap = {}

    const regenerateUnit = (unit) => {
        if (unit && unit.mrid) {
            const oldMrid = unit.mrid
            const newMrid = uuid.newUuid()
            mridMap[oldMrid] = newMrid
            unit.mrid = newMrid
        }
    }

    // Voltage
    if (entity.voltage) {
        entity.voltage.forEach(regenerateUnit)
    }

    // CurrentFlow
    if (entity.currentFlow) {
        entity.currentFlow.forEach(regenerateUnit)
    }

    // Seconds
    if (entity.seconds) {
        entity.seconds.forEach(regenerateUnit)
    }

    // Frequency
    if (entity.frequency) {
        entity.frequency.forEach(regenerateUnit)
    }

    // Resistance
    if (entity.resistance) {
        entity.resistance.forEach(regenerateUnit)
    }

    // Percent
    if (entity.percent) {
        entity.percent.forEach(regenerateUnit)
    }

    // ApparentPower
    if (entity.apparentPower) {
        entity.apparentPower.forEach(regenerateUnit)
    }

    // Temperature
    if (entity.temperature) {
        entity.temperature.forEach(regenerateUnit)
    }

    // Update references trong oldCurrentTransformerInfo
    if (entity.oldCurrentTransformerInfo) {
        const info = entity.oldCurrentTransformerInfo
        info.rated_frequency = mridMap[info.rated_frequency] || null
        info.um_rms = mridMap[info.um_rms] || null
        info.u_withstand_rms = mridMap[info.u_withstand_rms] || null
        info.u_lightning_peak = mridMap[info.u_lightning_peak] || null
        info.i_cth = mridMap[info.i_cth] || null
        info.i_dynamic_peak = mridMap[info.i_dynamic_peak] || null
        info.ith_rms = mridMap[info.ith_rms] || null
        info.ith_duration = mridMap[info.ith_duration] || null
        info.system_voltage = mridMap[info.system_voltage] || null
        info.bil = mridMap[info.bil] || null
        info.rating_factor_temp = mridMap[info.rating_factor_temp] || null
    }

    // CtCoreInfo
    if (entity.CtCoreInfo) {
        entity.CtCoreInfo.forEach(core => {
            const oldCoreMrid = core.mrid
            const newCoreMrid = uuid.newUuid()
            mridMap[oldCoreMrid] = newCoreMrid

            core.mrid = newCoreMrid
            core.current_transformer_info_id = newAssetInfoMrid
            core.winding_resistance = mridMap[core.winding_resistance] || null
            core.vb = mridMap[core.vb] || null
            core.ratio_error = mridMap[core.ratio_error] || null

            // Update CtTapInfo references
            if (entity.CtTapInfo) {
                entity.CtTapInfo.forEach(tap => {
                    if (tap.ct_core_info_id === oldCoreMrid) {
                        tap.ct_core_info_id = newCoreMrid
                    }
                })
            }
        })
    }

    // CtTapInfo
    if (entity.CtTapInfo) {
        entity.CtTapInfo.forEach(tap => {
            tap.mrid = uuid.newUuid()
            tap.ipn = mridMap[tap.ipn] || null
            tap.isn = mridMap[tap.isn] || null
            tap.rated_burden = mridMap[tap.rated_burden] || null
            tap.burden = mridMap[tap.burden] || null
            tap.operating_burden = mridMap[tap.operating_burden] || null
        })
    }
}
