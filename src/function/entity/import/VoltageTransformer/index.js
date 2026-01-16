import uuid from '@/utils/uuid'

export const importVoltageTransformer = async (dto, parentNode, { electronAPI, mappings }) => {
    try {
        if (
            parentNode?.mode &&
            parentNode.mode !== 'substation' &&
            parentNode.mode !== 'bay' &&
            parentNode.mode !== 'voltageTransformer'
        ) {
            return { 
                success: false, 
                message: 'Voltage transformer can only be imported under a Substation, Bay or Voltage Transformer' 
            }
        }

        // Ensure dto has required structure before mapping
        dto.properties = dto.properties || {}
        dto.ratings = dto.ratings || {}
        dto.ratings.rated_frequency = dto.ratings.rated_frequency || {}
        dto.ratings.rated_voltage = dto.ratings.rated_voltage || {}
        dto.ratings.standard = typeof dto.ratings.standard === 'object' ? JSON.stringify(dto.ratings.standard) : (dto.ratings.standard || '')
        dto.ratings.upr = dto.ratings.upr || ''
        dto.vt_Configuration = dto.vt_Configuration || {}
        dto.vt_Configuration.windings = dto.vt_Configuration.windings || ''
        dto.vt_Configuration.dataVT = dto.vt_Configuration.dataVT || []
        dto.attachment = dto.attachment || { path: '[]' }

        const entity = mappings.VoltageTransformerMapping.mapDtoToEntity(dto)
        let oldEntity = null
        let shouldRegenerate = false

        // --- Logic Check: Update vs New vs Clone ---

        // 1. Explicit Clone
        if (dto.clone === true) {
            shouldRegenerate = true
        }
        // 2. Check by MRID
        else if (entity.asset?.mrid) {
            const originalLocationId = entity.asset.location || dto.locationId

            // Case: Moving to a different parent -> Treat as New (Copy)
            if (originalLocationId && originalLocationId !== parentNode?.mrid) {
                shouldRegenerate = true
            } else {
                // Case: Same parent -> Check DB for update
                try {
                    const existing = await electronAPI.getVoltageTransformerEntityByMrid(
                        entity.asset.mrid,
                        parentNode?.mrid
                    )

                    if (
                        existing?.success &&
                        existing?.data?.asset?.location === parentNode?.mrid
                    ) {
                        oldEntity = existing.data
                    } else {
                        shouldRegenerate = true // Not found or location mismatch
                    }
                } catch (e) {
                    console.warn('Check existing VoltageTransformer failed, treating as new:', e)
                    shouldRegenerate = true
                }
            }
        } 
        // 3. No MRID -> New
        else {
            shouldRegenerate = true
        }

        // Apply ID Regeneration if needed
        if (shouldRegenerate) {
            regenerateAllMrids(entity)
        }

        // --- FIX: Location vs AssetPsr ---
        // Asset.location references the 'Location' table (Coordinates/Address), NOT the parent container.
        entity.asset.location = null

        // Ensure AssetPsr logic
        if (!entity.assetPsr) {
            entity.assetPsr = {
                mrid: uuid.newUuid(),
                asset_id: entity.asset.mrid,
                psr_id: parentNode?.mrid || null
            }
        } else {
            // Update links
            entity.assetPsr.asset_id = entity.asset.mrid
            entity.assetPsr.psr_id = parentNode?.mrid || null
            
            if (shouldRegenerate && !entity.assetPsr.mrid) {
                 entity.assetPsr.mrid = uuid.newUuid()
            }
        }

        // Normalize Attachment
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

        // Insert vào database
        const result = await electronAPI.insertVoltageTransformerEntity(oldEntity || {}, entity)
        return { ...result, entity }

    } catch (error) {
        console.error('Error importing voltage transformer:', error)
        return { success: false, message: error.message }
    }
}

