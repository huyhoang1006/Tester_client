import db from '../../datacontext/index'
import * as BushingFunc from '../bushing/index.js'

// Lấy oldBushing theo mrid
export const getOldBushingById = async (mrid) => {
    try {
        const bushingResult = await BushingFunc.getBushingById(mrid)
        if (!bushingResult.success) {
            return { success: false, data: null, message: 'Bushing not found' }
        }

        return new Promise((resolve, reject) => {
            db.get(
                `SELECT *
                 FROM old_bushing
                 WHERE mrid = ?`,
                [mrid],
                (err, row) => {
                    if (err)
                        return reject({ success: false, err, message: 'Get oldBushing by id failed' })

                    if (!row)
                        return resolve({ success: false, data: null, message: 'OldBushing not found' })

                    return resolve({
                        success: true,
                        data: { ...bushingResult.data, ...row },
                        message: 'Get oldBushing by id completed'
                    })
                }
            )
        })

    } catch (err) {
        return { success: false, err, message: 'Get oldBushing by id failed' }
    }
}

export const getOldBushingByTransformerEndInfoId = async (transformerEndInfoId) => {
    try {
        const rows = await new Promise((resolve, reject) => {
            db.all(
                `
                SELECT 
                    *
                FROM old_bushing ob
                LEFT JOIN bushing b ON ob.mrid = b.mrid
                LEFT JOIN asset a ON b.mrid = a.mrid
                LEFT JOIN identified_object i ON a.mrid = i.mrid
                WHERE ob.transformer_end_info_id = ?
                `,
                [transformerEndInfoId],
                (err, result) => (err ? reject(err) : resolve(result))
            )
        })

        if (!rows || rows.length === 0) {
            return {
                success: false,
                data: [],
                message: 'No OldBushing found for this transformer_end_info_id'
            }
        }

        return {
            success: true,
            data: rows,
            message: 'Get OldBushing by transformer_end_info_id completed'
        }

    } catch (err) {
        return {
            success: false,
            err,
            message: 'Get OldBushing by transformer_end_info_id failed'
        }
    }
}

export const insertOldBushingTransaction = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const bushingResult = await BushingFunc.insertBushingTransaction(info, dbsql)
            if (!bushingResult.success) {
                return reject({
                    success: false,
                    message: 'Insert bushing failed',
                    err: bushingResult.err
                })
            }

            dbsql.run(
                `INSERT INTO old_bushing(
                    mrid, phase, transformer_end_info_id
                ) VALUES (?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    phase = excluded.phase,
                    transformer_end_info_id = excluded.transformer_end_info_id
                `,
                [
                    info.mrid,
                    info.phase,
                    info.transformer_end_info_id
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Insert oldBushing failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert oldBushing completed' })
                }
            )

        } catch (err) {
            return reject({ success: false, err, message: 'Insert oldBushing transaction failed' })
        }
    })
}

export const updateOldBushingTransaction = async (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const bushingResult = await BushingFunc.updateBushingTransaction(mrid, info, dbsql)
            if (!bushingResult.success) {
                return reject({
                    success: false,
                    message: 'Update bushing failed',
                    err: bushingResult.err
                })
            }

            dbsql.run(
                `UPDATE old_bushing SET
                    phase = ?,
                    transformer_end_info_id = ?
                WHERE mrid = ?`,
                [
                    info.phase,
                    info.transformer_end_info_id,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Update oldBushing failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Update oldBushing completed' })
                }
            )

        } catch (err) {
            return reject({ success: false, err, message: 'Update oldBushing transaction failed' })
        }
    })
}

export const deleteOldBushingTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 1) Xóa bản ghi trong bảng con trước (old_bushing)
            dbsql.run(
                `DELETE FROM old_bushing WHERE mrid = ?`,
                [mrid],
                async function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Delete oldBushing failed' })
                    }

                    // 2) Sau khi xóa thành công old_bushing, xóa phần bushing (cha)
                    try {
                        const bushingResult = await BushingFunc.deleteBushingTransaction(mrid, dbsql)
                        if (!bushingResult.success) {
                            // Nếu xóa bushing thất bại, trả về lỗi
                            return reject({
                                success: false,
                                message: 'Delete bushing failed after deleting oldBushing',
                                err: bushingResult.err || null
                            })
                        }

                        // Thành công cả hai bước
                        return resolve({ success: true, data: mrid, message: 'Delete oldBushing completed' })
                    } catch (bErr) {
                        return reject({
                            success: false,
                            err: bErr,
                            message: 'Delete bushing transaction failed after deleting oldBushing'
                        })
                    }
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Delete oldBushing transaction failed' })
        }
    })
}