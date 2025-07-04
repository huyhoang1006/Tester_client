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

// Lấy OrganisationLocation theo mrid
export const getOrganisationLocationById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM organisation_location WHERE mrid = ?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err, message: 'Get organisationLocation failed' })
            if (!row) return resolve({ success: false, data: null, message: 'OrganisationLocation not found' })
            return resolve({ success: true, data: row, message: 'Get organisationLocation completed' })
        })
    })
}

// Cập nhật OrganisationLocation theo mrid
export const updateOrganisationLocationById = async (mrid, organisationLocation) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE organisation_location SET
                organisation_id = ?,
                location_id = ?
            WHERE mrid = ?`,
            [
                organisationLocation.organisation_id,
                organisationLocation.location_id,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update organisationLocation failed' })
                if (this.changes === 0) return resolve({ success: false, message: 'OrganisationLocation not found' })
                return resolve({ success: true, data: organisationLocation, message: 'Update organisationLocation completed' })
            }
        )
    })
}

// Xóa OrganisationLocation theo mrid
export const deleteOrganisationLocationById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM organisation_location WHERE mrid = ?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete organisationLocation failed' })
            if (this.changes === 0) return resolve({ success: false, message: 'OrganisationLocation not found' })
            return resolve({ success: true, message: 'Delete organisationLocation completed' })
        })
    })
}