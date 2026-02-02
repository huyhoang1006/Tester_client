import db from '../../datacontext/index'
import * as AssetInfoFunc from '../assetInfo/index.js'

// Lấy tapChangerInfo theo mrid
export const getTapChangerInfoById = async (mrid) => {
    try {
        const assetInfoResult = await AssetInfoFunc.getAssetInfoById(mrid)
        if (!assetInfoResult.success) {
            return { success: false, data: null, message: 'AssetInfo not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM tap_changer_info WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get tapChangerInfo by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'TapChangerInfo not found' })
                    return resolve({ success: true, data: { ...assetInfoResult.data, ...row }, message: 'Get tapChangerInfo by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get tapChangerInfo by id failed' }
    }
}

// Thêm mới tapChangerInfo (transaction)
export const insertTapChangerInfoTransaction = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetInfoResult = await AssetInfoFunc.insertAssetInfoTransaction(info, dbsql)
            if (!assetInfoResult.success) {
                return reject({ success: false, message: 'Insert assetInfo failed', err: assetInfoResult.err })
            }
            dbsql.run(
                `INSERT INTO tap_changer_info(
                    mrid, bil, ct_rating, ct_ratio, frequency, high_step, is_tcul, 
                    low_step, neutral_step, pt_ratio, rated_apparent_power, 
                    rated_current, rated_voltage, step_phase_increment, step_voltage_increment
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    bil = excluded.bil,
                    ct_rating = excluded.ct_rating,
                    ct_ratio = excluded.ct_ratio,
                    frequency = excluded.frequency,
                    high_step = excluded.high_step,
                    is_tcul = excluded.is_tcul,
                    low_step = excluded.low_step,
                    neutral_step = excluded.neutral_step,
                    pt_ratio = excluded.pt_ratio,
                    rated_apparent_power = excluded.rated_apparent_power,
                    rated_current = excluded.rated_current,
                    rated_voltage = excluded.rated_voltage,
                    step_phase_increment = excluded.step_phase_increment,
                    step_voltage_increment = excluded.step_voltage_increment
                `,
                [
                    info.mrid,
                    info.bil,
                    info.ct_rating,
                    info.ct_ratio,
                    info.frequency,
                    info.high_step,
                    info.is_tcul,
                    info.low_step,
                    info.neutral_step,
                    info.pt_ratio,
                    info.rated_apparent_power,
                    info.rated_current,
                    info.rated_voltage,
                    info.step_phase_increment,
                    info.step_voltage_increment
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Insert tapChangerInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert tapChangerInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert tapChangerInfo transaction failed' })
        }
    })
}

// Cập nhật tapChangerInfo (transaction)
export const updateTapChangerInfoTransaction = async (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetInfoResult = await AssetInfoFunc.updateAssetInfoTransaction(mrid, info, dbsql)
            if (!assetInfoResult.success) {
                return reject({ success: false, message: 'Update assetInfo failed', err: assetInfoResult.err })
            }
            dbsql.run(
                `UPDATE tap_changer_info SET
                    bil = ?,
                    ct_rating = ?,
                    ct_ratio = ?,
                    frequency = ?,
                    high_step = ?,
                    is_tcul = ?,
                    low_step = ?,
                    neutral_step = ?,
                    pt_ratio = ?,
                    rated_apparent_power = ?,
                    rated_current = ?,
                    rated_voltage = ?,
                    step_phase_increment = ?,
                    step_voltage_increment = ?
                WHERE mrid = ?`,
                [
                    info.bil,
                    info.ct_rating,
                    info.ct_ratio,
                    info.frequency,
                    info.high_step,
                    info.is_tcul,
                    info.low_step,
                    info.neutral_step,
                    info.pt_ratio,
                    info.rated_apparent_power,
                    info.rated_current,
                    info.rated_voltage,
                    info.step_phase_increment,
                    info.step_voltage_increment,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Update tapChangerInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Update tapChangerInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update tapChangerInfo transaction failed' })
        }
    })
}

// Xóa tapChangerInfo (transaction)
export const deleteTapChangerInfoTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetInfoResult = await AssetInfoFunc.deleteAssetInfoByIdTransaction(mrid, dbsql)
            if (!assetInfoResult.success) {
                return reject({ success: false, message: 'Delete assetInfo failed', err: assetInfoResult.err })
            }
            dbsql.run("DELETE FROM tap_changer_info WHERE mrid=?", [mrid], function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Delete tapChangerInfo failed' })
                }
                return resolve({ success: true, data: mrid, message: 'Delete tapChangerInfo completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete tapChangerInfo transaction failed' })
        }
    })
}