/* eslint-disable */
import SubstationEntity from '@/views/Flatten/Substation/index'
// import SubstationDto from '@/views/Dto/Substation/index'
import PositionPoint from '@/views/Cim/PositionPoint'
import ConfigurationEvent from '@/views/Cim/ConfigurationEvent'
import SubstationDto from '@/views/Dto/Substation'

export function mapDtoToEntity(dto) {
    const entity = new SubstationEntity()

    // Map các trường đơn giản
    entity.substation.name = dto.name || null
    entity.substation.generation = dto.generation || null
    entity.substation.industry = dto.industry || null
    entity.substation.description = dto.comment || null
    entity.substation.mrid = dto.subsId || null
    entity.substation.location = dto.locationId || null

    // PSR Type
    entity.psrType.name = dto.type || null
    entity.psrType.mrid = dto.psrTypeId || null
    entity.substation.psr_type_id = dto.psrTypeId || null

    // TownDetail
    entity.townDetail.mrid = dto.townDetailId || null
    entity.townDetail.city = dto.city || null
    entity.townDetail.state_or_province = dto.state_or_province || null
    entity.townDetail.country = dto.country || null
    entity.townDetail.district_or_town = dto.district_or_town || null
    entity.townDetail.ward_or_commune = dto.ward_or_commune || null

    // StreetDetail
    entity.streetDetail.address_general = dto.street || null
    entity.streetDetail.mrid = dto.streetDetailId || null

    // StreetAddress
    entity.streetAddress.street_detail = dto.streetDetailId || null
    entity.streetAddress.town_detail = dto.townDetailId || null
    entity.streetAddress.mrid = dto.streetAddressId || null

    //location
    entity.location.mrid = dto.locationId || null
    entity.location.name = dto.locationName || null
    entity.location.main_address = dto.streetAddressId || null

    // electronicAddress
    entity.electronicAddress.mrid = dto.electronicAddressId || null
    entity.electronicAddress.email = dto.email || null
    entity.electronicAddress.fax = dto.fax || null

    //telephoneNumber
    entity.telephoneNumber.mrid = dto.telephoneNumberId || null
    entity.telephoneNumber.itu_phone = dto.phoneNumber || null

    // person
    entity.person.mrid = dto.personId || null
    entity.person.name = dto.personName || null
    entity.person.electronic_address = dto.electronicAddressId || null
    entity.person.mobile_phone = dto.telephoneNumberId || null
    entity.person.roles = dto.personRoleId || null

    // personRole
    entity.personRole.mrid = dto.personRoleId || null
    entity.personRole.department = dto.department || null
    entity.personRole.position = dto.position || null
    entity.personRole.person = dto.personId || null

    // Map attachment
    entity.attachment.id = dto.attachmentId || null
    entity.attachment = dto.attachment || null

    //position
    if (dto.positionPoints.x.length !== 0) {
        dto.positionPoints.x.forEach((element, index) => {
            const positionPoint = new PositionPoint
            positionPoint.location = dto.locationId || null
            positionPoint.mrid = element.id || null
            positionPoint.x_position = element.coor || null
            positionPoint.y_position = dto.positionPoints.y[index].coor || null
            positionPoint.z_position = dto.positionPoints.z[index].coor || null
            entity.positionPoint.push(positionPoint)
        });
    }

    //user
    entity.user.user_id = dto.userId || null
    entity.user.username = dto.userName || null

    //userIdentifiedObject
    entity.userIdentifiedObject.mrid = dto.userIdentifiedObjectId || null
    entity.userIdentifiedObject.identified_object_id = dto.subsId || null
    entity.userIdentifiedObject.user_id = dto.userId || null

    //personSubstation
    entity.personSubstation.mrid = dto.personSubstationId || null
    entity.personSubstation.substation_id = dto.subsId || null
    entity.personSubstation.person_id = dto.personId || null

    //organisationLocation
    entity.organisationLocation.mrid = dto.organisationLocationId || null
    entity.organisationLocation.organisation_id = dto.organisationId || null
    entity.organisationLocation.location_id = dto.locationId || null

    //organisationPerson
    entity.organisationPerson.mrid = dto.organisationPersonId || null
    entity.organisationPerson.organisation_id = dto.organisationId || null
    entity.organisationPerson.person_id = dto.personId || null

    //organisationPsr
    entity.organisationPsr.mrid = dto.organisationPsrId || null
    entity.organisationPsr.organisation_id = dto.organisationId || null
    entity.organisationPsr.psr_id = dto.subsId || null

    //configurationEvent
    if (Array.isArray(dto.configurationEvent) && dto.configurationEvent.length > 0) {
        entity.configurationEvent = dto.configurationEvent
    }

    return entity
}

