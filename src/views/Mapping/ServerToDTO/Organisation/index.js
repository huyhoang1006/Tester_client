import OrganisationDTO from "@/views/Dto/Organisation";

export const mapServerToDto = (serverData) => {
    const dto = new OrganisationDTO();
    if (!serverData) return dto;

    // Ưu tiên lấy từ object lồng 'organisation' nếu có, nếu không lấy root
    const orgData = serverData.organisation || {};

    dto.name = orgData.name || serverData.name || '';
    dto.organisationId = orgData.mRID || serverData.mRID || '';
    dto.comment = orgData.description || serverData.description || '';
    dto.tax_code = orgData.taxCode || '';
    dto.parentId = orgData.parentOrganisation || '';

    // 2. Contact Info (ElectronicAddress & Phone)
    const eAddr = orgData.electronicAddress || {};
    const phone = orgData.phone || {};

    dto.email = eAddr.email || '';
    dto.fax = eAddr.fax || '';
    // Ghép số điện thoại nếu cần, hoặc lấy ituPhone
    dto.phoneNumber = phone.ituPhone || phone.localNumber || '';
    dto.electronicAddressId = eAddr.mRID || '';
    dto.telephoneNumberId = phone.mRID || '';

    // 3. Address Info (StreetAddress -> StreetDetail & TownDetail)
    const addr = orgData.streetAddress || {};
    const street = addr.streetDetail || {};
    const town = addr.townDetail || {};

    dto.streetAddressId = addr.mRID || '';
    dto.streetDetailId = street.mRID || '';
    dto.townDetailId = town.mRID || '';

    // Map các trường địa chỉ
    dto.street = street.addressGeneral || '';
    dto.ward_or_commune = town.wardOrCommune || '';
    dto.district_or_town = town.districtOrTown || '';
    dto.city = town.city || '';
    dto.state_or_province = town.stateOrProvince || '';
    dto.country = town.country || '';

    // 4. Attachment
    // Nếu server trả về object attachment đơn lẻ
    if (serverData.attachment) {
        dto.attachmentId = serverData.attachment.id || '';
        // Map các thuộc tính khác của attachment vào dto.attachment nếu cần
        dto.attachment.name = serverData.attachment.name || '';
        dto.attachment.path = serverData.attachment.path || '';
    }

    // 5. Position Points
    if (Array.isArray(serverData.positionPoints)) {
        serverData.positionPoints.forEach(p => {
            dto.positionPoints.x.push(p.x);
            dto.positionPoints.y.push(p.y);
            dto.positionPoints.z.push(p.z);
        });
    }

    return dto;
};