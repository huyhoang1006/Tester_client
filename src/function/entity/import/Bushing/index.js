import uuid from '@/utils/uuid'

export const importBushing = async (dto, parentNode, { electronAPI, mappings }) => {
    try {
        if (
            !parentNode?.mode ||
            !['substation', 'bay', 'bushing'].includes(parentNode.mode)
        ) {
            return {
                success: false,
                message: 'Bushing can only be imported under Substation / Bay / Bushing'
            }
        }

        const entity = mappings.BushingMapping.mapDtoToEntity(dto)

        const parentLocation = parentNode?.mrid
        const originalLocation = entity?.bushing?.location || dto.locationId
        let mustCreateNew = false

        if (dto.clone === true) mustCreateNew = true
        else if (!entity?.bushing?.mrid) mustCreateNew = true
        else if (originalLocation && originalLocation !== parentLocation) mustCreateNew = true
        else {
            try {
                const exist = await electronAPI.getBushingEntityByMrid(entity.bushing.mrid)
                if (!(exist?.success && exist?.data?.bushing)) {
                    mustCreateNew = true
                } else if (exist.data.bushing.location !== parentLocation) {
                    mustCreateNew = true
                }
            } catch {
                mustCreateNew = true
            }
        }

        if (mustCreateNew) {
            if (entity.bushing) {
                entity.bushing.mrid = uuid.newUuid()
            }

            entity.assetPsr = null
        }

        if (!entity.bushing.mrid) {
            entity.bushing.mrid = uuid.newUuid()
        }

        if (parentLocation) {
            entity.bushing.location = parentLocation
            entity.bushing.locationId = parentLocation
            entity.bushing.parentId = parentLocation
        }

        entity.assetPsr = {
            mrid: uuid.newUuid(),
            asset_id: entity.bushing.mrid,
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

        const result = await electronAPI.insertBushingEntity(entity)

        return { ...result, entity }

    } catch (error) {
        console.error('Error importing bushing:', error)
        return { success: false, message: error.message }
    }
}
