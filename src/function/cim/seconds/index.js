import db from '../../datacontext/index'

export const getSecondById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM seconds WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get seconds by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Seconds not found' })
            return resolve({ success: true, data: row, message: 'Get seconds by id completed' })
        })
    })
}

export const getSecondByIds = async (mrids) => {
    return new Promise((resolve, reject) => {
        if (!mrids || mrids.length === 0) {
            return resolve({ success: false, data: [], message: 'No mrids provided' })
        }

        // Tạo chuỗi placeholder (?, ?, ?) tùy theo số lượng mrid
        const placeholders = mrids.map(() => '?').join(',')

        db.all(
            `SELECT * FROM seconds WHERE mrid IN (${placeholders})`,
            mrids,
            (err, rows) => {
                if (err) {
                    return reject({ success: false, err: err, message: 'Get seconds by ids failed' })
                }
                if (!rows || rows.length === 0) {
                    return resolve({ success: false, data: [], message: 'Seconds not found' })
                }
                return resolve({ success: true, data: rows, message: 'Get seconds by ids completed' })
            }
        )
    })
}

export const insertSeconds = async (seconds) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO seconds(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value`,
            [
                seconds.mrid,
                seconds.multiplier,
                seconds.unit,
                seconds.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert seconds failed' })
                return resolve({ success: true, data: seconds, message: 'Insert seconds completed' })
            }
        )
    })
}

export const insertSecondsTransaction = async (seconds, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO seconds(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value`,
            [
                seconds.mrid,
                seconds.multiplier,
                seconds.unit,
                seconds.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert seconds failed' })
                return resolve({ success: true, data: seconds, message: 'Insert seconds completed' })
            }
        )
    })
}

export const updateSecondsById = async (mrid, seconds) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE seconds
             SET multiplier = ?, unit = ?, value = ?
             WHERE mrid = ?`,
            [seconds.multiplier, seconds.unit, seconds.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update seconds failed' })
                return resolve({ success: true, data: seconds, message: 'Update seconds completed' })
            }
        )
    })
}

export const updateSecondsByIdTransaction = async (mrid, seconds, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE seconds
             SET multiplier = ?, unit = ?, value = ?
             WHERE mrid = ?`,
            [seconds.multiplier, seconds.unit, seconds.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update seconds failed' })
                return resolve({ success: true, data: seconds, message: 'Update seconds completed' })
            }
        )
    })
}

export const deleteSecondsById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM seconds WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete seconds failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Seconds not found' })
            return resolve({ success: true, data: null, message: 'Delete seconds completed' })
        })
    })
}

export const deleteSecondsByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM seconds WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete seconds failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Seconds not found' })
            return resolve({ success: true, data: null, message: 'Delete seconds completed' })
        })
    })
}