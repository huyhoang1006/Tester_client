import db from '../../datacontext/index'

export const getMassById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM mass WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get mass by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Mass not found' })
            return resolve({ success: true, data: row, message: 'Get mass by id completed' })
        })
    })
}

export const insertMass = async (mass) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO mass(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value`,
            [
                mass.mrid,
                mass.multiplier,
                mass.unit,
                mass.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert voltage failed' })
                return resolve({ success: true, data: voltage, message: 'Insert voltage completed' })
            }
        )
    })
}

export const insertMassTransaction = async (mass, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO mass(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value`,
            [
                mass.mrid,
                mass.multiplier,
                mass.unit,
                mass.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert mass failed' })
                return resolve({ success: true, data: mass, message: 'Insert mass completed' })
            }
        )
    })
}

export const updateMassById = async (mrid, mass) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE mass
             SET multiplier = ?, unit = ?, value = ?
             WHERE mrid = ?`,
            [mass.multiplier, mass.unit, mass.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update mass failed' })
                return resolve({ success: true, data: mass, message: 'Update mass completed' })
            }
        )
    })
}

export const updateMassByIdTransaction = async (mrid, mass, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE mass
             SET multiplier = ?, unit = ?, value = ?
             WHERE mrid = ?`,
            [mass.multiplier, mass.unit, mass.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update mass failed' })
                return resolve({ success: true, data: mass, message: 'Update mass completed' })
            }
        )
    })
}

export const deleteMassById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM mass WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete mass failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Mass not found' })
            return resolve({ success: true, data: null, message: 'Delete mass completed' })
        })
    })
}

export const deleteMassByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM mass WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete mass failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Mass not found' })
            return resolve({ success: true, data: null, message: 'Delete mass completed' })
        })
    })
}