export function mapEntityToDto(entity) {
    const dto = new SubstationDto()

    // substation
    dto.name = entity.substation.name || ''
    dto.generation = entity.substation.generation || ''
    dto.industry = entity.substation.industry || ''
    dto.comment = entity.substation.description || ''
    dto.subsId = entity.substation.mrid || ''

    // StreetAddress
    dto.streetAddressId = entity.streetAddress.mrid || ""

    // TownDetail
    dto.townDetailId = entity.townDetail.mrid || ""
    dto.city = entity.townDetail.city || ""
    dto.state_or_province = entity.townDetail.state_or_province || ""
    dto.country = entity.townDetail.country || ""
    dto.district_or_town = entity.townDetail.district_or_town || ""
    dto.ward_or_commune = entity.townDetail.ward_or_commune || ""

    // StreetDetail
    dto.streetDetailId = entity.streetDetail.mrid || ""
    dto.street = entity.streetDetail.address_general || ""
    // mrid đã map ở trên

    // Location
    dto.locationId = entity.location.mrid || ""
    dto.locationName = entity.location.name || ""
    // main_address đã map ở trên

    // electronicAddress
    dto.electronicAddressId = entity.electronicAddress.mrid || ""
    dto.email = entity.electronicAddress.email || ""
    dto.fax = entity.electronicAddress.fax || ""

    // telephoneNumber
    dto.telephoneNumberId = entity.telephoneNumber.mrid || ""
    dto.phoneNumber = entity.telephoneNumber.itu_phone || ""

    //psrType
    dto.psrTypeId = entity.psrType.mrid || ""
    dto.type = entity.psrType.name || ""

    // person
    dto.personId = entity.person.mrid || ""
    dto.personName = entity.person.name || ""

    // personRole
    dto.personRoleId = entity.personRole.mrid || ""
    dto.department = entity.personRole.department || ""
    dto.position = entity.personRole.position || ""

    // attachment
    dto.attachmentId = entity.attachment.id || ""
    dto.attachment = entity.attachment || ""

    // positionPoints (nếu có)
    // Tùy vào cấu trúc thực tế, bạn có thể map lại thành mảng x, y, z như ban đầu
    // Ở đây chỉ trả về mảng các object positionPoint
    dto.positionPoints = { x: [], y: [], z: [] }
    if (Array.isArray(entity.positionPoint)) {
        entity.positionPoint.forEach(point => {
            dto.positionPoints.x.push({ id: point.mrid, coor: point.x_position })
            dto.positionPoints.y.push({ id: point.mrid, coor: point.y_position })
            dto.positionPoints.z.push({ id: point.mrid, coor: point.z_position })
        })
    }

    // user
    dto.userId = entity.user.user_id || ""

    // userIdentifiedObject
    dto.userIdentifiedObjectId = entity.userIdentifiedObject.mrid || ""

    // personSubstation
    dto.personSubstationId = entity.personSubstation.mrid || ""

    // organisationLocation
    dto.organisationLocationId = entity.organisationLocation.mrid || ""
    dto.organisationId = entity.organisationLocation.organisation_id || ""

    // organisationPerson
    dto.organisationPersonId = entity.organisationPerson.mrid || ""

    // organisationPsr
    dto.organisationPsrId = entity.organisationPsr.mrid || ""

    return dto
}