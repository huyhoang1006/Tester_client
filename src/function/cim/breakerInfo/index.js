import db from '../../datacontext/index'
import * as OldSwitchInfoFunc from '../OldSwitchInfo/index.js'

// Lấy breakerInfo theo mrid
export const getBreakerInfoById = async (mrid) => {
    try {
        const switchInfoResult = await OldSwitchInfoFunc.getOldSwitchInfoById(mrid)
        if (!switchInfoResult.success) {
            return { success: false, data: null, message: 'OldSwitchInfo not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM breaker_info WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get breakerInfo by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'BreakerInfo not found' })
                    return resolve({ success: true, data: { ...switchInfoResult.data, ...row }, message: 'Get breakerInfo by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get breakerInfo by id failed' }
    }
}

// Thêm mới breakerInfo (transaction)
export const insertBreakerInfoTransaction = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const switchInfoResult = await OldSwitchInfoFunc.insertOldSwitchInfoTransaction(info, dbsql)
            if (!switchInfoResult.success) {
                return reject({ success: false, message: 'Insert OldSwitchInfo failed', err: switchInfoResult.err })
            }
            dbsql.run(
                `INSERT INTO breaker_info(
                    mrid, phase_trip
                ) VALUES (?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    phase_trip = excluded.phase_trip
                `,
                [
                    info.mrid,
                    info.phase_trip
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert breakerInfo failed' })
                    return resolve({ success: true, data: info, message: 'Insert breakerInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert breakerInfo transaction failed' })
        }
    })
}

// Cập nhật breakerInfo (transaction)
export const updateBreakerInfoTransaction = async (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const switchInfoResult = await OldSwitchInfoFunc.updateOldSwitchInfoTransaction(mrid, info, dbsql)
            if (!switchInfoResult.success) {
                return reject({ success: false, message: 'Update OldSwitchInfo failed', err: switchInfoResult.err })
            }
            dbsql.run(
                `UPDATE breaker_info SET
                    phase_trip = ?
                WHERE mrid = ?`,
                [
                    info.phase_trip,
                    mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update breakerInfo failed' })
                    return resolve({ success: true, data: info, message: 'Update breakerInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update breakerInfo transaction failed' })
        }
    })
}

// Xóa breakerInfo (transaction)
export const deleteBreakerInfoTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        try {
            // Delete breaker_info row first
            dbsql.run("DELETE FROM breaker_info WHERE mrid=?", [mrid], function (err) {
                if (err) return reject({ success: false, err, message: 'Delete breakerInfo failed' })

                // then delete parent OldSwitchInfo
                OldSwitchInfoFunc.deleteOldSwitchInfoTransaction(mrid, dbsql)
                    .then((switchRes) => {
                        if (!switchRes.success) {
                            return reject({ success: false, message: 'Delete OldSwitchInfo failed', err: switchRes.err })
                        }
                        return resolve({ success: true, data: mrid, message: 'Delete breakerInfo completed' })
                    })
                    .catch((err2) => {
                        return reject({ success: false, err: err2, message: 'Delete OldSwitchInfo transaction failed' })
                    })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete breakerInfo transaction failed' })
        }
    })
}