import OrganisationEntity from '@/views/Flatten/Organisation';
import GeoMap from '@/views/Flatten/GeoMap';
import OrganisationDto from '@/views/Dto/Organisation';

export const OrgDtoToOrgEntity = (orgDto) => {
    const orgEntity = new OrganisationEntity();
    // Organisation
    orgEntity.organisation.mrid = orgDto.organisationId || null;
    orgEntity.organisation.name = orgDto.name || null;
    orgEntity.organisation.tax_code = orgDto.tax_code || null;
    orgEntity.organisation.description = orgDto.comment || null;
    orgEntity.organisation.street_address = orgDto.streetAddressId || null;
    orgEntity.organisation.electronic_address = orgDto.electronicAddressId || null;
    orgEntity.organisation.phone = orgDto.telephoneNumberId || null;
    orgEntity.organisation.parent_organisation = orgDto.parentId

    //address address
    orgEntity.streetAddress.mrid = orgDto.streetAddressId || null;
    orgEntity.streetAddress.town_detail = orgDto.townDetailId || null;
    orgEntity.streetAddress.street_detail = orgDto.streetDetailId || null;

    //Street detail
    orgEntity.streetDetail.mrid = orgDto.streetDetailId || null;
    orgEntity.streetDetail.address_general = orgDto.street || null;

    //Town detail
    orgEntity.townDetail.mrid = orgDto.townDetailId || null;
    orgEntity.townDetail.ward_or_commune = orgDto.ward_or_commune || null;
    orgEntity.townDetail.district_or_town = orgDto.district_or_town || null;
    orgEntity.townDetail.state_or_province = orgDto.state_or_province || null;
    orgEntity.townDetail.country = orgDto.country || null;
    orgEntity.townDetail.city = orgDto.city || null;

    //Electronic address
    orgEntity.electronicAddress.mrid = orgDto.electronicAddressId || null;
    orgEntity.electronicAddress.email = orgDto.email || null;
    orgEntity.electronicAddress.fax = orgDto.fax || null;

    //Telephone number
    orgEntity.telephoneNumber.mrid = orgDto.telephoneNumberId || null;
    orgEntity.telephoneNumber.itu_phone = orgDto.phoneNumber || null;

    //Attachment
    orgEntity.attachment.mrid = orgDto.attachmentId || null;
    orgEntity.attachment = orgDto.attachment || null;

    //configurationEvent
    if (Array.isArray(orgDto.configurationEvent) && orgDto.configurationEvent.length > 0) {
        orgEntity.configurationEvent = orgDto.configurationEvent
    }

    if(Array.isArray(orgDto.positionPoints.x) && orgDto.positionPoints.x.length > 0) {
        for (let i = 0; i < orgDto.positionPoints.x.length; i++) {
            const geoMapPoint = new GeoMap();
            geoMapPoint.mrid = orgDto.positionPoints.x[i].id || null;
            geoMapPoint.x = orgDto.positionPoints.x[i].coor || null;
            geoMapPoint.y = orgDto.positionPoints.y[i].coor || null;
            geoMapPoint.z = orgDto.positionPoints.z[i].coor || null;
            geoMapPoint.organisation_id = orgDto.organisationId || null;
            orgEntity.positionPoints.push(geoMapPoint);
        }
    }

    return orgEntity;
};

export const OrgEntityToOrgDto = (orgEntity) => {
    const orgDto = new OrganisationDto();

    // Organisation
    orgDto.organisationId = orgEntity.organisation.mrid || ''
    orgDto.name = orgEntity.organisation.name || ''
    orgDto.tax_code = orgEntity.organisation.tax_code || ''
    orgDto.comment = orgEntity.organisation.description || ''
    orgDto.streetAddressId = orgEntity.organisation.street_address || ''
    orgDto.electronicAddressId = orgEntity.organisation.electronic_address || ''
    orgDto.telephoneNumberId = orgEntity.organisation.phone || ''
    orgDto.parentId = orgEntity.organisation.parent_organisation || '';
    

    // Street Address
    orgDto.streetAddressId = orgEntity.streetAddress.mrid || '';

        
    // Street Detail

    orgDto.streetDetailId = orgEntity.streetDetail.mrid || '';
    orgDto.street = orgEntity.streetDetail.address_general || '';

    // Town Detail

    orgDto.townDetailId = orgEntity.townDetail.mrid || '';
    orgDto.ward_or_commune = orgEntity.townDetail.ward_or_commune || '';
    orgDto.district_or_town = orgEntity.townDetail.district_or_town || '';
    orgDto.state_or_province = orgEntity.townDetail.state_or_province || '';
    orgDto.country = orgEntity.townDetail.country || '';
    orgDto.city = orgEntity.townDetail.city || '';

    // Electronic Address
    orgDto.electronicAddressId = orgEntity.electronicAddress.mrid || '';
    orgDto.email = orgEntity.electronicAddress.email || '';
    orgDto.fax = orgEntity.electronicAddress.fax || '';

    // Telephone Number
    orgDto.telephoneNumberId = orgEntity.telephoneNumber.mrid || '';
    orgDto.phoneNumber = orgEntity.telephoneNumber.itu_phone || '';

    // Attachment
    orgDto.attachmentId = orgEntity.attachment.mrid || '';
    orgDto.attachment = orgEntity.attachment;

    // Configuration Events
    if (orgEntity.configurationEvent && Array.isArray(orgEntity.configurationEvent)) {
        orgDto.configurationEvent = orgEntity.configurationEvent;
    }

    // Position Points
    orgDto.positionPoints = { x: [], y: [], z: [] };
    if (orgEntity.positionPoints && Array.isArray(orgEntity.positionPoints)) {
        for (let i = 0; i < orgEntity.positionPoints.length; i++) {
            const pt = orgEntity.positionPoints[i];
            if (pt) {
                orgDto.positionPoints.x.push({ id: pt.mrid, coor: pt.x });
                orgDto.positionPoints.y.push({ id: pt.mrid, coor: pt.y });
                orgDto.positionPoints.z.push({ id: pt.mrid, coor: pt.z });
            }
        }
    }

    return orgDto;
};
