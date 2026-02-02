import db from '../../datacontext/index'
// Import các hàm của lớp cha (PowerSystemResource)
import * as PowerSystemResourceFunc from '../powerSystemResource/index.js'

// Lấy TapChanger theo mrid
export const getTapChangerById = async (mrid) => {
    try {
        // 1. Lấy thông tin từ lớp cha (PowerSystemResource)
        const parentResult = await PowerSystemResourceFunc.getPowerSystemResourceById(mrid)
        if (!parentResult.success) {
            return { success: false, data: null, message: 'PowerSystemResource not found' }
        }

        // 2. Lấy thông tin riêng của TapChanger
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM tap_changer WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get tapChanger by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'TapChanger specific data not found' })
                    
                    // Merge dữ liệu cha và con
                    return resolve({ success: true, data: { ...parentResult.data, ...row }, message: 'Get tapChanger by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get tapChanger by id failed' }
    }
}

// Lấy TapChanger theo asset_id (thông qua bảng asset_psr)
export const getTapChangerByAssetId = async (assetId) => {
    try {
        return new Promise((resolve, reject) => {
            // 1. Tìm mrid của TapChanger (tức là psr_id) trong bảng asset_psr
            db.get(
                `SELECT psr_id FROM asset_psr WHERE asset_id = ?`,
                [assetId],
                async (err, row) => {
                    if (err) {
                        return reject({ success: false, err, message: 'Get AssetPsr failed' })
                    }
                    
                    if (!row) {
                        return resolve({ success: false, data: null, message: 'No TapChanger associated with this Asset' })
                    }

                    // 2. Gọi hàm getTapChangerById để lấy đầy đủ thông tin (bao gồm cả lớp cha)
                    try {
                        const result = await getTapChangerById(row.psr_id);
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get TapChanger by AssetId failed' }
    }
}

// Thêm mới TapChanger (transaction)
export const insertTapChangerTransaction = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 1. Gọi transaction của lớp cha
            const parentResult = await PowerSystemResourceFunc.insertPowerSystemResourceTransaction(info, dbsql)
            if (!parentResult.success) {
                return reject({ success: false, message: 'Insert PowerSystemResource failed', err: parentResult.err })
            }

            // 2. Lưu vào bảng tap_changer
            dbsql.run(
                `INSERT INTO tap_changer(
                    mrid, control_enabled, high_step, initial_delay, low_step, 
                    ltc_flag, neutral_step, neutral_u, normal_step, step, 
                    subsequent_delay, tap_changer_control, sv_tap_step
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    control_enabled = excluded.control_enabled,
                    high_step = excluded.high_step,
                    initial_delay = excluded.initial_delay,
                    low_step = excluded.low_step,
                    ltc_flag = excluded.ltc_flag,
                    neutral_step = excluded.neutral_step,
                    neutral_u = excluded.neutral_u,
                    normal_step = excluded.normal_step,
                    step = excluded.step,
                    subsequent_delay = excluded.subsequent_delay,
                    tap_changer_control = excluded.tap_changer_control,
                    sv_tap_step = excluded.sv_tap_step
                `,
                [
                    info.mrid,
                    info.control_enabled,
                    info.high_step,
                    info.initial_delay,
                    info.low_step,
                    info.ltc_flag,
                    info.neutral_step,
                    info.neutral_u,
                    info.normal_step,
                    info.step,
                    info.subsequent_delay,
                    info.tap_changer_control,
                    info.sv_tap_step
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Insert tapChanger failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert tapChanger completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert tapChanger transaction failed' })
        }
    })
}

// Cập nhật TapChanger (transaction)
export const updateTapChangerTransaction = async (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 1. Gọi transaction update của lớp cha
            const parentResult = await PowerSystemResourceFunc.updatePowerSystemResourceTransaction(mrid, info, dbsql)
            if (!parentResult.success) {
                return reject({ success: false, message: 'Update PowerSystemResource failed', err: parentResult.err })
            }

            // 2. Update bảng tap_changer
            dbsql.run(
                `UPDATE tap_changer SET
                    control_enabled = ?,
                    high_step = ?,
                    initial_delay = ?,
                    low_step = ?,
                    ltc_flag = ?,
                    neutral_step = ?,
                    neutral_u = ?,
                    normal_step = ?,
                    step = ?,
                    subsequent_delay = ?,
                    tap_changer_control = ?,
                    sv_tap_step = ?
                WHERE mrid = ?`,
                [
                    info.control_enabled,
                    info.high_step,
                    info.initial_delay,
                    info.low_step,
                    info.ltc_flag,
                    info.neutral_step,
                    info.neutral_u,
                    info.normal_step,
                    info.step,
                    info.subsequent_delay,
                    info.tap_changer_control,
                    info.sv_tap_step,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Update tapChanger failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Update tapChanger completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update tapChanger transaction failed' })
        }
    })
}

// Xóa TapChanger (transaction)
export const deleteTapChangerTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 1. Gọi transaction delete của lớp cha
            const parentResult = await PowerSystemResourceFunc.deletePowerSystemResourceTransaction(mrid, dbsql)
            if (!parentResult.success) {
                return reject({ success: false, message: 'Delete PowerSystemResource failed', err: parentResult.err })
            }

            // 2. Xoá ở bảng tap_changer
            dbsql.run("DELETE FROM tap_changer WHERE mrid=?", [mrid], function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Delete tapChanger failed' })
                }
                return resolve({ success: true, data: mrid, message: 'Delete tapChanger completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete tapChanger transaction failed' })
        }
    })
}