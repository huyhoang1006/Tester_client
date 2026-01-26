import SubstationDto from "@/views/Dto/Substation";

export const mapServerToDto = (serverData) => {
    const dto = new SubstationDto();
    if (!serverData) return dto;

    // 1. Root & Substation Level
    dto.subsId = serverData.mRID || '';
    dto.name = serverData.name || '';
    dto.comment = serverData.description || '';

    // Các cờ boolean trong JSON trả về string "false"/"true" hoặc boolean
    dto.generation = String(serverData.generation) || '';
    dto.industry = String(serverData.industry) || '';

    // PSR Type
    if (serverData.psrType) {
        dto.psrTypeId = serverData.psrType.mRID || '';
        dto.type = serverData.psrType.name || ''; // Map tên loại trạm
    }

    // 2. Location & Address
    const loc = serverData.location || {};
    dto.locationId = loc.mRID || '';
    dto.locationName = loc.name || '';

    // Main Address trong Location
    const mainAddr = loc.mainAddress || {};
    const street = mainAddr.streetDetail || {};
    const town = mainAddr.townDetail || {};

    dto.streetAddressId = mainAddr.mRID || '';
    dto.streetDetailId = street.mRID || '';
    dto.townDetailId = town.mRID || '';

    dto.street = street.addressGeneral || '';
    dto.ward_or_commune = town.wardOrCommune || '';
    dto.district_or_town = town.districtOrTown || '';
    dto.city = town.city || '';
    dto.state_or_province = town.stateOrProvince || '';
    dto.country = town.country || '';

    // 3. Contact Info (Lấy từ Location)
    const eAddr = loc.electronicAddress || {};
    const phone = loc.phone || {};

    dto.electronicAddressId = eAddr.mRID || '';
    dto.telephoneNumberId = phone.mRID || '';

    dto.email = eAddr.email || '';
    dto.fax = eAddr.fax || '';
    dto.phoneNumber = phone.ituPhone || phone.localNumber || '';

    // 4. Person Info (Lấy người đầu tiên trong danh sách persons)
    if (Array.isArray(loc.persons) && loc.persons.length > 0) {
        const person = loc.persons[0];
        dto.personId = person.mRID || '';
        dto.personName = person.name || ''; // Hoặc ghép firstName + lastName
        dto.position = person.description || ''; // JSON mẫu dùng description cho chức vụ (ví dụ: Trưởng kíp)

        // Nếu person có thông tin liên lạc riêng, có thể ghi đè hoặc map vào trường khác
        // dto.phoneNumber = person.mobilePhone?.ituPhone || dto.phoneNumber;
    }

    // 5. Position Points (Nếu Substation có tọa độ, thường nằm trong Location hoặc list riêng)
    // Giả sử logic giống Organisation nếu có
    if (Array.isArray(serverData.positionPoints)) {
        serverData.positionPoints.forEach(p => {
            dto.positionPoints.x.push(p.x);
            dto.positionPoints.y.push(p.y);
            dto.positionPoints.z.push(p.z);
        });
    }

    return dto;
};