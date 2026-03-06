import OrganisationDTO from "@/views/Dto/Organisation";

export const mapServerToDto = (serverData) => {
    const dto = new OrganisationDTO();
    if (!serverData) return dto;

    // Ưu tiên lấy từ object lồng 'organisation' nếu có, nếu không lấy root
    const orgData = serverData.organisation || {};

    // FIX: aliasName riêng biệt với name
    dto.name = orgData.name || serverData.name || '';
    dto.aliasName = orgData.aliasName || serverData.aliasName || '';
    dto.organisationId = orgData.mRID || serverData.mRID || '';
    dto.comment = orgData.description || serverData.description || '';
    // FIX: Thêm serverData fallback cho taxCode và parentId
    dto.tax_code = orgData.taxCode || serverData.taxCode || '';
    dto.parentId = orgData.parentOrganisation || serverData.parentOrganisation || '';

    // 2. Contact Info (ElectronicAddress & Phone)
    // FIX: Thêm serverData fallback
    const eAddr = orgData.electronicAddress || serverData.electronicAddress || {};
    const phone = orgData.phone || serverData.phone || {};

    dto.email = eAddr.email || '';
    dto.fax = eAddr.fax || '';
    dto.phoneNumber = phone.ituPhone || phone.localNumber || '';
    dto.electronicAddressId = eAddr.mRID || '';
    dto.telephoneNumberId = phone.mRID || '';

    // 3. Address Info (StreetAddress -> StreetDetail & TownDetail)
    // FIX: Thêm serverData fallback
    const addr = orgData.streetAddress || serverData.streetAddress || {};
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
        dto.attachment.name = serverData.attachment.name || '';
        dto.attachment.path = serverData.attachment.path || '';
    }

    // 5. Position Points - FIX: Map đúng field từ API và kiểm tra null
    // API trả về: xposition, yposition, zposition, mrid
    if (Array.isArray(serverData.positionPoints)) {
        serverData.positionPoints.forEach(p => {
            // Chỉ add vào DTO nếu có ít nhất 1 giá trị không null
            if (p.xposition !== null || p.yposition !== null || p.zposition !== null) {
                dto.positionPoints.x.push({ id: p.mrid, coor: p.xposition });
                dto.positionPoints.y.push({ id: p.mrid, coor: p.yposition });
                dto.positionPoints.z.push({ id: p.mrid, coor: p.zposition });
            }
        });
    }

    return dto;
};