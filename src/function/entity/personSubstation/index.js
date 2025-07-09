import db from '../../datacontext/index'

// Thêm mới PersonSubstation
export const insertPersonSubstation = async (personSubstation) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO person_substation(
                mrid,
                person_id,
                substation_id
            ) VALUES (?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                person_id = excluded.person_id,
                substation_id = excluded.substation_id`,
            [
                personSubstation.mrid,
                personSubstation.person_id,
                personSubstation.substation_id
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert personSubstation failed' })
                return resolve({ success: true, data: personSubstation, message: 'Insert personSubstation completed' })
            }
        )
    })
}

export const insertPersonSubstationTransaction = async (personSubstation, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO person_substation(
                mrid,
                person_id,
                substation_id
            ) VALUES (?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                person_id = excluded.person_id,
                substation_id = excluded.substation_id`,
            [
                personSubstation.mrid,
                personSubstation.person_id,
                personSubstation.substation_id
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert personSubstation failed' })
                return resolve({ success: true, data: personSubstation, message: 'Insert personSubstation completed' })
            }
        )
    })
}

export const getPersonSubstationByPersonId = async (personId) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM person_substation WHERE person_id = ?", [personId], (err, rows) => {
            if (err) return reject({ success: false, err, message: 'Get personSubstation by personId failed' })
            if (rows.length === 0) return resolve({ success: false, data: null, message: 'PersonSubstation not found' })
            return resolve({ success: true, data: rows, message: 'Get personSubstation by personId completed' })
        })
    })
}

export const getPersonSubstationBySubstationId = async (substationId) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM person_substation WHERE substation_id = ?", [substationId], (err, row) => {
            if (err) return reject({ success: false, err, message: 'Get personSubstation by substationId failed' })
            if (!row) return resolve({ success: false, data: null, message: 'PersonSubstation not found' })
            return resolve({ success: true, data: row, message: 'Get personSubstation by substationId completed' })
        })
    })
}

// Lấy PersonSubstation theo mrid
export const getPersonSubstationById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM person_substation WHERE mrid = ?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err, message: 'Get personSubstation failed' })
            if (!row) return resolve({ success: false, data: null, message: 'PersonSubstation not found' })
            return resolve({ success: true, data: row, message: 'Get personSubstation completed' })
        })
    })
}

// Cập nhật PersonSubstation theo mrid
export const updatePersonSubstationById = async (mrid, personSubstation) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE person_substation SET
                person_id = ?,
                substation_id = ?
            WHERE mrid = ?`,
            [
                personSubstation.person_id,
                personSubstation.substation_id,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update personSubstation failed' })
                if (this.changes === 0) return resolve({ success: false, message: 'PersonSubstation not found' })
                return resolve({ success: true, data: personSubstation, message: 'Update personSubstation completed' })
            }
        )
    })
}

// Xóa PersonSubstation theo mrid
export const deletePersonSubstationById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM person_substation WHERE mrid = ?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete personSubstation failed' })
            if (this.changes === 0) return resolve({ success: false, message: 'PersonSubstation not found' })
            return resolve({ success: true, message: 'Delete personSubstation completed' })
        })
    })
}