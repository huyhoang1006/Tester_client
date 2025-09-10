import db from '../../datacontext/index'
import * as TransformerEndInfoFunc from '../transformerEndInfo/index.js'

// Lấy oldTransformerEndInfo theo mrid
export const getOldTransformerEndInfoById = async (mrid) => {
    try {
        const baseResult = await TransformerEndInfoFunc.getTransformerEndInfoById(mrid)
        if (!baseResult.success) {
            return { success: false, data: null, message: 'TransformerEndInfo not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM old_transformer_end_info WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get oldTransformerEndInfo by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'OldTransformerEndInfo not found' })
                    return resolve({ success: true, data: { ...baseResult.data, ...row }, message: 'Get oldTransformerEndInfo by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get oldTransformerEndInfo by id failed' }
    }
}

// Thêm mới oldTransformerEndInfo (transaction)
export const insertOldTransformerEndInfoTransaction = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const baseResult = await TransformerEndInfoFunc.insertTransformerEndInfoTransaction(info, dbsql)
            if (!baseResult.success) {
                return reject({ success: false, message: 'Insert transformerEndInfo failed', err: baseResult.err })
            }
            dbsql.run(
                `INSERT INTO old_transformer_end_info(
                    mrid, material, spare, accessibility, power_transformer_info_id
                ) VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    material = excluded.material,
                    spare = excluded.spare,
                    accessibility = excluded.accessibility,
                    power_transformer_info_id = excluded.power_transformer_info_id
                `,
                [
                    info.mrid,
                    info.material,
                    info.spare,
                    info.accessibility,
                    info.power_transformer_info_id
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Insert oldTransformerEndInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert oldTransformerEndInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert oldTransformerEndInfo transaction failed' })
        }
    })
}

// Cập nhật oldTransformerEndInfo (transaction)
export const updateOldTransformerEndInfoTransaction = async (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const baseResult = await TransformerEndInfoFunc.updateTransformerEndInfoTransaction(mrid, info, dbsql)
            if (!baseResult.success) {
                return reject({ success: false, message: 'Update transformerEndInfo failed', err: baseResult.err })
            }
            dbsql.run(
                `UPDATE old_transformer_end_info SET
                    material = ?,
                    spare = ?,
                    accessibility = ?,
                    power_transformer_info_id = ?
                WHERE mrid = ?`,
                [
                    info.material,
                    info.spare,
                    info.accessibility,
                    info.power_transformer_info_id,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Update oldTransformerEndInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Update oldTransformerEndInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update oldTransformerEndInfo transaction failed' })
        }
    })
}

// Xóa oldTransformerEndInfo (transaction)
export const deleteOldTransformerEndInfoTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const baseResult = await TransformerEndInfoFunc.deleteTransformerEndInfoTransaction(mrid, dbsql)
            if (!baseResult.success) {
                return reject({ success: false, message: 'Delete transformerEndInfo failed', err: baseResult.err })
            }
            dbsql.run("DELETE FROM old_transformer_end_info WHERE mrid=?", [mrid], function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Delete oldTransformerEndInfo failed' })
                }
                return resolve({ success: true, data: mrid, message: 'Delete oldTransformerEndInfo completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete oldTransformerEndInfo transaction failed' })
        }
    })
}