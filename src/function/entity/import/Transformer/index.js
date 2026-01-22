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

        // Improved ID Regeneration with Reference Update
        const regenerateIdsAndRelink = (obj) => {
            const idMap = new Map();

            // Pass 1: Collect old IDs and generate new ones
            const collectAndGenerate = (current) => {
                if (!current || typeof current !== 'object') return;

                if (current.mrid) {
                    const oldId = current.mrid;
                    const newId = uuid.newUuid();
                    idMap.set(oldId, newId);
                    current.mrid = newId;
                }
                if (current.id) { 
                    const oldId = current.id;
                    const newId = uuid.newUuid();
                    idMap.set(oldId, newId);
                    current.id = newId;
                }

                Object.values(current).forEach(value => {
                     if (Array.isArray(value)) {
                        value.forEach(v => collectAndGenerate(v));
                    } else if (typeof value === 'object' && value !== null) {
                        collectAndGenerate(value);
                    }
                });
            };

            collectAndGenerate(obj);

            // Pass 2: Update references
            const updateReferences = (current) => {
                if (!current || typeof current !== 'object') return;

                Object.keys(current).forEach(key => {
                    if (key === 'mrid' || key === 'id') return; // Skip already updated IDs

                    const value = current[key];
                    if (typeof value === 'string' && idMap.has(value)) {
                        current[key] = idMap.get(value);
                    } else if (Array.isArray(value)) {
                         value.forEach(v => updateReferences(v));
                    } else if (typeof value === 'object' && value !== null) {
                        updateReferences(value);
                    }
                });
            };

            updateReferences(obj);
        };

        if (dto.clone === true) {
            regenerateIdsAndRelink(entity)
        }

        else if (entity?.asset?.mrid) {
            const originalLocationId = entity.asset.location || dto.locationId

            if (originalLocationId && originalLocationId !== parentNode?.mrid) {
                regenerateIdsAndRelink(entity)
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
                        regenerateIdsAndRelink(entity)
                    }
                } catch {
                    regenerateIdsAndRelink(entity)
                }
            }
        }

        // Link to Parent
        if (parentNode?.mrid) {
            entity.asset.location = parentNode.mrid
        } else {
            entity.asset.location = null
        }

        if (!entity.asset.mrid) {
            entity.asset.mrid = uuid.newUuid()
        }

        if (parentNode?.mrid) {
            entity.assetPsr = {
                mrid: uuid.newUuid(),
                asset_id: entity.asset.mrid,
                psr_id: parentNode.mrid
            }
        } else {
            entity.assetPsr = null
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

export const deleteTransformer = async (mrid, psrId, { electronAPI }) => {
    try {
        if (!mrid) {
            return { success: false, message: 'MRID is required for deletion' }
        }

        const entityRes = await electronAPI.getTransformerFullEntityByMrid(mrid, psrId)
        if (!entityRes.success || !entityRes.data) {
            console.warn(`Transformer with mrid ${mrid} not found for deletion, assuming it's already deleted.`)
            return { success: true, message: 'Transformer not found, assumed already deleted.' }
        }

        const result = await electronAPI.deleteTransformerEntity(entityRes.data)
        return result

    } catch (error) {
        console.error('Error deleting transformer:', error)
        return { success: false, message: error?.message || 'Delete Transformer failed' }
    }
}
