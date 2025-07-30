import db from '../../datacontext/index'

export const getVoltageById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM voltage WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get voltage by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Voltage not found' })
            return resolve({ success: true, data: row, message: 'Get voltage by id completed' })
        })
    })
}

export const insertVoltage = async (voltage) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO voltage(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value`,
            [
                voltage.mrid,
                voltage.multiplier,
                voltage.unit,
                voltage.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert voltage failed' })
                return resolve({ success: true, data: voltage, message: 'Insert voltage completed' })
            }
        )
    })
}

export const insertVoltageTransaction = async (voltage, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO voltage(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value`,
            [
                voltage.mrid,
                voltage.multiplier,
                voltage.unit,
                voltage.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert voltage failed' })
                return resolve({ success: true, data: voltage, message: 'Insert voltage completed' })
            }
        )
    })
}

export const updateVoltageById = async (mrid, voltage) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE voltage
             SET multiplier = ?, unit = ?, value = ?
             WHERE mrid = ?`,
            [voltage.multiplier, voltage.unit, voltage.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update voltage failed' })
                return resolve({ success: true, data: voltage, message: 'Update voltage completed' })
            }
        )
    })
}

export const updateVoltageByIdTransaction = async (mrid, voltage, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE voltage
             SET multiplier = ?, unit = ?, value = ?
             WHERE mrid = ?`,
            [voltage.multiplier, voltage.unit, voltage.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update voltage failed' })
                return resolve({ success: true, data: voltage, message: 'Update voltage completed' })
            }
        )
    })
}

export const deleteVoltageById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM voltage WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete voltage failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Voltage not found' })
            return resolve({ success: true, data: null, message: 'Delete voltage completed' })
        })
    })
}

export const deleteVoltageByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM voltage WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete voltage failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Voltage not found' })
            return resolve({ success: true, data: null, message: 'Delete voltage completed' })
        })
    })
}