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
    const hasTown      = !!(town?.city || town?.districtOrTown || town?.wardOrCommune
        || town?.stateOrProvince || town?.country);
    const hasAddr      = hasStreet || hasTown || !!addr?.postalCode;

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
        dto.attachmentId    = serverData.attachment.mRID || serverData.attachment.mrid
            || serverData.attachment.id || '';
        dto.attachment.id   = dto.attachmentId;
        dto.attachment.name = serverData.attachment.name || '';
        dto.attachment.path = serverData.attachment.path || '';
        dto.attachment.type = serverData.attachment.type || '';
    } else {
        dto.attachmentId = '';
        dto.attachment   = { id: '', name: '', path: '', type: '' };
    }

    // 6. PositionPoints
    dto.positionPoints = { x: [], y: [], z: [] };
    if (Array.isArray(serverData.positionPoints)) {
        serverData.positionPoints.forEach(p => {
            const xPosition = p.xPosition ?? p.xposition;
            const yPosition = p.yPosition ?? p.yposition;
            const zPosition = p.zPosition ?? p.zposition;
            if (xPosition != null || yPosition != null || zPosition != null) {
                const pointId = p.mrid || p.mRID || uuid.newUuid();
                dto.positionPoints.x.push({ id: pointId, coor: xPosition });
                dto.positionPoints.y.push({ id: pointId, coor: yPosition });
                dto.positionPoints.z.push({ id: pointId, coor: zPosition });
            }
        });
    }

    return dto;
};

const emptyToNull = (value) => {
    return value === '' || value === undefined ? null : value;
};

const coordinateValue = (points, axis, index) => {
    const values = points && Array.isArray(points[axis]) ? points[axis] : [];
    const item = values[index];
    if (item && typeof item === 'object') return emptyToNull(item.coor);
    return emptyToNull(item);
};

const mapPositionPoints = (points) => {
    const x = points && Array.isArray(points.x) ? points.x : [];
    const y = points && Array.isArray(points.y) ? points.y : [];
    const z = points && Array.isArray(points.z) ? points.z : [];
    const length = Math.max(x.length, y.length, z.length);

    return Array.from({ length }, (_, index) => {
        const xPosition = coordinateValue(points, 'x', index);
        const yPosition = coordinateValue(points, 'y', index);
        const zPosition = coordinateValue(points, 'z', index);
        if (xPosition === null && yPosition === null && zPosition === null) return null;

        return {
            mRID: null,
            ownerId: null,
            groupNumber: 1,
            sequenceNumber: index + 1,
            xPosition,
            yPosition,
            zPosition
        };
    }).filter(Boolean);
};

export const mapDtoToServer = (dto, parentId, serverId = null) => {
    const source = dto || {};
    const attachment = source.attachment || {};
    const hasAttachment = !!(attachment.id || attachment.name || attachment.path);

    return {
        mRID: emptyToNull(serverId),
        name: emptyToNull(source.name),
        aliasName: emptyToNull(source.aliasName),
        description: emptyToNull(source.comment),
        organisation: {
            mRID: emptyToNull(serverId),
            name: emptyToNull(source.name),
            aliasName: emptyToNull(source.aliasName),
            description: emptyToNull(source.comment),
            parentOrganisation: emptyToNull(parentId),
            taxCode: emptyToNull(source.tax_code),
            electronicAddress: source.email || source.fax ? {
                mRID: null,
                email: emptyToNull(source.email),
                fax: emptyToNull(source.fax)
            } : null,
            phone: source.phoneNumber ? {
                mRID: null,
                localNumber: source.phoneNumber
            } : null,
            streetAddress: source.street || source.address || source.ward_or_commune || source.district_or_town
                || source.city || source.state_or_province || source.country || source.postal_code ? {
                    mRID: null,
                    postalCode: emptyToNull(source.postal_code),
                    streetDetail: source.street || source.address ? {
                        mRID: null,
                        addressGeneral: source.street || source.address
                    } : null,
                    townDetail: source.ward_or_commune || source.district_or_town || source.city
                        || source.state_or_province || source.country ? {
                            mRID: null,
                            wardOrCommune: emptyToNull(source.ward_or_commune),
                            districtOrTown: emptyToNull(source.district_or_town),
                            city: emptyToNull(source.city),
                            stateOrProvince: emptyToNull(source.state_or_province),
                            country: emptyToNull(source.country)
                        } : null
                } : null
        },
        attachment: hasAttachment ? {
            mRID: emptyToNull(attachment.id),
            name: emptyToNull(attachment.name),
            path: emptyToNull(attachment.path),
            type: emptyToNull(attachment.type),
            idForeign: emptyToNull(attachment.id_foreign)
        } : null,
        positionPoints: mapPositionPoints(source.positionPoints)
    };
};
