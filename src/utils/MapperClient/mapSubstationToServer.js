export const mapSubstationEntityToServer = (entity, parentNode) => {
    if (!entity) return null

    // eslint-disable-next-line no-unused-vars
    const _parentNode = parentNode

    const substation = entity.substation || {}
    const location = entity.location || {}
    const eAddr = entity.electronicAddress || {}
    const phone = entity.telephoneNumber || {}
    const addr = entity.streetAddress || {}
    const street = entity.streetDetail || {}
    const town = entity.townDetail || {}
    const psrType = entity.psrType || {}
    const person = entity.person || {}
    const personRole = entity.personRole || {}

    // Map Person info - lấy thêm landline_phone
    const landLinePhoneData = person.landline_phone ? {
        mRID: null,
        ituPhone: person.landline_phone || '',
        localNumber: ''
    } : null

    const personData = person.name ? {
        mRID: person.mrid || null,
        name: person.name || '',
        aliasName: person.alias_name || '',
        description: person.description || personRole.description || '',
        prefix: person.prefix || null,
        firstName: person.first_name || '',
        middleName: person.m_name || '',
        lastName: person.last_name || '',
        suffix: person.suffix || null,
        specialNeed: person.special_need || null,
        electronicAddress: eAddr.mrid ? {
            mRID: eAddr.mrid || null,
            email: eAddr.email || '',
            fax: eAddr.fax || ''
        } : null,
        mobilePhone: phone.mrid ? {
            mRID: phone.mrid || null,
            ituPhone: phone.itu_phone || '',
            localNumber: phone.local_number || ''
        } : null,
        landLinePhone: landLinePhoneData
    } : null

    const serverData = {
        mRID: substation.mrid || null,
        name: substation.name || '',
        aliasName: substation.alias_name || '',
        description: substation.description || '',
        generation: substation.generation || '',
        industry: substation.industry || '',
        psrType: psrType.mrid ? {
            mRID: psrType.mrid || null,
            name: psrType.name || '',
            aliasName: psrType.alias_name || '',
            description: psrType.description || ''
        } : null,
        assetDatasheet: null,
        location: {
            mRID: location.mrid || null,
            name: location.name || '',
            aliasName: location.alias_name || '',
            description: location.description || '',
            direction: location.direction || null,
            geoInfoReference: location.geo_info_reference || '',
            type: location.type || null,
            status: location.status || null,
            electronicAddress: {
                mRID: eAddr.mrid || null,
                email: eAddr.email || '',
                fax: eAddr.fax || '',
                lan: eAddr.lan || null,
                mac: eAddr.mac || null,
                password: eAddr.password || null,
                radio: eAddr.radio || null,
                userId: eAddr.user_id || null,
                web: eAddr.web || null
            },
            phone: {
                mRID: phone.mrid || null,
                areaCode: phone.area_code || null,
                cityCode: phone.city_code || null,
                countryCode: phone.country_code || null,
                dialOut: phone.dial_out || null,
                extension: phone.extension || null,
                internationalPrefix: phone.international_prefix || null,
                ituPhone: phone.itu_phone || '',
                localNumber: phone.local_number || ''
            },
            mainAddress: {
                mRID: addr.mrid || null,
                language: addr.language || null,
                poBox: addr.po_box || null,
                postalCode: addr.postal_code || null,
                status: addr.status || null,
                streetDetail: {
                    mRID: street.mrid || null,
                    addressGeneral: street.address_general || '',
                    buildingName: street.building_name || null,
                    code: street.code || null,
                    number: street.number || null,
                    prefix: street.prefix || null,
                    suiteNumber: street.suite_number || null,
                    type: street.type || null,
                    floorIdentification: street.floor_identification || null,
                    withinTownLimits: street.within_town_limits !== null ? street.within_town_limits : null
                },
                townDetail: {
                    mRID: town.mrid || null,
                    wardOrCommune: town.ward_or_commune || '',
                    districtOrTown: town.district_or_town || '',
                    city: town.city || '',
                    stateOrProvince: town.state_or_province || '',
                    country: town.country || '',
                    code: town.code || null,
                    section: town.section || null
                }
            },
            secondaryAddress: null,
            persons: personData ? [personData] : []
        }
    }

    if (entity.positionPoint && Array.isArray(entity.positionPoint)) {
        serverData.positionPoints = entity.positionPoint.map(p => ({
            mrid: p.mrid || null,
            x: p.x || null,
            y: p.y || null,
            z: p.z || null
        }))
    }

    return serverData
}
