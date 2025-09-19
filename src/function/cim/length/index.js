import db from '../../datacontext/index'

export const getLengthById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM length WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get length by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Length not found' })
            return resolve({ success: true, data: row, message: 'Get length by id completed' })
        })
    })
}

export const getLengthByIds = async (mrids) => {
    return new Promise((resolve, reject) => {
        if (!mrids || mrids.length === 0) {
            return resolve({ success: false, data: [], message: 'No mrids provided' })
        }

        // Tạo chuỗi placeholder (?, ?, ?) tùy theo số lượng mrid
        const placeholders = mrids.map(() => '?').join(',')

        db.all(
            `SELECT * FROM length WHERE mrid IN (${placeholders})`,
            mrids,
            (err, rows) => {
                if (err) {
                    return reject({ success: false, err: err, message: 'Get length by ids failed' })
                }
                if (!rows || rows.length === 0) {
                    return resolve({ success: false, data: [], message: 'Length not found' })
                }
                return resolve({ success: true, data: rows, message: 'Get length by ids completed' })
            }
        )
    })
}

export const insertLength = async (length) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO length(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value`,
            [
                length.mrid,
                length.multiplier,
                length.unit,
                length.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert length failed' })
                return resolve({ success: true, data: length, message: 'Insert length completed' })
            }
        )
    })
}

export const insertLengthTransaction = async (length, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO length(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value`,
            [
                length.mrid,
                length.multiplier,
                length.unit,
                length.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert length failed' })
                return resolve({ success: true, data: length, message: 'Insert length completed' })
            }
        )
    })
}

export const updateLengthById = async (mrid, length) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE length
             SET multiplier = ?, unit = ?, value = ?
             WHERE mrid = ?`,
            [length.multiplier, length.unit, length.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update length failed' })
                return resolve({ success: true, data: length, message: 'Update length completed' })
            }
        )
    })
}

export const updateLengthByIdTransaction = async (mrid, length, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE length
             SET multiplier = ?, unit = ?, value = ?
             WHERE mrid = ?`,
            [length.multiplier, length.unit, length.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update length failed' })
                return resolve({ success: true, data: length, message: 'Update length completed' })
            }
        )
    })
}

export const deleteLengthById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM length WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete length failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Length not found' })
            return resolve({ success: true, data: null, message: 'Delete length completed' })
        })
    })
}

export const deleteLengthByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM length WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete length failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Length not found' })
            return resolve({ success: true, data: null, message: 'Delete length completed' })
        })
    })
}