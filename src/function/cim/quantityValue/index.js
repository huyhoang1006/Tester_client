import db from '../../datacontext/index'

// Lấy QuantityValue theo mrid
export const getQuantityValueById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM quantity_value WHERE mrid = ?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get QuantityValue by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'QuantityValue not found' })
                return resolve({ success: true, data: row, message: 'Get QuantityValue by id completed' })
            }
        )
    })
}

// Thêm mới QuantityValue (transaction)
export const insertQuantityValueTransaction = async (info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO quantity_value(mrid, multiplier, unit, value)
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
                if (err) return reject({ success: false, err, message: 'Insert QuantityValue failed' })
                return resolve({ success: true, data: info, message: 'Insert QuantityValue completed' })
            }
        )
    })
}

// Cập nhật QuantityValue (transaction)
export const updateQuantityValueTransaction = async (mrid, info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE quantity_value SET
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
                if (err) return reject({ success: false, err, message: 'Update QuantityValue failed' })
                return resolve({ success: true, data: info, message: 'Update QuantityValue completed' })
            }
        )
    })
}

// Xóa QuantityValue (transaction)
export const deleteQuantityValueTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `DELETE FROM quantity_value WHERE mrid = ?`,
            [mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Delete QuantityValue failed' })
                return resolve({ success: true, data: mrid, message: 'Delete QuantityValue completed' })
            }
        )
    })
}