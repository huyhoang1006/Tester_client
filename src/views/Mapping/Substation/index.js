import SubstationEntity from '@/views/Entity/Substation/index'
import SubstationDto from '@/views/Dto/Substation/index'
import PositionPoint from '@/views/Cim/PositionPoint'

export function mapDtoToEntity(dto) {
    const entity = new SubstationEntity()

    // Map các trường đơn giản
    entity.substation.name = dto.name || null
    entity.substation.generation = dto.generation || null
    entity.substation.industry = dto.industry || null
    entity.substation.description = dto.comment || null
    entity.substation.subsId = dto.subsId || null

    // PSR Type
    entity.psrType.name = dto.type || null

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
    entity.streetAddress.town_detail = dto.townDetail || null
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
    entity.telephoneNumber.itu_phone = dto.telephoneNumber || null

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

    // Map attachment
    entity.attachment.id = dto.attachmentId || null
    entity.attachment = dto.attachment || null

    //position
    if(this.positionPoints.x.length !== 0) {
        this.positionPoints.x.forEach((element, index) => {
            const positionPoint = new PositionPoint
            positionPoint.mrid = element.id || null
            positionPoint.x_position = element.coor || null
            positionPoint.y_position = this.positionPoints.y[index].coor || null
            positionPoint.z_position = this.positionPoints.z[index].coor || null
            entity.positionPoint.push(positionPoint)
        });
    }

    //user
    entity.user.user_id = dto.userId || null

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

    return entity
}

export function mapEntityToDto(entity) {
    const dto = {}

    // Map các trường đơn giản
    dto.name = entity.substation.name || null
    dto.type = entity.substation.type || null
    dto.generation = entity.substation.generation || null
    dto.industry = entity.substation.industry || null
    dto.comment = entity.substation.description || null
    dto.subsId = entity.substation.subsId || null

    // StreetAddress
    dto.streetDetailId = entity.streetAddress.street_detail || null
    dto.townDetail = entity.streetAddress.town_detail || null
    dto.streetAddressId = entity.streetAddress.mrid || null

    // TownDetail
    dto.townDetailId = entity.townDetail.mrid || null
    dto.city = entity.townDetail.city || null
    dto.state_or_province = entity.townDetail.state_or_province || null
    dto.country = entity.townDetail.country || null
    dto.district_or_town = entity.townDetail.district_or_town || null
    dto.ward_or_commune = entity.townDetail.ward_or_commune || null

    // StreetDetail
    dto.street = entity.streetDetail.address_general || null
    // mrid đã map ở trên

    // Location
    dto.locationId = entity.location.mrid || null
    dto.locationName = entity.location.name || null
    // main_address đã map ở trên

    // electronicAddress
    dto.electronicAddressId = entity.electronicAddress.mrid || null
    dto.email = entity.electronicAddress.email || null
    dto.fax = entity.electronicAddress.fax || null

    // telephoneNumber
    dto.telephoneNumberId = entity.telephoneNumber.mrid || null
    dto.telephoneNumber = entity.telephoneNumber.itu_phone || null

    // person
    dto.personId = entity.person.mrid || null
    dto.personName = entity.person.name || null
    dto.electronicAddressId = entity.person.electronic_address || null
    dto.telephoneNumberId = entity.person.mobile_phone || null
    dto.personRoleId = entity.person.roles || null

    // personRole
    dto.personRoleId = entity.personRole.mrid || null
    dto.department = entity.personRole.department || null
    dto.position = entity.personRole.position || null

    // attachment
    dto.attachmentId = entity.attachment.id || null
    dto.attachment = entity.attachment || null

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
    dto.userId = entity.user.user_id || null

    // userIdentifiedObject
    dto.userIdentifiedObjectId = entity.userIdentifiedObject.mrid || null

    // personSubstation
    dto.personSubstationId = entity.personSubstation.mrid || null

    // organisationLocation
    dto.organisationLocationId = entity.organisationLocation.mrid || null
    dto.organisationId = entity.organisationLocation.organisation_id || null

    return dto
}