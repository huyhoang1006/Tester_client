import uuid from '@/utils/uuid'

export const importOrganisation = async (dto, parentNode, {electronAPI, mappings}) => {
    try {
        if (parentNode?.mode && parentNode.mode !== 'organisation') {
            return { success: false, message: 'Organisation can only be imported under Organisation' }
        }

        const entity = mappings.OrganisationMapping.OrgDtoToOrgEntity(dto)
        let oldEntity = null

        const resetMrid = () => {
            if (entity?.organisation) {
                entity.organisation.mrid = null
                entity.organisation.parent_organisation = null
            }
        }

        if (dto.clone === true) {
            resetMrid()
        }
        else if (entity.organisation?.mrid) {
            try {
                const existing = await electronAPI.getOrganisationByMrid(entity.organisation.mrid)
                if (
                    existing.success &&
                    existing.data?.organisation?.parent_organisation === parentNode?.mrid
                ) {
                    oldEntity = existing.data
                } else {
                    resetMrid()
                }
            } catch (e) {
                console.warn('Could not fetch existing Organisation:', e)
                resetMrid()
            }
        }

        if (!entity.organisation?.mrid) {
            entity.organisation.mrid = uuid.newUuid()
        }

        if (parentNode?.mrid) {
            entity.organisation.parent_organisation = parentNode.mrid
        }

        return await electronAPI.insertOrganisationEntity(oldEntity || {}, entity)

    } catch (error) {
        console.error('Error importing organisation:', error)
        return { success: false, message: error.message }
    }
}
