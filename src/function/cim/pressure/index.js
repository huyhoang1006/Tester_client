import db from '../../datacontext/index'

// Lấy Pressure theo mrid
export const getPressureById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM pressure WHERE mrid = ?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get Pressure by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'Pressure not found' })
                return resolve({ success: true, data: row, message: 'Get Pressure by id completed' })
            }
        )
    })
}

export const getPressureByIds = async (mrids) => {
    return new Promise((resolve, reject) => {
        if (!mrids || mrids.length === 0) {
            return resolve({ success: false, data: [], message: 'No mrids provided' })
        }

        // Tạo chuỗi placeholder (?, ?, ?) tùy theo số lượng mrid
        const placeholders = mrids.map(() => '?').join(',')

        db.all(
            `SELECT * FROM pressure WHERE mrid IN (${placeholders})`,
            mrids,
            (err, rows) => {
                if (err) {
                    return reject({ success: false, err: err, message: 'Get pressure by ids failed' })
                }
                if (!rows || rows.length === 0) {
                    return resolve({ success: false, data: [], message: 'Pressure not found' })
                }
                return resolve({ success: true, data: rows, message: 'Get pressure by ids completed' })
            }
        )
    })
}

// Thêm mới Pressure (transaction)
export const insertPressureTransaction = async (info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO pressure(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value
            `,
            [
                info.mrid,
                info.multiplier,
                info.unit,
                info.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert Pressure failed' })
                return resolve({ success: true, data: info, message: 'Insert Pressure completed' })
            }
        )
    })
}

// Cập nhật Pressure (transaction)
export const updatePressureTransaction = async (mrid, info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE pressure SET
                multiplier = ?,
                unit = ?,
                value = ?
            WHERE mrid = ?`,
            [
                info.multiplier,
                info.unit,
                info.value,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update Pressure failed' })
                return resolve({ success: true, data: info, message: 'Update Pressure completed' })
            }
        )
    })
}

// Xóa Pressure (transaction)
export const deletePressureByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `DELETE FROM pressure WHERE mrid = ?`,
            [mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Delete Pressure failed' })
                return resolve({ success: true, data: mrid, message: 'Delete Pressure completed' })
            }
        )
    })
}