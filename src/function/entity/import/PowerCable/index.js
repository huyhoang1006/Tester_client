import uuid from '@/utils/uuid'

export const importPowerCable = async (dto, parentNode, { electronAPI, mappings }) => {
    try {
        if (
            parentNode?.mode &&
            parentNode.mode !== 'substation' &&
            parentNode.mode !== 'bay' &&
            parentNode.mode !== 'powerCable'
        ) {
            return { success: false, message: 'Power cable can only be imported under a Substation, Bay or PowerCable' }
        }

        const entity = mappings.PowerCableMapping.mapDtoToEntity(dto)
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
            } 
            else {
                // Case: Same parent -> Check DB for update
                try {
                    const existing = await electronAPI.getPowerCableEntityByMrid(entity.asset.mrid)

                    if (
                        existing?.success &&
                        existing?.data?.asset?.location === parentNode?.mrid
                    ) {
                        oldEntity = existing.data
                    } else {
                        shouldRegenerate = true // Not found or location mismatch
                    }
                } catch (e) {
                    console.warn('Check existing PowerCable failed, treating as new:', e)
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

        // --- FIX: Safe Entity Building (Initialize missing arrays/objects) ---
        // This prevents "Cannot read property 'map' of undefined" in the DB layer
        const ensureArray = (key) => {
            if (!Array.isArray(entity[key])) entity[key] = []
        }
        const ensureObject = (key) => {
            if (!entity[key] || typeof entity[key] !== 'object') entity[key] = {}
        }

        ensureArray('area')
        ensureArray('currentFlow')
        ensureArray('second')
        ensureArray('frequency')
        ensureArray('length')
        ensureArray('voltage')
        ensureArray('temperature')
        
        ensureObject('lifecycleDate')
        ensureObject('productAssetModel')
        ensureObject('concentricNeutral')
        ensureObject('joint')
        ensureObject('sheathVoltageLimiter')
        ensureObject('terminal')
        ensureObject('oldCableInfo')
        
        // --- FIX: Ensure IDs for Sub-objects ---
        // If ensureObject created an empty object {}, it needs an MRID for SQL Insert
        const ensureMrid = (obj, parentInfoId = null) => {
             if (obj && !obj.mrid) {
                 obj.mrid = uuid.newUuid()
                 if (parentInfoId) {
                     // Specific FK logic if known. 
                     // Usually Joint/Terminal/etc link back to CableInfo (ConcentricNeutral), but here they link TO ConcentricNeutral via cable_info_id?
                     // Actually, based on schemas: joint_cable_info has cable_info_id.
                     if (obj !== entity.concentricNeutral) {
                         obj.cable_info_id = parentInfoId
                     }
                 }
             }
        }

        // Ensure Asset Info (PowerCable) mrid exists
        if (!entity.asset.asset_info) {
             const newInfoId = uuid.newUuid()
             entity.asset.asset_info = newInfoId
             if (entity.powerCable) entity.powerCable.mrid = newInfoId
        }
        
        // Ensure ConcentricNeutral (the main CableInfo)
        if (!entity.concentricNeutral.mrid) {
            entity.concentricNeutral.mrid = entity.asset.asset_info || uuid.newUuid()
        }
        
        const cableInfoId = entity.concentricNeutral.mrid
        
        ensureMrid(entity.joint, cableInfoId)
        ensureMrid(entity.terminal, cableInfoId)
        ensureMrid(entity.sheathVoltageLimiter, cableInfoId)
        ensureMrid(entity.oldCableInfo, cableInfoId)
        ensureMrid(entity.lifecycleDate)
        ensureMrid(entity.productAssetModel)

        // Also ensure oldEntity has structure if it's being used for update
        if (oldEntity) {
            if (!Array.isArray(oldEntity.area)) oldEntity.area = []
            if (!Array.isArray(oldEntity.currentFlow)) oldEntity.currentFlow = []
            if (!Array.isArray(oldEntity.second)) oldEntity.second = []
            if (!Array.isArray(oldEntity.frequency)) oldEntity.frequency = []
            if (!Array.isArray(oldEntity.length)) oldEntity.length = []
            if (!Array.isArray(oldEntity.voltage)) oldEntity.voltage = []
            if (!Array.isArray(oldEntity.temperature)) oldEntity.temperature = []
        }
        else {
             // Create empty oldEntity with required arrays for Insert
            oldEntity = {
                area: [],
                currentFlow: [],
                second: [],
                frequency: [],
                length: [],
                voltage: [],
                temperature: []
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
        const result = await electronAPI.insertPowerCableEntity(oldEntity, entity)
        return { ...result, entity }

    } catch (error) {
        console.error('Error importing power cable:', error)
        return { success: false, message: error.message }
    }
}

const regenerateAllMrids = (entity) => {
    // Helper to regenerate UUID for object and nested arrays
    const newAssetMrid = uuid.newUuid()
    
    // 1. Asset & Core Info
    entity.asset.mrid = newAssetMrid
    
    const newAssetInfoMrid = uuid.newUuid()
    if (entity.assetInfo) entity.assetInfo.mrid = newAssetInfoMrid
    entity.asset.asset_info = newAssetInfoMrid
    
    const newProductAssetModelMrid = uuid.newUuid()
    if (entity.productAssetModel) entity.productAssetModel.mrid = newProductAssetModelMrid
    entity.asset.product_asset_model = newProductAssetModelMrid

    const newLifecycleDateMrid = uuid.newUuid()
    if (entity.lifecycleDate) entity.lifecycleDate.mrid = newLifecycleDateMrid
    entity.asset.lifecycle_date = newLifecycleDateMrid

    // 2. AssetPsr
    if (entity.assetPsr) {
        entity.assetPsr.mrid = uuid.newUuid()
        entity.assetPsr.asset_id = newAssetMrid
        entity.assetPsr.psr_id = null // Will be set in main function
    } else {
         entity.assetPsr = {
            mrid: uuid.newUuid(),
            asset_id: newAssetMrid,
            psr_id: null
        }
    }

    // 3. PowerCable specific parts
    // Note: In CIM, PowerCable might be mapped to assetInfo (ConcentricNeutralCableInfo)
    // Here we ensure consistency
    
    if (entity.concentricNeutral) {
        entity.concentricNeutral.mrid = newAssetInfoMrid
    }
    
    if (entity.oldPowerCableInfo) {
        entity.oldPowerCableInfo.mrid = newAssetInfoMrid
    }
    
    // Joint/Terminal often link to the cable info
    if (entity.joint) {
        entity.joint.mrid = uuid.newUuid()
        entity.joint.cable_info_id = newAssetInfoMrid
    }
    if (entity.terminal) {
        entity.terminal.mrid = uuid.newUuid()
        entity.terminal.cable_info_id = newAssetInfoMrid
    }
    if (entity.sheathVoltageLimiter) {
        entity.sheathVoltageLimiter.mrid = uuid.newUuid()
        entity.sheathVoltageLimiter.cable_info_id = newAssetInfoMrid
    }
    if (entity.oldCableInfo) {
        entity.oldCableInfo.mrid = uuid.newUuid()
        entity.oldCableInfo.cable_info_id = newAssetInfoMrid
    }

    // 4. Regenerate Units
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
    if (entity.length) entity.length.forEach(regenerateUnit)
    if (entity.resistance) entity.resistance.forEach(regenerateUnit)
    if (entity.capacitance) entity.capacitance.forEach(regenerateUnit)
    if (entity.temperature) entity.temperature.forEach(regenerateUnit)
    if (entity.area) entity.area.forEach(regenerateUnit)
    if (entity.frequency) entity.frequency.forEach(regenerateUnit)
    if (entity.second) entity.second.forEach(regenerateUnit)

    // 5. Wire Arrangements (Nested structure)
    if (entity.wireArrangement) {
        entity.wireArrangement.forEach(wire => {
            wire.mrid = uuid.newUuid()
            wire.power_cable_info_id = newAssetInfoMrid
        })
    }

    // 6. Update References in OldPowerCableInfo if exists
    if (entity.oldPowerCableInfo) {
        const info = entity.oldPowerCableInfo
        info.rated_voltage = mridMap[info.rated_voltage] || null
        info.nominal_voltage = mridMap[info.nominal_voltage] || null
        info.max_operating_voltage = mridMap[info.max_operating_voltage] || null
        info.max_current = mridMap[info.max_current] || null
        info.rated_current = mridMap[info.rated_current] || null
        // Add more fields if they map to unit tables
    }
}