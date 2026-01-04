import uuid from '@/utils/uuid'

export const importRotatingMachine = async (dto, parentNode, { electronAPI, mappings }) => {
    try {
        if (
            parentNode?.mode &&
            parentNode.mode !== 'substation' &&
            parentNode.mode !== 'bay' &&
            parentNode.mode !== 'rotatingMachine'
        ) {
            return {
                success: false,
                message: 'Rotating machine can only be imported under a Substation, Bay or Rotating Machine'
            }
        }

        const entity = mappings.rotatingMachineMapping.mapDtoToEntity(dto)

        if (!entity || !entity.asset) {
            return {
                success: false,
                message: 'Failed to map DTO to entity - asset is undefined'
            }
        }

        const clearAllMrid = (obj) => {
            if (!obj || typeof obj !== 'object') return

            for (const key of Object.keys(obj)) {
                const value = obj[key]

                if (key === 'mrid') {
                    obj[key] = null
                } else if (typeof value === 'object') {
                    clearAllMrid(value)
                }
            }
        }

        if (dto.clone === true) {
            clearAllMrid(entity)
        }

        else if (entity.asset?.mrid) {
            const originalLocationId = entity.asset.location || dto.locationId
            if (originalLocationId && originalLocationId !== parentNode?.mrid) {
                clearAllMrid(entity)
            } else {
                try {
                    const existing = await electronAPI.getRotatingMachineEntityByMrid(
                        entity.asset.mrid,
                        parentNode?.mrid
                    )

                    if (
                        !(existing?.success &&
                        existing.data?.asset?.location === parentNode?.mrid)
                    ) {
                        clearAllMrid(entity)
                    }
                } catch (err) {
                    clearAllMrid(entity)
                }
            }
        }

        entity.asset.location = null

        if (!entity.asset.mrid) {
            entity.asset.mrid = uuid.newUuid()
        }

        if (!entity.rotatingMachine.mrid) {
            entity.rotatingMachine.mrid = uuid.newUuid()
        }
        entity.asset.asset_info = entity.rotatingMachine.mrid

        if (!entity.lifecycleDate.mrid) {
            entity.lifecycleDate.mrid = uuid.newUuid()
        }
        entity.asset.lifecycle_date = entity.lifecycleDate.mrid

        if (!entity.productAssetModel.mrid) {
            entity.productAssetModel.mrid = uuid.newUuid()
        }
        entity.asset.product_asset_model = entity.productAssetModel.mrid

        if (!entity.assetPsr.mrid) {
            entity.assetPsr.mrid = uuid.newUuid()
        }
        entity.assetPsr.asset_id = entity.asset.mrid
        // Only set psr_id if parent exists and is valid PSR type
        if (parentNode?.mrid && (parentNode.mode === 'bay' || parentNode.mode === 'substation')) {
            entity.assetPsr.psr_id = parentNode.mrid
        } else {
            entity.assetPsr.psr_id = null
        }

        // Generate mrids for measurement arrays and update references
        for (let i = 0; i < entity.currentFlow.length; i++) {
            if (!entity.currentFlow[i].mrid) {
                entity.currentFlow[i].mrid = uuid.newUuid()
            }
        }
        if (entity.currentFlow[0]) entity.rotatingMachine.rated_current = entity.currentFlow[0].mrid
        if (entity.currentFlow[1]) entity.rotatingMachine.rated_ifd = entity.currentFlow[1].mrid

        for (let i = 0; i < entity.voltage.length; i++) {
            if (!entity.voltage[i].mrid) {
                entity.voltage[i].mrid = uuid.newUuid()
            }
        }
        if (entity.voltage[0]) entity.rotatingMachine.rated_u = entity.voltage[0].mrid
        if (entity.voltage[1]) entity.rotatingMachine.rated_ufd = entity.voltage[1].mrid

        for (let i = 0; i < entity.frequency.length; i++) {
            if (!entity.frequency[i].mrid) {
                entity.frequency[i].mrid = uuid.newUuid()
            }
        }
        if (entity.frequency[0]) entity.rotatingMachine.rated_frequency = entity.frequency[0].mrid

        for (let i = 0; i < entity.apparentPower.length; i++) {
            if (!entity.apparentPower[i].mrid) {
                entity.apparentPower[i].mrid = uuid.newUuid()
            }
        }
        if (entity.apparentPower[0]) entity.rotatingMachine.rated_power = entity.apparentPower[0].mrid

        // Ensure attachment has proper structure
        if (!entity.attachment || typeof entity.attachment !== 'object') {
            entity.attachment = { id: null, path: '[]' }
        }
        if (!entity.attachment.path) {
            entity.attachment.path = '[]'
        }

        const result = await electronAPI.insertRotatingMachineEntity(entity)

        return {
            ...result,
            entity
        }
    } catch (error) {
        console.error('Error importing rotating machine:', error)
        return {
            success: false,
            message: error.message || 'Import rotating machine failed'
        }
    }
}
