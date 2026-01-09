import uuid from '@/utils/uuid'

export const importOrganisation = async (dto, parentNode, {electronAPI, mappings}) => {
    try {
        if (parentNode && parentNode.mode && parentNode.mode !== 'organisation') {
            return { success: false, message: 'Organisation can only be imported under Organisation' }
        }

        const entity = mappings.OrganisationMapping.OrgDtoToOrgEntity(dto)

        const resetMrid = () => {
            if (entity && entity.organisation) {
                entity.organisation.mrid = null
                entity.organisation.parent_organisation = null
            }
        }

        if (dto.clone === true) {
            resetMrid()
        }
        else if (entity.organisation && entity.organisation.mrid) {
            try {
                const existing = await electronAPI.getOrganisationEntityByMrid(entity.organisation.mrid)
                if (
                    !(existing.success &&
                    existing.data && existing.data.organisation &&
                    existing.data.organisation.parent_organisation === (parentNode && parentNode.mrid))
                ) {
                    resetMrid()
                }
            } catch (e) {
                console.warn('Could not fetch existing Organisation:', e)
                resetMrid()
            }
        }

        if (!(entity.organisation && entity.organisation.mrid)) {
            entity.organisation.mrid = uuid.newUuid()
        }

        if (parentNode && parentNode.mrid) {
            entity.organisation.parent_organisation = parentNode.mrid
        }

        return await electronAPI.insertParentOrganizationEntity(entity)

    } catch (error) {
        console.error('Error importing organisation:', error)
        return { success: false, message: error.message }
    }
}
