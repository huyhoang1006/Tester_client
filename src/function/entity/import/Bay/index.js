import uuid from '@/utils/uuid'

export const importBay = async (dto, parentNode, { electronAPI }) => {
    try {
        if (!parentNode?.mode || !parentNode?.mrid) {
            return { success: false, message: 'Invalid parent node' }
        }

        const entity = { ...dto }

        if (parentNode.mode === 'substation') {
            entity.substation = parentNode.mrid

        } else if (parentNode.mode === 'voltageLevel' || parentNode.mode === 'voltage') {
            entity.voltage_level = parentNode.mrid

            const res = await electronAPI.getVoltageLevelEntityByMrid(parentNode.mrid)
            if (res.success && res.data?.voltageLevel?.substation) {
                entity.substation = res.data.voltageLevel.substation
            }

        } else if (parentNode.mode === 'bay') {
            const res = await electronAPI.getBayEntityByMrid(parentNode.mrid)
            if (res.success && res.data) {
                entity.substation = res.data.substation
                entity.voltage_level = res.data.voltage_level
            }

        } else {
            return { success: false, message: 'Bay can only be imported under Substation / VoltageLevel / Bay' }
        }

        if (entity.mrid) {
            const old = await electronAPI.getBayEntityByMrid(entity.mrid)

            const moved =
                !old?.success ||
                !old.data ||
                old.data.substation !== entity.substation ||
                old.data.voltage_level !== entity.voltage_level

            if (moved) {
                entity.mrid = uuid.newUuid()
            }
        }

        if (!entity.mrid) {
            entity.mrid = uuid.newUuid()
        }

        return await electronAPI.insertBayEntity(entity)

    } catch (error) {
        console.error('Error importing bay:', error)
        return { success: false, message: error.message }
    }
}