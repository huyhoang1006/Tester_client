import db from '../../datacontext/index'

export const getReactivePowerById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM reactive_power WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get reactive power by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Reactive power not found' })
            return resolve({ success: true, data: row, message: 'Get reactive power by id completed' })
        })
    })
}

export const getReactivePowerByIds = async (mrids) => {
    return new Promise((resolve, reject) => {
        if (!mrids || mrids.length === 0) {
            return resolve({ success: false, data: [], message: 'No mrids provided' })
        }

        // Tạo chuỗi placeholder (?, ?, ?) tùy theo số lượng mrid
        const placeholders = mrids.map(() => '?').join(',')

        db.all(
            `SELECT * FROM reactive_power WHERE mrid IN (${placeholders})`,
            mrids,
            (err, rows) => {
                if (err) {
                    return reject({ success: false, err: err, message: 'Get reactive power by ids failed' })
                }
                if (!rows || rows.length === 0) {
                    return resolve({ success: false, data: [], message: 'Reactive power not found' })
                }
                return resolve({ success: true, data: rows, message: 'Get reactive power by ids completed' })
            }
        )
    })
}

export const insertReactivePower = async (reactivePower) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO reactive_power(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value`,
            [
                reactivePower.mrid,
                reactivePower.multiplier,
                reactivePower.unit,
                reactivePower.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert reactive power failed' })
                return resolve({ success: true, data: reactivePower, message: 'Insert reactive power completed' })
            }
        )
    })
}

export const insertReactivePowerTransaction = async (reactivePower, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO reactive_power(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)    
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value`,
            [
                reactivePower.mrid,
                reactivePower.multiplier,
                reactivePower.unit,
                reactivePower.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert reactive power failed' })
                return resolve({ success: true, data: reactivePower, message: 'Insert reactive power completed' })
            }
        )
    })
}

export const updateReactivePowerById = async (mrid, reactivePower) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE reactive_power
             SET multiplier = ?, unit = ?, value = ?
             WHERE mrid = ?`,
            [reactivePower.multiplier, reactivePower.unit, reactivePower.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update reactive power failed' })
                return resolve({ success: true, data: reactivePower, message: 'Update reactive power completed' })
            }
        )
    })
}

export const updateReactivePowerByIdTransaction = async (mrid, reactivePower, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE reactive_power
             SET multiplier = ?, unit = ?, value = ?
             WHERE mrid = ?`,
            [reactivePower.multiplier, reactivePower.unit, reactivePower.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update reactive power failed' })
                return resolve({ success: true, data: reactivePower, message: 'Update reactive power completed' })
            }
        )
    })
}

export const deleteReactivePowerById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM reactive_power WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete reactive power failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Reactive power not found' })
            return resolve({ success: true, data: null, message: 'Delete reactive power completed' })
        })
    })
}

export const deleteReactivePowerByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM reactive_power WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete reactive power failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Reactive power not found' })
            return resolve({ success: true, data: null, message: 'Delete reactive power completed' })
        })
    })
}