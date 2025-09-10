import db from '../../datacontext/index'

export const getFrequencyById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM frequency WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get frequency by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Frequency not found' })
            return resolve({ success: true, data: row, message: 'Get frequency by id completed' })
        })
    })
}

export const insertFrequency = async (frequency) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO frequency(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value`,
            [
                frequency.mrid,
                frequency.multiplier,
                frequency.unit,
                frequency.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert frequency failed' })
                return resolve({ success: true, data: frequency, message: 'Insert frequency completed' })
            }
        )
    })
}

export const insertFrequencyTransaction = async (frequency, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO frequency(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value`,
            [
                frequency.mrid,
                frequency.multiplier,
                frequency.unit,
                frequency.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert frequency failed' })
                return resolve({ success: true, data: frequency, message: 'Insert frequency completed' })
            }
        )
    })
}

export const updateFrequencyById = async (mrid, frequency) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE frequency
             SET multiplier = ?, unit = ?, value = ?
             WHERE mrid = ?`,
            [frequency.multiplier, frequency.unit, frequency.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update frequency failed' })
                return resolve({ success: true, data: frequency, message: 'Update frequency completed' })
            }
        )
    })
}

export const updateFrequencyByIdTransaction = async (mrid, frequency, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE frequency
             SET multiplier = ?, unit = ?, value = ?
             WHERE mrid = ?`,
            [frequency.multiplier, frequency.unit, frequency.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update frequency failed' })
                return resolve({ success: true, data: frequency, message: 'Update frequency completed' })
            }
        )
    })
}

export const deleteFrequencyById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM frequency WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete frequency failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Frequency not found' })
            return resolve({ success: true, data: null, message: 'Delete frequency completed' })
        })
    })
}

export const deleteFrequencyByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM frequency WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete frequency failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Frequency not found' })
            return resolve({ success: true, data: null, message: 'Delete frequency completed' })
        })
    })
}