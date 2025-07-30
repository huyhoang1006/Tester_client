import db from '../../datacontext/index'

export const getImpedanceById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM impedance WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get impedance by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Impedance not found' })
            return resolve({ success: true, data: row, message: 'Get impedance by id completed' })
        })
    })
}

export const insertImpedance = async (impedance) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO impedance(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value`,
            [
                impedance.mrid,
                impedance.multiplier,
                impedance.unit,
                impedance.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert impedance failed' })
                return resolve({ success: true, data: impedance, message: 'Insert impedance completed' })
            }
        )
    })
}

export const insertImpedanceTransaction = async (impedance, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO impedance(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value`,
            [
                impedance.mrid,
                impedance.multiplier,
                impedance.unit,
                impedance.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert impedance failed' })
                return resolve({ success: true, data: impedance, message: 'Insert impedance completed' })
            }
        )
    })
}

export const updateImpedanceById = async (mrid, impedance) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE impedance
             SET multiplier = ?, unit = ?, value = ?
             WHERE mrid = ?`,
            [impedance.multiplier, impedance.unit, impedance.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update impedance failed' })
                return resolve({ success: true, data: impedance, message: 'Update impedance completed' })
            }
        )
    })
}

export const updateImpedanceByIdTransaction = async (mrid, impedance, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE impedance
             SET multiplier = ?, unit = ?, value = ?
             WHERE mrid = ?`,
            [impedance.multiplier, impedance.unit, impedance.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update impedance failed' })
                return resolve({ success: true, data: impedance, message: 'Update impedance completed' })
            }
        )
    })
}

export const deleteImpedanceById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM impedance WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete impedance failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Impedance not found' })
            return resolve({ success: true, data: null, message: 'Delete impedance completed' })
        })
    })
}

export const deleteImpedanceByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM impedance WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete impedance failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Impedance not found' })
            return resolve({ success: true, data: null, message: 'Delete impedance completed' })
        })
    })
}