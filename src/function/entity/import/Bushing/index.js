import uuid from '@/utils/uuid'

export const importBushing = async (dto, parentNode, { electronAPI, mappings }) => {
    try {
        if (!parentNode?.mode || !['substation', 'bay', 'bushing'].includes(parentNode.mode)) {
            return { success: false, message: 'Bushing can only be imported under Substation, Bay, or Bushing' };
        }

        const entity = mappings.BushingMapping.mapDtoToEntity(dto);
        if (!entity.bushing) {
            return { success: false, message: 'Failed to map DTO to a valid bushing entity.' };
        }

        let mustCreateNewMrid = false;
        const parentMrid = parentNode?.mrid;

        // Client-side logic to determine if a new MRID is needed
        if (dto.clone === true) {
            mustCreateNewMrid = true;
        } else if (!entity.bushing.mrid) {
            mustCreateNewMrid = true;
        } else {
            const originalLocationId = entity.bushing.location || dto.locationId;
            if (originalLocationId && originalLocationId !== parentMrid) {
                mustCreateNewMrid = true; // This is a "move" operation, so treat as new
            } else {
                try {
                    const existing = await electronAPI.getBushingEntityByMrid(entity.bushing.mrid);
                    if (!existing.success || !existing.data?.bushing) {
                         mustCreateNewMrid = true; // Does not exist in DB, so we are creating
                    }
                    // If it exists, we are overwriting, so we keep the original MRID
                } catch {
                    mustCreateNewMrid = true; // Error during fetch, safer to create new
                }
            }
        }
        
        if (mustCreateNewMrid) {
            entity.bushing.mrid = uuid.newUuid();
        }

        // Standardize linking to use AssetPsr and nullify location
        entity.bushing.location = null;
        entity.assetPsr = {
            mrid: uuid.newUuid(), // AssetPsr is always new for an import
            asset_id: entity.bushing.mrid,
            psr_id: parentMrid || null,
        };

        // Ensure attachment is correctly formatted and linked
        if (!entity.attachment) {
            entity.attachment = { id: null, path: '[]', name: null, type: 'asset', id_foreign: entity.bushing.mrid };
        } else {
            entity.attachment.path = entity.attachment.path || '[]';
        }
        entity.attachment.id_foreign = entity.bushing.mrid;

        // Call the API with a single entity argument, as originally designed
        const result = await electronAPI.insertBushingEntity(entity);

        return { ...result, entity };

    } catch (error) {
        console.error('Error importing bushing:', error);
        return { success: false, message: error.message };
    }
};

export const deleteBushing = async (mrid, psrId, { electronAPI }) => {
    try {
        if (!mrid) {
            return { success: false, message: 'MRID is required for deletion' }
        }

        const entityRes = await electronAPI.getBushingEntityByMrid(mrid, psrId)
        if (!entityRes.success || !entityRes.data) {
            console.warn(`Bushing with mrid ${mrid} not found, assuming it's already deleted.`)
            return { success: true, message: 'Bushing not found, assumed already deleted.' }
        }

        const result = await electronAPI.deleteBushingEntity(entityRes.data)
        return result

    } catch (error) {
        console.error('Error deleting bushing:', error)
        return { success: false, message: error?.message || 'Delete Bushing failed' }
    }
}
