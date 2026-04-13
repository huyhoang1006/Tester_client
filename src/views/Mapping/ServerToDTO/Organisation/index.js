import OrganisationDTO from "@/views/Dto/Organisation";
import uuid from "@/utils/uuid";

export const mapServerToDto = (serverData) => {
    const dto = new OrganisationDTO();
    if (!serverData) return dto;

    const orgData = serverData.organisation || {};

    // 1. Basic info — root level wins vì orgData.name thường null
    dto.name           = serverData.name        || orgData.name        || '';
    dto.aliasName      = serverData.aliasName   || orgData.aliasName   || '';
    dto.comment        = serverData.description || orgData.description || '';
    dto.organisationId = orgData.mRID           || serverData.mRID     || '';
    dto.tax_code       = orgData.taxCode        || serverData.taxCode  || '';
    dto.parentId       = orgData.parentOrganisation || serverData.parentOrganisation || '';

    // 2. ElectronicAddress — chỉ sinh mrid nếu có data thực
    const eAddr        = orgData.electronicAddress || serverData.electronicAddress || {};
    const hasElectronic = !!(eAddr.email || eAddr.fax);
    dto.email          = eAddr.email || '';
    dto.fax            = eAddr.fax   || '';
    dto.electronicAddressId = hasElectronic ? (eAddr.mrid || eAddr.mRID || uuid.newUuid()) : null;

    // 3. Phone — chỉ sinh mrid nếu có data thực
    const phone        = orgData.phone || serverData.phone || {};
    const hasPhone     = !!(phone.ituPhone || phone.localNumber);
    dto.phoneNumber    = phone.ituPhone || phone.localNumber || '';
    dto.telephoneNumberId = hasPhone ? (phone.mrid || phone.mRID || uuid.newUuid()) : null;

    // 4. Address — chỉ sinh mrid nếu có data thực
    const addr         = orgData.streetAddress || serverData.streetAddress || null;
    const street       = addr?.streetDetail    || null;
    const town         = addr?.townDetail      || null;

    const hasStreet    = !!(street?.addressGeneral);
    const hasTown      = !!(town?.city || town?.districtOrTown || town?.wardOrCommune || town?.country);
    const hasAddr      = hasStreet || hasTown;

    dto.street            = street?.addressGeneral  || '';
    dto.ward_or_commune   = town?.wardOrCommune     || '';
    dto.district_or_town  = town?.districtOrTown    || '';
    dto.city              = town?.city              || '';
    dto.state_or_province = town?.stateOrProvince   || '';
    dto.country           = town?.country           || '';
    dto.postal_code       = addr?.postalCode        || '';

    dto.streetDetailId  = hasStreet ? (street?.mrid || street?.mRID || uuid.newUuid()) : null;
    dto.townDetailId    = hasTown   ? (town?.mrid   || town?.mRID   || uuid.newUuid()) : null;
    dto.streetAddressId = hasAddr   ? (addr?.mrid   || addr?.mRID   || uuid.newUuid()) : null;

    // 5. Attachment
    if (serverData.attachment) {
        dto.attachmentId    = serverData.attachment.id   || '';
        dto.attachment.name = serverData.attachment.name || '';
        dto.attachment.path = serverData.attachment.path || '';
    } else {
        dto.attachmentId = '';
        dto.attachment   = { id: '', name: '', path: '', type: '' };
    }

    // 6. PositionPoints
    dto.positionPoints = { x: [], y: [], z: [] };
    if (Array.isArray(serverData.positionPoints)) {
        serverData.positionPoints.forEach(p => {
            if (p.xposition !== null || p.yposition !== null || p.zposition !== null) {
                const pointId = p.mrid || p.mRID || uuid.newUuid();
                dto.positionPoints.x.push({ id: pointId, coor: p.xposition });
                dto.positionPoints.y.push({ id: pointId, coor: p.yposition });
                dto.positionPoints.z.push({ id: pointId, coor: p.zposition });
            }
        });
    }

    return dto;
};