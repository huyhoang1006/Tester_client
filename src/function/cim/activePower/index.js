import db from '../../datacontext/index'

export const getActivePowerById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM active_power WHERE mrid = ?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err, message: 'Get activePower by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'ActivePower not found' })
            return resolve({ success: true, data: row, message: 'Get activePower by id completed' })
        })
    })
}

export const getActivePowerByIds = async (mrids) => {
    return new Promise((resolve, reject) => {
        if (!mrids || mrids.length === 0) {
            return resolve({ success: false, data: [], message: 'No mrids provided' })
        }

        const placeholders = mrids.map(() => '?').join(',')

        db.all(
            `SELECT * FROM active_power WHERE mrid IN (${placeholders})`,
            mrids,
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get activePower by ids failed' })
                if (!rows || rows.length === 0) return resolve({ success: false, data: [], message: 'ActivePower not found' })
                return resolve({ success: true, data: rows, message: 'Get activePower by ids completed' })
            }
        )
    })
}

export const insertActivePower = async (activePower) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO active_power(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value`,
            [
                activePower.mrid,
                activePower.multiplier,
                activePower.unit,
                activePower.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert activePower failed' })
                return resolve({ success: true, data: activePower, message: 'Insert activePower completed' })
            }
        )
    })
}

export const insertActivePowerTransaction = async (activePower, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO active_power(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value`,
            [
                activePower.mrid,
                activePower.multiplier,
                activePower.unit,
                activePower.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert activePower failed' })
                return resolve({ success: true, data: activePower, message: 'Insert activePower completed' })
            }
        )
    })
}

export const updateActivePowerById = async (mrid, activePower) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE active_power
             SET multiplier = ?, unit = ?, value = ?
             WHERE mrid = ?`,
            [activePower.multiplier, activePower.unit, activePower.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update activePower failed' })
                return resolve({ success: true, data: activePower, message: 'Update activePower completed' })
            }
        )
    })
}

export const updateActivePowerByIdTransaction = async (mrid, activePower, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE active_power
             SET multiplier = ?, unit = ?, value = ?
             WHERE mrid = ?`,
            [activePower.multiplier, activePower.unit, activePower.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update activePower failed' })
                return resolve({ success: true, data: activePower, message: 'Update activePower completed' })
            }
        )
    })
}

export const deleteActivePowerById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM active_power WHERE mrid = ?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete activePower failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'ActivePower not found' })
            return resolve({ success: true, data: null, message: 'Delete activePower completed' })
        })
    })
}

export const deleteActivePowerByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM active_power WHERE mrid = ?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete activePower failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'ActivePower not found' })
            return resolve({ success: true, data: null, message: 'Delete activePower completed' })
        })
    })
}