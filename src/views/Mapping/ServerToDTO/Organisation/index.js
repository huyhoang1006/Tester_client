import OrganisationDTO from "@/views/Dto/Organisation";

export const mapServerToDto = (serverData) => {
    const dto = new OrganisationDTO();
    if (!serverData) return dto;

    // Lấy object organisation bên trong (nếu có)
    const orgData = serverData.organisation || {};

    // 1. Identification & Basic Info
    // Ưu tiên lấy name, aliasName, description ở cấp ngoài cùng (vì trong JSON mẫu, bên trong orgData bị null)
    dto.name = serverData.name || orgData.name || '';
    dto.aliasName = serverData.aliasName || orgData.aliasName || '';
    dto.comment = serverData.description || orgData.description || '';

    // Ưu tiên lấy ID, taxCode và parentId từ bên trong orgData
    dto.organisationId = orgData.mRID || serverData.mRID || '';
    dto.tax_code = orgData.taxCode || serverData.taxCode || '';
    dto.parentId = orgData.parentOrganisation || serverData.parentOrganisation || '';

    // 2. Contact Info (ElectronicAddress & Phone)
    const eAddr = orgData.electronicAddress || serverData.electronicAddress || {};
    const phone = orgData.phone || serverData.phone || {};

    dto.email = eAddr.email || '';
    dto.fax = eAddr.fax || '';
    dto.phoneNumber = phone.ituPhone || phone.localNumber || '';
    // Lưu ý JSON trả về mrid chữ thường
    dto.electronicAddressId = eAddr.mrid || eAddr.mRID || '';
    dto.telephoneNumberId = phone.mrid || phone.mRID || '';

    // 3. Address Info (StreetAddress -> StreetDetail & TownDetail)
    const addr = orgData.streetAddress || serverData.streetAddress || {};
    const street = addr.streetDetail || {};
    const town = addr.townDetail || {};

    dto.streetAddressId = addr.mrid || addr.mRID || '';
    dto.streetDetailId = street.mrid || street.mRID || '';
    dto.townDetailId = town.mrid || town.mRID || '';

    // Map các trường địa chỉ
    dto.street = street.addressGeneral || '';
    dto.ward_or_commune = town.wardOrCommune || '';
    dto.district_or_town = town.districtOrTown || '';
    dto.city = town.city || '';
    dto.state_or_province = town.stateOrProvince || '';
    dto.country = town.country || '';

    // 4. Attachment
    if (serverData.attachment) {
        dto.attachmentId = serverData.attachment.id || '';
        dto.attachment.name = serverData.attachment.name || '';
        dto.attachment.path = serverData.attachment.path || '';
    } else {
        dto.attachmentId = '';
        dto.attachment = { id: '', name: '', path: '', type: '' };
    }

    // 5. Position Points
    // Luôn khởi tạo mảng rỗng để tránh lỗi "Cannot read property 'x' of undefined" trên UI
    dto.positionPoints = { x: [], y: [], z: [] };

    if (Array.isArray(serverData.positionPoints)) {
        serverData.positionPoints.forEach(p => {
            // Chỉ add vào DTO nếu có ít nhất 1 giá trị tọa độ
            if (p.xposition !== null || p.yposition !== null || p.zposition !== null) {
                const pointId = p.mrid || p.mRID || '';
                dto.positionPoints.x.push({ id: pointId, coor: p.xposition });
                dto.positionPoints.y.push({ id: pointId, coor: p.yposition });
                dto.positionPoints.z.push({ id: pointId, coor: p.zposition });
            }
        });
    }

    return dto;
};