// Helper to regenerate UUID for object and nested arrays
const regenerateAllMrids = (entity) => {
    const newAssetMrid = uuid.newUuid()
    const newAssetInfoMrid = uuid.newUuid()
    const newProductAssetModelMrid = uuid.newUuid()
    const newLifecycleDateMrid = uuid.newUuid()
    
    // 1. Asset
    entity.asset.mrid = newAssetMrid
    entity.asset.asset_info = newAssetInfoMrid
    entity.asset.product_asset_model = newProductAssetModelMrid
    entity.asset.lifecycle_date = newLifecycleDateMrid
    entity.asset.location = null
    
    // 2. Asset Info (OldPotentialTransformerInfo uses the same ID usually, or linked)
    // The mapping seems to put info in 'OldPotentialTransformerInfo' primarily for this type?
    // Let's ensure both standard assetInfo logic and specific logic work.
    
    if (entity.assetInfo) {
        entity.assetInfo.mrid = newAssetInfoMrid
        entity.assetInfo.product_asset_model = newProductAssetModelMrid
    }
    
    // Fix: Key name from DB Transaction file is 'OldPotentialTransformerInfo' (Capitalized)
    if (entity.OldPotentialTransformerInfo) {
        entity.OldPotentialTransformerInfo.mrid = newAssetInfoMrid
        entity.OldPotentialTransformerInfo.product_asset_model = newProductAssetModelMrid
    }
    // Also check lowercase just in case mapping changes
    if (entity.oldPotentialTransformerInfo) {
        entity.oldPotentialTransformerInfo.mrid = newAssetInfoMrid
        entity.oldPotentialTransformerInfo.product_asset_model = newProductAssetModelMrid
    }

    // 3. ProductAssetModel
    if (entity.productAssetModel) {
        entity.productAssetModel.mrid = newProductAssetModelMrid
    }

    // 4. LifecycleDate
    if (entity.lifecycleDate) {
        entity.lifecycleDate.mrid = newLifecycleDateMrid
    }

    // 5. AssetPsr
    if (entity.assetPsr) {
        entity.assetPsr.mrid = uuid.newUuid()
        entity.assetPsr.asset_id = newAssetMrid
        entity.assetPsr.psr_id = null
    } else {
        entity.assetPsr = {
            mrid: uuid.newUuid(),
            asset_id: newAssetMrid,
            psr_id: null
        }
    }
    
    // 6. Attachment
    if (entity.attachment?.mrid) {
        entity.attachment.mrid = uuid.newUuid()
    }

    // 7. Regenerate Units & update references
    const mridMap = {}
    const regenerateUnit = (unit) => {
        if (unit && unit.mrid) {
            const oldMrid = unit.mrid
            const newMrid = uuid.newUuid()
            mridMap[oldMrid] = newMrid
            unit.mrid = newMrid
        }
    }

    if (entity.voltage) entity.voltage.forEach(regenerateUnit)
    if (entity.currentFlow) entity.currentFlow.forEach(regenerateUnit)
    if (entity.seconds) entity.seconds.forEach(regenerateUnit)
    if (entity.frequency) entity.frequency.forEach(regenerateUnit)
    if (entity.resistance) entity.resistance.forEach(regenerateUnit)
    if (entity.percent) entity.percent.forEach(regenerateUnit)
    if (entity.apparentPower) entity.apparentPower.forEach(regenerateUnit)
    if (entity.temperature) entity.temperature.forEach(regenerateUnit)
    if (entity.ratio) entity.ratio.forEach(regenerateUnit)
    if (entity.angle) entity.angle.forEach(regenerateUnit)
    if (entity.capacitance) entity.capacitance.forEach(regenerateUnit)

    // Update references in OldPotentialTransformerInfo
    const updateInfoRefs = (info) => {
        if (!info) return
        info.rated_frequency = mridMap[info.rated_frequency] || null
        info.rated_voltage = mridMap[info.rated_voltage] || null // Fix: likely just rated_voltage based on logs
        
        // Other potential fields
        info.um_rms = mridMap[info.um_rms] || null
        info.rated_power_frequency_withstand_voltage = mridMap[info.rated_power_frequency_withstand_voltage] || null
        info.rated_lightning_impulse_withstand_voltage = mridMap[info.rated_lightning_impulse_withstand_voltage] || null
        info.system_voltage = mridMap[info.system_voltage] || null
        info.bil = mridMap[info.bil] || null
    }

    if (entity.OldPotentialTransformerInfo) updateInfoRefs(entity.OldPotentialTransformerInfo)
    if (entity.oldPotentialTransformerInfo) updateInfoRefs(entity.oldPotentialTransformerInfo)

    // 8. PotentialTransformerTable (was VtWindingInfo)
    // DB uses 'potentialTransformerTable'
    if (entity.potentialTransformerTable) {
        entity.potentialTransformerTable.forEach(item => {
            const oldItemMrid = item.mrid
            const newItemMrid = uuid.newUuid()
            mridMap[oldItemMrid] = newItemMrid

            item.mrid = newItemMrid
            item.potential_transformer_info_id = newAssetInfoMrid // Ensure FK link
            
            // Map units if they exist in this table
            item.usr_rated_voltage = mridMap[item.usr_rated_voltage] || null
            item.rated_burden = mridMap[item.rated_burden] || null
        })
    }
}
