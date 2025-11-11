import db from '../../datacontext/index'

// Lấy capacitance theo mrid
export const getCapacitanceById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM capacitance WHERE mrid=?",
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get capacitance by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'Capacitance not found' })
                return resolve({ success: true, data: row, message: 'Get capacitance by id completed' })
            }
        )
    })
}

export const getCapacitanceByIds = async (mrids) => {
    return new Promise((resolve, reject) => {
        if (!mrids || mrids.length === 0) {
            return resolve({ success: false, data: [], message: 'No mrids provided' })
        }

        // Tạo chuỗi placeholder (?, ?, ?) tùy theo số lượng mrid
        const placeholders = mrids.map(() => '?').join(',')

        db.all(
            `SELECT * FROM capacitance WHERE mrid IN (${placeholders})`,
            mrids,
            (err, rows) => {
                if (err) {
                    return reject({ success: false, err: err, message: 'Get capacitances by ids failed' })
                }
                if (!rows || rows.length === 0) {
                    return resolve({ success: false, data: [], message: 'Capacitances not found' })
                }
                return resolve({ success: true, data: rows, message: 'Get capacitances by ids completed' })
            }
        )
    })
}

// Thêm mới capacitance (transaction)
export const insertCapacitanceTransaction = async (capacitance, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO capacitance(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value`,
            [
                capacitance.mrid,
                capacitance.multiplier,
                capacitance.unit,
                capacitance.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert capacitance failed' })
                return resolve({ success: true, data: capacitance, message: 'Insert capacitance completed' })
            }
        )
    })
}

// Cập nhật capacitance (transaction)
export const updateCapacitanceByIdTransaction = async (mrid, capacitance, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE capacitance
             SET multiplier = ?, unit = ?, value = ?
             WHERE mrid = ?`,
            [capacitance.multiplier, capacitance.unit, capacitance.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update capacitance failed' })
                return resolve({ success: true, data: capacitance, message: 'Update capacitance completed' })
            }
        )
    })
}

// Xóa capacitance (transaction)
export const deleteCapacitanceByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM capacitance WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete capacitance failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Capacitance not found' })
            return resolve({ success: true, data: null, message: 'Delete capacitance completed' })
        })
    })
}