import db from '../../datacontext/index'
import * as BushingInfoFunc from '../bushingInfo/index.js'

// Lấy oldBushingInfo theo mrid
export const getOldBushingInfoById = async (mrid) => {
    try {
        const bushingInfoResult = await BushingInfoFunc.getBushingInfoById(mrid)
        if (!bushingInfoResult.success) {
            return { success: false, data: null, message: 'BushingInfo not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM old_bushing_info WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get oldBushingInfo by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'OldBushingInfo not found' })
                    return resolve({ success: true, data: { ...bushingInfoResult.data, ...row }, message: 'Get oldBushingInfo by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get oldBushingInfo by id failed' }
    }
}

export const getOldBushingInfoByTransformerEndInfoIds = async (transformerEndInfoIds) => {
    try {
        if (!Array.isArray(transformerEndInfoIds) || transformerEndInfoIds.length === 0) {
            return {
                success: true,
                data: [],
                message: 'TransformerEndInfoIds is empty'
            }
        }

        const placeholders = transformerEndInfoIds.map(() => '?').join(',')

        return new Promise((resolve, reject) => {
            db.all(
                `SELECT mrid 
                 FROM old_bushing_info 
                 WHERE transformer_end_info IN (${placeholders})`,
                transformerEndInfoIds,
                (err, rows) => {
                    if (err) {
                        return reject({
                            success: false,
                            err,
                            message: 'Get OldBushingInfo by transformerEndInfoIds failed'
                        })
                    }

                    return resolve({
                        success: true,
                        data: rows || [],
                        message: 'Get OldBushingInfo by transformerEndInfoIds completed'
                    })
                }
            )
        })
    } catch (err) {
        return {
            success: false,
            err,
            message: 'Get OldBushingInfo by transformerEndInfoIds failed'
        }
    }
}

// Thêm mới oldBushingInfo (transaction)
export const insertOldBushingInfoTransaction = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const bushingInfoResult = await BushingInfoFunc.insertBushingInfoTransaction(info, dbsql)
            if (!bushingInfoResult.success) {
                return reject({ success: false, message: 'Insert bushingInfo failed', err: bushingInfoResult.err })
            }
            dbsql.run(
                `INSERT INTO old_bushing_info(
                    mrid, high_voltage_limit, c2_capacitance, c2_power_factor, rated_frequency, transformer_end_info, phase
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    high_voltage_limit = excluded.high_voltage_limit,
                    c2_capacitance = excluded.c2_capacitance,
                    c2_power_factor = excluded.c2_power_factor,
                    rated_frequency = excluded.rated_frequency,
                    transformer_end_info = excluded.transformer_end_info,
                    phase = excluded.phase
                `,
                [
                    info.mrid,
                    info.high_voltage_limit,
                    info.c2_capacitance,
                    info.c2_power_factor,
                    info.rated_frequency,
                    info.transformer_end_info,
                    info.phase
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Insert oldBushingInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert oldBushingInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert oldBushingInfo transaction failed' })
        }
    })
}

// Cập nhật oldBushingInfo (transaction)
export const updateOldBushingInfoTransaction = async (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const bushingInfoResult = await BushingInfoFunc.updateBushingInfoTransaction(mrid, info, dbsql)
            if (!bushingInfoResult.success) {
                return reject({ success: false, message: 'Update bushingInfo failed', err: bushingInfoResult.err })
            }
            dbsql.run(
                `UPDATE old_bushing_info SET
                    high_voltage_limit = ?,
                    c2_capacitance = ?,
                    c2_power_factor = ?,
                    rated_frequency = ?,
                    transformer_end_info = ?,
                    phase = ?
                WHERE mrid = ?`,
                [
                    info.high_voltage_limit,
                    info.c2_capacitance,
                    info.c2_power_factor,
                    info.rated_frequency,
                    info.transformer_end_info,
                    info.phase,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Update oldBushingInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Update oldBushingInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update oldBushingInfo transaction failed' })
        }
    })
}

// Xóa oldBushingInfo (transaction)
export const deleteOldBushingInfoTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const bushingInfoResult = await BushingInfoFunc.deleteBushingInfoTransaction(mrid, dbsql)
            if (!bushingInfoResult.success) {
                return reject({ success: false, message: 'Delete bushingInfo failed', err: bushingInfoResult.err })
            }
            dbsql.run("DELETE FROM old_bushing_info WHERE mrid=?", [mrid], function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Delete oldBushingInfo failed' })
                }
                return resolve({ success: true, data: mrid, message: 'Delete oldBushingInfo completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete oldBushingInfo transaction failed' })
        }
    })
}