import uuid from '@/utils/uuid'
import CapacitorEntity from '@/views/Flatten/Capacitor'

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

        const entity = mappings.CapacitorMapping.mapDtoToEntity(dto)
        let oldEntity = null

        const resetMrid = () => {
            if (!entity?.asset) return
            entity.asset.mrid = null
            entity.asset.location = null
        }

        if (dto.clone === true) {
            resetMrid()
        }
        else if (entity.asset?.mrid) {
            const originalLocationId = entity.asset.location || dto.locationId

            if (originalLocationId && originalLocationId !== parentNode?.mrid) {
                resetMrid()
            } else {
                try {
                    const existing = await electronAPI.getCapacitorEntityByMrid(
                        entity.asset.mrid,
                        parentNode?.mrid || null
                    )

                    if (existing.success && existing.data?.asset?.location === parentNode?.mrid) {
                        oldEntity = existing.data
                    } else {
                        resetMrid()
                    }
                } catch (e) {
                    console.warn('Could not fetch existing Capacitor:', e)
                    resetMrid()
                }
            }
        }

        if (!entity.asset?.mrid) {
            entity.asset.mrid = uuid.newUuid()
        }

        if (parentNode?.locationId) {
            entity.asset.location = parentNode.locationId
        } else {
            entity.asset.location = null
        }

        const validPsrModes = ['substation', 'bay', 'voltage_level', 'equipment']
        const isPsrParent = parentNode?.mode && validPsrModes.includes(parentNode.mode)
        
        entity.assetPsr = {
            mrid: uuid.newUuid(),
            asset_id: entity.asset.mrid,
            psr_id: isPsrParent ? parentNode.mrid : null
        }

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

        const emptyEntity = oldEntity || new CapacitorEntity()
        const result = await electronAPI.insertCapacitorEntity(emptyEntity, entity)
        return { ...result, entity }

    } catch (error) {
        console.error('Error importing capacitor:', error)
        return { success: false, message: error.message }
    }
}
