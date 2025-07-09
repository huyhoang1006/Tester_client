import db from '../../datacontext/index'

// Thêm mới OrganisationPsr
export const insertOrganisationPsr = async (organisationPsr) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO organisation_psr(
                mrid,
                organisation_id,
                psr_id
            ) VALUES (?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                organisation_id = excluded.organisation_id,
                psr_id = excluded.psr_id`,
            [
                organisationPsr.mrid,
                organisationPsr.organisation_id,
                organisationPsr.psr_id
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert organisationPsr failed' })
                return resolve({ success: true, data: organisationPsr, message: 'Insert organisationPsr completed' })
            }
        )
    })
}

export const insertOrganisationPsrTransaction = async (organisationPsr, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO organisation_psr(
                mrid,
                organisation_id,
                psr_id
            ) VALUES (?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                organisation_id = excluded.organisation_id,
                psr_id = excluded.psr_id`,
            [
                organisationPsr.mrid,
                organisationPsr.organisation_id,
                organisationPsr.psr_id
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert organisationPsr failed' })
                return resolve({ success: true, data: organisationPsr, message: 'Insert organisationPsr completed' })
            }
        )
    })
}

// Lấy OrganisationPsr theo mrid
export const getOrganisationPsrById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM organisation_psr WHERE mrid = ?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err, message: 'Get organisationPsr failed' })
            if (!row) return resolve({ success: false, data: null, message: 'OrganisationPsr not found' })
            return resolve({ success: true, data: row, message: 'Get organisationPsr completed' })
        })
    })
}

export const getOrganisationPsrByOrganisationIdAndPsrId = async (organisation_id, psr_id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM organisation_psr WHERE organisation_id = ? AND psr_id = ?", [organisation_id, psr_id], (err, row) => {
            if (err) return reject({ success: false, err, message: 'Get organisationPsr failed' })
            if (!row) return resolve({ success: false, data: null, message: 'OrganisationPsr not found' })
            return resolve({ success: true, data: row, message: 'Get organisationPsr completed' })
        })
    })
}

export const getOrganisationPsrByOrganisationId = async (organisation_id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM organisation_psr WHERE organisation_id = ?", [organisation_id], (err, rows) => {
            if (err) return reject({ success: false, err, message: 'Get organisationPsr failed' })
            if (!rows || rows.length === 0) return resolve({ success: false, data: null, message: 'OrganisationPsr not found' })
            return resolve({ success: true, data: rows, message: 'Get organisationPsr completed' })
        })
    })
}

export const getOrganisationPsrByPsrId = async (psr_id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM organisation_psr WHERE psr_id = ?", [psr_id], (err, rows) => {
            if (err) return reject({ success: false, err, message: 'Get organisationPsr failed' })
            if (!rows || rows.length === 0) return resolve({ success: false, data: null, message: 'OrganisationPsr not found' })
            return resolve({ success: true, data: rows, message: 'Get organisationPsr completed' })
        })
    })
}

// Cập nhật OrganisationPsr theo mrid
export const updateOrganisationPsrById = async (mrid, organisationPsr) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE organisation_psr SET
                organisation_id = ?,
                psr_id = ?
            WHERE mrid = ?`,
            [
                organisationPsr.organisation_id,
                organisationPsr.psr_id,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update organisationPsr failed' })
                if (this.changes === 0) return resolve({ success: false, message: 'OrganisationPsr not found' })
                return resolve({ success: true, data: organisationPsr, message: 'Update organisationPsr completed' })
            }
        )
    })
}

// Xóa OrganisationPsr theo mrid
export const deleteOrganisationPsrById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM organisation_psr WHERE mrid = ?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete organisationPsr failed' })
            if (this.changes === 0) return resolve({ success: false, message: 'OrganisationPsr not found' })
            return resolve({ success: true, message: 'Delete organisationPsr completed' })
        })
    })
}