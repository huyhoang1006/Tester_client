import db from '../../datacontext/index'

// Thêm mới OrganisationPerson
export const insertOrganisationPerson = async (organisationPerson) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO organisation_person(
                mrid,
                organisation_id,
                person_id
            ) VALUES (?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                organisation_id = excluded.organisation_id,
                person_id = excluded.person_id`,
            [
                organisationPerson.mrid,
                organisationPerson.organisation_id,
                organisationPerson.person_id
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert organisationPerson failed' })
                return resolve({ success: true, data: organisationPerson, message: 'Insert organisationPerson completed' })
            }
        )
    })
}

export const insertOrganisationPersonTransaction = async (organisationPerson, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO organisation_person(
                mrid,
                organisation_id,
                person_id
            ) VALUES (?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                organisation_id = excluded.organisation_id,
                person_id = excluded.person_id`,
            [
                organisationPerson.mrid,
                organisationPerson.organisation_id,
                organisationPerson.person_id
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert organisationPerson failed' })
                return resolve({ success: true, data: organisationPerson, message: 'Insert organisationPerson completed' })
            }
        )
    })
}

// Lấy OrganisationPerson theo mrid
export const getOrganisationPersonById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM organisation_person WHERE mrid = ?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err, message: 'Get organisationPerson failed' })
            if (!row) return resolve({ success: false, data: null, message: 'OrganisationPerson not found' })
            return resolve({ success: true, data: row, message: 'Get organisationPerson completed' })
        })
    })
}

export const getOrganisationPersonByOrganisationId = async (organisation_id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM organisation_person WHERE organisation_id = ?", [organisation_id], (err, rows) => {
            if (err) return reject({ success: false, err, message: 'Get organisationPerson failed' })
            if (!rows || rows.length === 0) return resolve({ success: false, data: null, message: 'OrganisationPerson not found' })
            return resolve({ success: true, data: rows, message: 'Get organisationPerson completed' })
        })
    })
}

export const getOrganisationPersonByOrganisationIdAndPersonId = async (organisation_id, person_id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM organisation_person WHERE organisation_id = ? AND person_id = ?", [organisation_id, person_id], (err, row) => {
            if (err) return reject({ success: false, err, message: 'Get organisationPerson failed' })
            if (!row) return resolve({ success: false, data: null, message: 'OrganisationPerson not found' })
            return resolve({ success: true, data: row, message: 'Get organisationPerson completed' })
        })
    })
}

export const getOrganisationPersonByPersonId = async (person_id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM organisation_person WHERE person_id = ?", [person_id], (err, rows) => {
            if (err) return reject({ success: false, err, message: 'Get organisationPerson failed' })
            if (!rows || rows.length === 0) return resolve({ success: false, data: null, message: 'OrganisationPerson not found' })
            return resolve({ success: true, data: rows, message: 'Get organisationPerson completed' })
        })
    })
}

// Cập nhật OrganisationPerson theo mrid
export const updateOrganisationPersonById = async (mrid, organisationPerson) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE organisation_person SET
                organisation_id = ?,
                person_id = ?
            WHERE mrid = ?`,
            [
                organisationPerson.organisation_id,
                organisationPerson.person_id,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update organisationPerson failed' })
                if (this.changes === 0) return resolve({ success: false, message: 'OrganisationPerson not found' })
                return resolve({ success: true, data: organisationPerson, message: 'Update organisationPerson completed' })
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