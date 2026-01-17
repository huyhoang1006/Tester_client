import uuid from '@/utils/uuid'

export const importCapacitor = async (dto, parentNode, { electronAPI, mappings }) => {
    try {
        if (
            parentNode?.mode &&
            parentNode.mode !== 'substation' &&
            parentNode.mode !== 'bay' &&
            parentNode.mode !== 'capacitor'
        ) {
            return {
                success: false,
                message: 'Capacitor can only be imported under a Substation, Bay or Capacitor'
            }
        }

        const entity = mappings.CapacitorMapping.mapDtoToEntity(dto);
        if (!entity.asset) {
            return { success: false, message: 'Failed to map DTO to a valid asset entity.' };
        }

        let mustCreateNewMrid = false;
        const parentMrid = parentNode?.mrid;

        // Client-side logic to determine if a new MRID is needed
        if (dto.clone === true) {
            mustCreateNewMrid = true;
        } else if (!entity.asset.mrid) {
            mustCreateNewMrid = true;
        } else {
            const originalLocationId = entity.asset.location || dto.locationId;
            if (originalLocationId && originalLocationId !== parentMrid) {
                mustCreateNewMrid = true; // "Move" operation
            } else {
                try {
                    const existing = await electronAPI.getCapacitorEntityByMrid(entity.asset.mrid, parentMrid);
                    if (!existing.success || !existing.data?.asset) {
                         mustCreateNewMrid = true; // Does not exist
                    }
                    // If it exists, we overwrite, so keep the MRID.
                } catch (e) {
                    console.warn('Could not fetch existing Capacitor:', e);
                    mustCreateNewMrid = true; // Safer to create new on error
                }
            }
        }

        if (mustCreateNewMrid) {
            entity.asset.mrid = uuid.newUuid();
        }

        // Generate MRIDs for child entities if missing
        // This is critical for delete to work properly
        for (const voltage of entity.voltage) {
            if (!voltage.mrid) {
                voltage.mrid = uuid.newUuid();
            }
        }
        
        for (const currentFlow of entity.currentFlow) {
            if (!currentFlow.mrid) {
                currentFlow.mrid = uuid.newUuid();
            }
        }
        
        for (const frequency of entity.frequency) {
            if (!frequency.mrid) {
                frequency.mrid = uuid.newUuid();
            }
        }
        
        for (const reactivePower of entity.reactivePower) {
            if (!reactivePower.mrid) {
                reactivePower.mrid = uuid.newUuid();
            }
        }
        
        for (const capacitance of entity.capacitance) {
            if (!capacitance.mrid) {
                capacitance.mrid = uuid.newUuid();
            }
        }
        
        for (const mass of entity.mass) {
            if (!mass.mrid) {
                mass.mrid = uuid.newUuid();
            }
        }
        
        for (const percent of entity.percent) {
            if (!percent.mrid) {
                percent.mrid = uuid.newUuid();
            }
        }

        // Standardize parent linking
        entity.asset.location = null;
        const validPsrModes = ['substation', 'bay', 'voltage_level', 'equipment'];
        const isPsrParent = parentNode?.mode && validPsrModes.includes(parentNode.mode);
        
        entity.assetPsr = {
            mrid: uuid.newUuid(),
            asset_id: entity.asset.mrid,
            psr_id: isPsrParent ? parentNode.mrid : null
        };

        // Normalize attachments
        if (!entity.asset.attachment) {
            entity.asset.attachment = { id: null, path: '[]', name: null, type: 'asset', id_foreign: null };
        } else if (!entity.asset.attachment.path) {
            entity.asset.attachment.path = '[]';
        }
        entity.asset.attachment.id_foreign = entity.asset.mrid;

        if (!entity.attachment) {
            entity.attachment = { id: null, path: '[]', name: null, type: 'asset', id_foreign: null };
        } else if (!entity.attachment.path) {
            entity.attachment.path = '[]';
        }
        entity.attachment.id_foreign = entity.asset.mrid;

        // CRITICAL FIX: Pass null as old_data (first argument) for insert operation
        // Backend expects: insertCapacitorEntity(old_data, data)
        const result = await electronAPI.insertCapacitorEntity(null, entity);
        return { ...result, entity };

    } catch (error) {
        console.error('Error importing capacitor:', error)
        return { success: false, message: error.message }
    }
}

export const deleteCapacitor = async (mrid, psrId, { electronAPI }) => {
    try {
        if (!mrid) {
            return { success: false, message: 'MRID is required for deletion' }
        }

        const entityRes = await electronAPI.getCapacitorEntityByMrid(mrid, psrId)
        if (!entityRes.success || !entityRes.data) {
            console.warn(`Capacitor with mrid ${mrid} not found for deletion, assuming it's already deleted.`)
            return { success: true, message: 'Capacitor not found, assumed already deleted.' }
        }

        const result = await electronAPI.deleteCapacitorEntity(entityRes.data)
        return result

    } catch (error) {
        console.error('Error deleting capacitor:', error)
        return { success: false, message: error?.message || 'Delete Capacitor failed' }
    }
}
