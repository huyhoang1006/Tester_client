import db from '../../datacontext/index'

// Thêm mới OrganisationLocation
export const insertOrganisationLocation = async (organisationLocation) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO organisation_location(
                mrid,
                organisation_id,
                location_id
            ) VALUES (?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                organisation_id = excluded.organisation_id,
                location_id = excluded.location_id`,
            [
                organisationLocation.mrid,
                organisationLocation.organisation_id,
                organisationLocation.location_id
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert organisationLocation failed' })
                return resolve({ success: true, data: organisationLocation, message: 'Insert organisationLocation completed' })
            }
        )
    })
}

export const insertOrganisationLocationTransaction = async (organisationLocation, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO organisation_location(
                organisation_id,
                location_id
            ) VALUES (?, ?)
            ON CONFLICT(organisation_id, location_id) DO NOTHING`,
            [
                organisationLocation.organisation_id,
                organisationLocation.location_id
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert organisationLocation failed' })
                return resolve({ success: true, data: organisationLocation, message: 'Insert organisationLocation completed' })
            }
        )
    })
}

export const getOrganisationLocationByOrganisationIdAndLocationId = async (organisation_id, location_id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM organisation_location WHERE organisation_id = ? AND location_id = ?", [organisation_id, location_id], (err, row) => {
            if (err) return reject({ success: false, err, message: 'Get organisationLocation failed' })
            if (!row) return resolve({ success: false, data: null, message: 'OrganisationLocation not found' })
            return resolve({ success: true, data: row, message: 'Get organisationLocation completed' })
        })
    })
}