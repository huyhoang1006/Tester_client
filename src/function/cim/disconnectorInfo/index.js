import db from '../../datacontext/index'
import * as OldSwitchInfoFunc from '../oldSwitchInfo/index.js'

// Lấy disconnectorInfo theo mrid
export const getDisconnectorInfoById = async (mrid) => {
    try {
        const switchInfoResult = await OldSwitchInfoFunc.getOldSwitchInfoById(mrid)
        if (!switchInfoResult.success) {
            return { success: false, data: null, message: 'OldSwitchInfo not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM disconnector_info WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get disconnectorInfo by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'DisconnectorInfo not found' })
                    return resolve({ success: true, data: { ...switchInfoResult.data, ...row }, message: 'Get disconnectorInfo by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get disconnectorInfo by id failed' }
    }
}

// Thêm mới disconnectorInfo (transaction)
export const insertDisconnectorInfoTransaction = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const switchInfoResult = await OldSwitchInfoFunc.insertOldSwitchInfoTransaction(info, dbsql)
            if (!switchInfoResult.success) {
                return reject({ success: false, message: 'Insert OldSwitchInfo failed', err: switchInfoResult.err })
            }
            dbsql.run(
                `INSERT INTO disconnector_info(
                    mrid, rated_duration_short_circuit, withstand_voltage_earth_poles, power_frequency_isolating_distance
                ) VALUES (?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    rated_duration_short_circuit = excluded.rated_duration_short_circuit,
                    withstand_voltage_earth_poles = excluded.withstand_voltage_earth_poles,
                    power_frequency_isolating_distance = excluded.power_frequency_isolating_distance
                `,
                [
                    info.mrid,
                    info.rated_duration_short_circuit,
                    info.withstand_voltage_earth_poles,
                    info.power_frequency_isolating_distance
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Insert disconnectorInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert disconnectorInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert disconnectorInfo transaction failed' })
        }
    })
}

// Cập nhật disconnectorInfo (transaction)
export const updateDisconnectorInfoTransaction = async (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const switchInfoResult = await OldSwitchInfoFunc.updateOldSwitchInfoTransaction(mrid, info, dbsql)
            if (!switchInfoResult.success) {
                return reject({ success: false, message: 'Update OldSwitchInfo failed', err: switchInfoResult.err })
            }
            dbsql.run(
                `UPDATE disconnector_info SET
                    rated_duration_short_circuit = ?,
                    withstand_voltage_earth_poles = ?,
                    power_frequency_isolating_distance = ?
                WHERE mrid = ?`,
                [
                    info.rated_duration_short_circuit,
                    info.withstand_voltage_earth_poles,
                    info.power_frequency_isolating_distance,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Update disconnectorInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Update disconnectorInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update disconnectorInfo transaction failed' })
        }
    })
}

// Xóa disconnectorInfo (transaction)
export const deleteDisconnectorInfoTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const switchInfoResult = await OldSwitchInfoFunc.deleteOldSwitchInfoTransaction(mrid, dbsql)
            if (!switchInfoResult.success) {
                return reject({ success: false, message: 'Delete OldSwitchInfo failed', err: switchInfoResult.err })
            }
            dbsql.run("DELETE FROM disconnector_info WHERE mrid=?", [mrid], function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Delete disconnectorInfo failed' })
                }
                return resolve({ success: true, data: mrid, message: 'Delete disconnectorInfo completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete disconnectorInfo transaction failed' })
        }
    })
}