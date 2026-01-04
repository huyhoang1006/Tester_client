import uuid from '@/utils/uuid'

export const importTransformer = async (dto, parentNode, { electronAPI, mappings }) => {
    try {
        if (
            parentNode?.mode &&
            parentNode.mode !== 'substation' &&
            parentNode.mode !== 'bay' &&
            parentNode.mode !== 'transformer'
        ) {
            return {
                success: false,
                message: 'Transformer can only be imported under Substation, Bay or Transformer'
            }
        }

        const entity = mappings.TransformerMapping.transformerDtoToEntity(dto)
        let oldEntity = null

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
                else if (typeof value === 'object' && value !== null) {
                    regenerateAllIds(value)
                }
            })
        }

        if (dto.clone === true) {
            regenerateAllIds(entity)
        }

        else if (entity?.asset?.mrid) {
            const originalLocationId = entity.asset.location || dto.locationId

            if (originalLocationId && originalLocationId !== parentNode?.mrid) {
                regenerateAllIds(entity)
            } 
            else {
                try {
                    const existing = await electronAPI.getTransformerEntityByMrid(
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

        if (parentNode?.mrid) {
            entity.asset.location = parentNode.mrid
        }

        if (!entity.asset.mrid) {
            entity.asset.mrid = uuid.newUuid()
        }

        const buildSafeEntity = () => {
            const obj = {}

            const arrayKeys = [
                'percent','voltage','currentFlow','seconds',
                'activePower','apparentPower','mass','volume',
                'temperature','frequency','baseVoltage','basePower',

                'oldTransformerEndInfo',
                'voltageRating',
                'coolingPowerRating',
                'currentRating',
                'shortCircuitTest',
                'shortCircuitTestTransformerEndInfo',
                'zeroSequenceImpedanceTable'
            ]

            arrayKeys.forEach(k => obj[k] = [])

            obj.shortCircuitRating = {}
            obj.zeroSequenceImpedance = {}
            obj.oldPowerTransformerInfo = {}
            obj.lifecycleDate = {}
            obj.productAssetModel = {}
            obj.assetPsr = {}

            obj.asset = obj.asset || {}
            obj.asset.attachment = {
                id: null,
                path: '[]',
                name: null,
                type: 'asset',
                id_foreign: null
            }

            return obj
        }

        if (!oldEntity) {
            oldEntity = buildSafeEntity()
        }

        const normalizeAssetAttachment = (obj) => {
            if (!obj.asset) obj.asset = {}

            if (!obj.asset.attachment) {
                obj.asset.attachment = {
                    id: null,
                    path: '[]',
                    name: null,
                    type: 'asset',
                    id_foreign: null
                }
            } else if (!obj.asset.attachment.path) {
                obj.asset.attachment.path = '[]'
            }
        }

        normalizeAssetAttachment(oldEntity)
        normalizeAssetAttachment(entity)

        const result = await electronAPI.insertTransformerEntity(oldEntity, entity)

        return { ...result, entity }

    } catch (error) {
        console.error('Error importing transformer:', error)
        return { success: false, message: error.message }
    }
}