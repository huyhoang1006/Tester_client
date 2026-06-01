import SubstationDto from "@/views/Dto/Substation";
import uuid from "@/utils/uuid";

export const mapServerToDto = (serverData) => {
    const dto = new SubstationDto();
    if (!serverData) return dto;

    // ── 1. Root level ─────────────────────────────────────────────────────────
    dto.subsId    = serverData.mRID        || '';
    dto.name      = serverData.name        || '';
    dto.aliasName = serverData.aliasName   || '';
    dto.comment   = serverData.description || '';

    // FIX: String(null) = "null" → kiểm tra null trước khi convert
    dto.generation = serverData.generation != null ? String(serverData.generation) : '';
    dto.industry   = serverData.industry   != null ? String(serverData.industry)   : '';

    // PSR Type
    if (serverData.psrType) {
        dto.psrTypeId = serverData.psrType.mRID  || '';
        dto.type      = serverData.psrType.name  || '';
    }

    // ── 2. Location & Address ─────────────────────────────────────────────────
    const loc      = serverData.location   || {};
    const mainAddr = loc.mainAddress       || {};
    const street   = mainAddr.streetDetail || {};
    const town     = mainAddr.townDetail   || {};

    dto.locationId   = loc.mRID       || '';
    dto.locationName = loc.name       || '';

    // FK ids
    dto.streetAddressId = mainAddr.mrid || mainAddr.mRID || '';
    dto.streetDetailId  = street.mrid   || street.mRID   || '';
    dto.townDetailId    = town.mrid     || town.mRID     || '';

    // Giá trị hiển thị
    dto.street            = street.addressGeneral  || '';
    dto.ward_or_commune   = town.wardOrCommune     || '';
    dto.district_or_town  = town.districtOrTown    || '';
    dto.city              = town.city              || '';
    dto.state_or_province = town.stateOrProvince   || '';
    dto.country           = town.country           || '';

    // ── 3. Contact Info (từ Location) ─────────────────────────────────────────
    const eAddr = loc.electronicAddress || {};
    const phone = loc.phone             || {};

    // FK ids
    dto.electronicAddressId = eAddr.mrid || eAddr.mRID || '';
    dto.telephoneNumberId   = phone.mrid || phone.mRID || '';

    // Giá trị hiển thị
    dto.email       = eAddr.email || '';
    dto.fax         = eAddr.fax   || '';
    dto.phoneNumber = phone.ituPhone || phone.localNumber || '';

    // ── 4. Person Info (lấy người đầu tiên) ──────────────────────────────────
    if (Array.isArray(loc.persons) && loc.persons.length > 0) {
        const person = loc.persons[0];
        dto.personId   = person.mRID        || person.mrid || '';
        dto.personName = person.name        || '';
        dto.position   = person.description || '';
        // department chưa có trong server response — để trống
        dto.department = person.department  || '';
    }

    // ── 5. Position Points ────────────────────────────────────────────────────
    // Server chưa trả về field này — giữ default {x:[], y:[], z:[]}
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

    // ── 6. Attachment ─────────────────────────────────────────────────────────
    // Server chưa trả về field này — giữ default
    if (serverData.attachment) {
        dto.attachmentId    = serverData.attachment.id   || '';
        dto.attachment.name = serverData.attachment.name || '';
        dto.attachment.path = serverData.attachment.path || '[]';
    } else {
        dto.attachmentId = '';
        dto.attachment   = { id: '', name: '', path: '[]', type: '' };
    }

    return dto;
};