import uuid from '@/utils/uuid'

export const importPowerCable = async (dto, parentNode, {electronAPI, mappings}) => {
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
                    const existing = await electronAPI.getPowerCableEntityByMrid(entity.asset.mrid)

                    if (existing.success && existing.data?.asset?.location === parentNode?.mrid) {
                        oldEntity = existing.data
                    } else {
                        resetMrid()
                    }
                } catch (e) {
                    console.warn('Could not fetch existing PowerCable:', e)
                    resetMrid()
                }
            }
        }

        if (!entity.asset?.mrid) {
            entity.asset.mrid = uuid.newUuid()
        }

        if (parentNode?.mrid) {
            entity.asset.location = parentNode.mrid
        }

        const result = await electronAPI.insertPowerCableEntity(oldEntity || {}, entity)
        return { ...result, entity }

    } catch (error) {
        console.error('Error importing power cable:', error)
        return { success: false, message: error.message }
    }
}
