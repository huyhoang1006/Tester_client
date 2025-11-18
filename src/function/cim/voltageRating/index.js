import db from '../../datacontext/index'

// 🔹 Lấy VoltageRating theo mrid
export const getVoltageRatingById = async (mrid) => {
    try {
        const row = await new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM voltage_rating WHERE mrid = ?`,
                [mrid],
                (err, row) => (err ? reject(err) : resolve(row))
            )
        })

        if (!row) {
            return { success: false, data: null, message: 'VoltageRating not found' }
        }

        return { success: true, data: row, message: 'Get VoltageRating by id completed' }
    } catch (err) {
        console.error('Error in getVoltageRatingById:', err)
        return { success: false, err, message: 'Get VoltageRating by id failed' }
    }
}

// 🔹 Lấy VoltageRating theo transformer_end_id
export const getVoltageRatingByTransformerEndId = async (transformerEndId) => {
    try {
        const rows = await new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM voltage_rating WHERE transformer_end_id = ?`,
                [transformerEndId],
                (err, rows) => (err ? reject(err) : resolve(rows))
            )
        })

        if (!rows || rows.length === 0) {
            return { success: false, data: [], message: 'No VoltageRating found for this transformerEndId' }
        }

        return { success: true, data: rows, message: 'Get VoltageRating by transformerEndId completed' }
    } catch (err) {
        console.error('Error in getVoltageRatingByTransformerEndId:', err)
        return { success: false, err, message: 'Get VoltageRating by transformerEndId failed' }
    }
}

// 🔹 Thêm mới VoltageRating (transaction)
export const insertVoltageRatingTransaction = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run(
                `INSERT INTO voltage_rating(
                    mrid, rated_u, rated_ln, insulation_u, insulation_c, regulation, transformer_end_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    rated_u = excluded.rated_u,
                    rated_ln = excluded.rated_ln,
                    insulation_u = excluded.insulation_u,
                    insulation_c = excluded.insulation_c,
                    regulation = excluded.regulation,
                    transformer_end_id = excluded.transformer_end_id`,
                [
                    info.mrid,
                    info.rated_u,
                    info.rated_ln,
                    info.insulation_u,
                    info.insulation_c,
                    info.regulation,
                    info.transformer_end_id
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Insert VoltageRating failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert VoltageRating completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert VoltageRating transaction failed' })
        }
    })
}

// 🔹 Cập nhật VoltageRating (transaction)
export const updateVoltageRatingTransaction = async (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run(
                `UPDATE voltage_rating SET
                    rated_u = ?,
                    rated_ln = ?,
                    insulation_u = ?,
                    insulation_c = ?,
                    regulation = ?,
                    transformer_end_id = ?
                WHERE mrid = ?`,
                [
                    info.rated_u,
                    info.rated_ln,
                    info.insulation_u,
                    info.insulation_c,
                    info.regulation,
                    info.transformer_end_id,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Update VoltageRating failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Update VoltageRating completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update VoltageRating transaction failed' })
        }
    })
}

// 🔹 Xóa VoltageRating (transaction)
export const deleteVoltageRatingTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run(
                `DELETE FROM voltage_rating WHERE mrid = ?`,
                [mrid],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Delete VoltageRating failed' })
                    }
                    return resolve({ success: true, data: mrid, message: 'Delete VoltageRating completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Delete VoltageRating transaction failed' })
        }
    })
}