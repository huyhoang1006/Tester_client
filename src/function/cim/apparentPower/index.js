import db from '../../datacontext/index'

export const getApparentPowerById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM apparent_power WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get apparent power by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Apparent power not found' })
            return resolve({ success: true, data: row, message: 'Get apparent power by id completed' })
        })
    })
}

export const getApparentPowerByIds = async (mrids) => {
    return new Promise((resolve, reject) => {
        if (!mrids || mrids.length === 0) {
            return resolve({ success: false, data: [], message: 'No mrids provided' })
        }

        // Tạo chuỗi placeholder (?, ?, ?) tùy theo số lượng mrid
        const placeholders = mrids.map(() => '?').join(',')

        db.all(
            `SELECT * FROM apparent_power WHERE mrid IN (${placeholders})`,
            mrids,
            (err, rows) => {
                if (err) {
                    return reject({ success: false, err: err, message: 'Get apparent power by ids failed' })
                }
                if (!rows || rows.length === 0) {
                    return resolve({ success: false, data: [], message: 'Apparent power not found' })
                }
                return resolve({ success: true, data: rows, message: 'Get apparent power by ids completed' })
            }
        )
    })
}

export const insertApparentPower = async (apparentPower) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO apparent_power(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value`,
            [
                apparentPower.mrid,
                apparentPower.multiplier,
                apparentPower.unit,
                apparentPower.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert apparent power failed' })
                return resolve({ success: true, data: apparentPower, message: 'Insert apparent power completed' })
            }
        )
    })
}

export const insertApparentPowerTransaction = async (apparentPower, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO apparent_power(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value`,
            [
                apparentPower.mrid,
                apparentPower.multiplier,
                apparentPower.unit,
                apparentPower.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert apparent power failed' })
                return resolve({ success: true, data: apparentPower, message: 'Insert apparent power completed' })
            }
        )
    })
}

export const updateApparentPowerById = async (mrid, apparentPower) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE apparent_power
             SET multiplier = ?, unit = ?, value = ?
             WHERE mrid = ?`,
            [apparentPower.multiplier, apparentPower.unit, apparentPower.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update apparent power failed' })
                return resolve({ success: true, data: apparentPower, message: 'Update apparent power completed' })
            }
        )
    })
}

export const updateApparentPowerByIdTransaction = async (mrid, apparentPower, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE apparent_power
             SET multiplier = ?, unit = ?, value = ?
             WHERE mrid = ?`,
            [apparentPower.multiplier, apparentPower.unit, apparentPower.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update apparent power failed' })
                return resolve({ success: true, data: apparentPower, message: 'Update apparent power completed' })
            }
        )
    })
}

export const deleteApparentPowerById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM apparent_power WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete apparent power failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Apparent power not found' })
            return resolve({ success: true, data: null, message: 'Delete apparent power completed' })
        })
    })
}

export const deleteApparentPowerByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM apparent_power WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete apparent power failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Apparent power not found' })
            return resolve({ success: true, data: null, message: 'Delete apparent power completed' })
        })
    })
}