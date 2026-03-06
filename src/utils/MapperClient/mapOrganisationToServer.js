export const mapOrganisationEntityToServer = (entity, parentNode) => {
    if (!entity) return null

    const org = entity.organisation || {}
    const eAddr = entity.electronicAddress || {}
    const phone = entity.telephoneNumber || {}
    const addr = entity.streetAddress || {}
    const street = entity.streetDetail || {}
    const town = entity.townDetail || {}


    let parentOrgId = null
    if (parentNode && parentNode.mrid) {
        parentOrgId = parentNode.mrid
    } else if (org.parent_organisation) {
        // Lấy từ entity nếu đã có
        parentOrgId = org.parent_organisation
    }

    const serverData = {
        organisation: {
            mRID: org.mrid || null,
            name: org.name || '',
            aliasName: org.alias_name || '',
            description: org.description || '',
            taxCode: org.tax_code || '',
            parentOrganisation: parentOrgId  // UUID string từ local DB
        },
        electronicAddress: {
            mRID: eAddr.mrid || null,
            email: eAddr.email || '',
            fax: eAddr.fax || ''
        },
        phone: {
            mRID: phone.mrid || null,
            ituPhone: phone.itu_phone || '',
            localNumber: phone.local_number || ''
        },
        streetAddress: {
            mRID: addr.mrid || null,
            streetDetail: {
                mRID: street.mrid || null,
                addressGeneral: street.address_general || ''
            },
            townDetail: {
                mRID: town.mrid || null,
                wardOrCommune: town.ward_or_commune || '',
                districtOrTown: town.district_or_town || '',
                city: town.city || '',
                stateOrProvince: town.state_or_province || '',
                country: town.country || ''
            }
        }
    }

    if (entity.positionPoints && Array.isArray(entity.positionPoints)) {
        serverData.positionPoints = entity.positionPoints.map(p => ({
            mrid: p.mrid || null,
            xposition: p.x || null,
            yposition: p.y || null,
            zposition: p.z || null
        }))
    }

    return serverData
}
