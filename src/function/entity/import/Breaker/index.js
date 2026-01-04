import uuid from '@/utils/uuid'

export const importBreaker = async (dto, parentNode, { electronAPI, mappings }) => {
    try {
        if (
            !parentNode?.mode ||
            !['substation', 'bay', 'breaker'].includes(parentNode.mode)
        ) {
            return {
                success: false,
                message: 'Breaker can only be imported under Substation / Bay / Breaker'
            }
        }

        // Check if mapping exists
        if (!mappings?.BreakerMapping?.mapDtoToEntity) {
            return {
                success: false,
                message: 'BreakerMapping not found or mapDtoToEntity not defined'
            }
        }

        let entity
        // Ensure entity exists
        if (!entity) {
            console.error('mapDtoToEntity returned undefined/null')
            console.error('DTO:', JSON.stringify(dto, null, 2))
            return {
                success: false,
                message: 'Failed to map DTO to entity - entity is undefined'
            }
        }
        
        if (!entity.asset) {
            console.error('entity.asset is undefined')
            console.error('Entity keys:', Object.keys(entity))
            return {
                success: false,
                message: 'Failed to map DTO to entity - asset is undefined'
            }
        }

        const parentLocation = parentNode?.mrid
        const originalLocation = entity?.asset?.location
        let mustCreateNew = false

        if (dto.clone === true) mustCreateNew = true
        else if (!entity?.asset?.mrid) mustCreateNew = true
        else if (originalLocation && originalLocation !== parentLocation) mustCreateNew = true
        else {
            try {
                const exist = await electronAPI.getBreakerEntityByMrid(entity.asset.mrid)
                if (!(exist?.success && exist?.data)) mustCreateNew = true
            } catch {
                mustCreateNew = true
            }
        }

        if (mustCreateNew) {
            if (entity.asset) {
                entity.asset.mrid = uuid.newUuid()
            }
            if (entity.breakerInfo) {
                entity.breakerInfo.mrid = uuid.newUuid?.() || null
            }
            if (entity.nameplate) {
                entity.nameplate.mrid = uuid.newUuid?.() || null
            }
            if (entity.assetPsr) {
                entity.assetPsr = null
            }
        }

        if (!entity.asset.mrid) {
            entity.asset.mrid = uuid.newUuid()
        }

        entity.asset.location = parentLocation

        entity.assetPsr = {
            mrid: uuid.newUuid(),
            asset_id: entity.asset.mrid,
            psr_id: parentLocation
        }

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
        
        let result
        try {
            const CircuitBreakerEntity = (await import('@/views/Flatten/CircuitBreaker')).default
            const emptyEntity = new CircuitBreakerEntity()
            result = await electronAPI.insertBreakerEntity(emptyEntity, entity)
        } catch (insertError) {
            return { success: false, message: `Insert error: ${insertError.message}` }
        }
        
        return { ...result, entity }

    } catch (error) {
        console.error('Error importing breaker:', error)
        return { success: false, message: error.message }
    }
}