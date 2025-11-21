import db from '../../datacontext/index'

export const getPercentById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM percent WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get percent by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Percent not found' })
            return resolve({ success: true, data: row, message: 'Get percent by id completed' })
        })
    })
}

export const getPercentByIds = async (mrids) => {
    return new Promise((resolve, reject) => {
        if (!mrids || mrids.length === 0) {
            return resolve({ success: false, data: [], message: 'No mrids provided' })
        }

        // Tạo chuỗi placeholder (?, ?, ?) tùy theo số lượng mrid
        const placeholders = mrids.map(() => '?').join(',')

        db.all(
            `SELECT * FROM percent WHERE mrid IN (${placeholders})`,
            mrids,
            (err, rows) => {
                if (err) {
                    return reject({ success: false, err: err, message: 'Get percent by ids failed' })
                }
                if (!rows || rows.length === 0) {
                    return resolve({ success: false, data: [], message: 'Percent not found' })
                }
                return resolve({ success: true, data: rows, message: 'Get percent by ids completed' })
            }
        )
    })
}

export const insertPercent = async (percent) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO percent(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value`,
            [
                percent.mrid,
                percent.multiplier,
                percent.unit,
                percent.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert percent failed' })
                return resolve({ success: true, data: percent, message: 'Insert percent completed' })
            }
        )
    })
}

export const insertPercentTransaction = async (percent, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO percent(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value`,
            [
                percent.mrid,
                percent.multiplier,
                percent.unit,
                percent.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert percent failed' })
                return resolve({ success: true, data: percent, message: 'Insert percent completed' })
            }
        )
    })
}

export const updatePercentById = async (mrid, percent) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE percent
             SET multiplier = ?, unit = ?, value = ?
             WHERE mrid = ?`,
            [percent.multiplier, percent.unit, percent.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update percent failed' })
                return resolve({ success: true, data: percent, message: 'Update percent completed' })
            }
        )
    })
}

export const updatePercentByIdTransaction = async (mrid, percent, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE percent
             SET multiplier = ?, unit = ?, value = ?
             WHERE mrid = ?`,
            [percent.multiplier, percent.unit, percent.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update percent failed' })
                return resolve({ success: true, data: percent, message: 'Update percent completed' })
            }
        )
    })
}

export const deleteVoltageById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM voltage WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete percent failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Percent not found' })
            return resolve({ success: true, data: null, message: 'Delete percent completed' })
        })
    })
}

export const deletePercentByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM percent WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete percent failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Percent not found' })
            return resolve({ success: true, data: null, message: 'Delete percent completed' })
        })
    })
}