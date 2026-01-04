import uuid from '@/utils/uuid'

export const importSubstation = async (dto, parentNode, {electronAPI, mappings}) => {
    try {
        // Validate parent
        if (parentNode?.mode && parentNode.mode !== 'organisation' && parentNode.mode !== 'substation') {
            return {
                success: false,
                message: 'Substation can only be imported under Organisation or Substation'
            }
        }

        // DTO -> Entity
        const entity = mappings.SubstationMapping.mapDtoToEntity(dto) || {}

        // Ensure structure
        entity.substation ??= {}
        entity.organisationPsr ??= {}
        entity.userIdentifiedObject ??= {}
        entity.personSubstation ??= {}

        // Always new Substation
        const newSubstationMrid = uuid.newUuid()

        entity.substation.mrid = newSubstationMrid
        entity.substation.psr_type_id = entity?.psrType?.mrid || null

        // PSR link - organisation_id phải là mrid của Organisation, không phải Substation
        entity.organisationPsr.mrid = uuid.newUuid()
        entity.organisationPsr.psr_id = newSubstationMrid

        if (parentNode?.mode === 'organisation' && parentNode?.mrid) {
            // Parent là Organisation -> dùng trực tiếp
            entity.organisationPsr.organisation_id = parentNode.mrid
        } else if (parentNode?.mode === 'substation' && parentNode?.organisation_id) {
            // Parent là Substation -> lấy organisation_id từ parent
            entity.organisationPsr.organisation_id = parentNode.organisation_id
        } else if (parentNode?.mrid) {
            // Fallback: thử dùng mrid (có thể gây lỗi FK nếu không phải organisation)
            entity.organisationPsr.organisation_id = parentNode.organisation_id || null
        } else {
            entity.organisationPsr.organisation_id = null
        }

        // IdentifiedObject
        entity.userIdentifiedObject.mrid = uuid.newUuid()
        entity.userIdentifiedObject.identified_object_id = newSubstationMrid

        // Person link
        if (entity.personSubstation) {
            entity.personSubstation.mrid = uuid.newUuid()
            entity.personSubstation.substation_id = newSubstationMrid
        }

        // ===== NEW LOCATION / ADDRESS =====
        if (entity.location) entity.location.mrid = uuid.newUuid()
        if (entity.streetAddress) entity.streetAddress.mrid = uuid.newUuid()
        if (entity.streetDetail) entity.streetDetail.mrid = uuid.newUuid()
        if (entity.townDetail) entity.townDetail.mrid = uuid.newUuid()

        if (Array.isArray(entity.positionPoint)) {
            entity.positionPoint.forEach(p => p.mrid = uuid.newUuid())
        }

        if (Array.isArray(entity.attachment)) {
            entity.attachment.forEach(a => a.mrid = uuid.newUuid())
        }

        if (Array.isArray(entity.configurationEvent)) {
            entity.configurationEvent.forEach(e => e.mrid = uuid.newUuid())
        }
        
        const result = await electronAPI.insertSubstationEntity(entity)
        return {
            ...result,
            entity
        }

    } catch (error) {
        console.error('Error importing substation:', error)
        return {
            success: false,
            message: error?.message || 'Import Substation failed'
        }
    }
}
