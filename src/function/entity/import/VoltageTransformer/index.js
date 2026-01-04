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

        // =============== TỰ CLEAR MRID ===============
        const regenerateAllIds = (obj) => {
            if (!obj || typeof obj !== 'object') return

            Object.keys(obj).forEach(key => {
                const value = obj[key]

                if (key === 'mrid' || key === 'id') {
                    obj[key] = uuid.newUuid()
                }
                else if (Array.isArray(value)) {
                    value.forEach(v => regenerateAllIds(v))
                }
                else if (typeof value === 'object') {
                    regenerateAllIds(value)
                }
            })
        }

        if (dto.clone === true) {
            regenerateAllIds(entity)
        }

        else if (entity.asset?.mrid) {
            const originalLocationId = entity.asset.location || dto.locationId

            // Import sang chỗ khác → tạo mới
            if (originalLocationId && originalLocationId !== parentNode?.mrid) {
                regenerateAllIds(entity)
            } else {
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
                        regenerateAllIds(entity)
                    }
                } catch {
                    regenerateAllIds(entity)
                }
            }
        }

        entity.asset.location = null

        if (!entity.asset.mrid) {
            entity.asset.mrid = uuid.newUuid()
        }

        entity.assetPsr = {
            mrid: uuid.newUuid(),
            asset_id: entity.asset.mrid,
            psr_id: parentNode?.mrid
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

        const result = await electronAPI.insertVoltageTransformerEntity(oldEntity || {}, entity)
        return { ...result, entity }

    } catch (error) {
        console.error('Error importing voltage transformer:', error)
        return { success: false, message: error.message }
    }
}
