import db from '../../datacontext/index'
// Import các hàm của lớp cha (TapChanger)
import * as TapChangerFunc from '../tapChanger/index.js'

// Lấy RatioTapChanger theo mrid
export const getRatioTapChangerById = async (mrid) => {
    try {
        // 1. Lấy thông tin từ lớp cha (TapChanger bao gồm PowerSystemResource)
        const parentResult = await TapChangerFunc.getTapChangerById(mrid)
        if (!parentResult.success) {
            return { success: false, data: null, message: 'TapChanger not found' }
        }

        // 2. Lấy thông tin riêng của RatioTapChanger
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM ratio_tap_changer WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get ratioTapChanger by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'RatioTapChanger specific data not found' })
                    
                    // Merge dữ liệu cha và con
                    return resolve({ success: true, data: { ...parentResult.data, ...row }, message: 'Get ratioTapChanger by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get ratioTapChanger by id failed' }
    }
}

// Lấy RatioTapChanger theo asset_id (thông qua bảng asset_psr)
export const getRatioTapChangerByAssetId = async (assetId) => {
    try {
        return new Promise((resolve, reject) => {
            // 1. Tìm mrid của RatioTapChanger (tức là psr_id) trong bảng asset_psr
            db.get(
                `SELECT psr_id FROM asset_psr WHERE asset_id = ?`,
                [assetId],
                async (err, row) => {
                    if (err) {
                        return reject({ success: false, err, message: 'Get AssetPsr failed' })
                    }
                    
                    if (!row) {
                        return resolve({ success: false, data: null, message: 'No RatioTapChanger associated with this Asset' })
                    }

                    // 2. Gọi hàm getRatioTapChangerById để lấy đầy đủ thông tin (bao gồm lớp cha TapChanger -> PowerSystemResource -> IdentifiedObject)
                    try {
                        const result = await getRatioTapChangerById(row.psr_id);
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get RatioTapChanger by AssetId failed' }
    }
}

// Thêm mới RatioTapChanger (transaction)
export const insertRatioTapChangerTransaction = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 1. Gọi transaction của lớp cha (TapChanger)
            const parentResult = await TapChangerFunc.insertTapChangerTransaction(info, dbsql)
            if (!parentResult.success) {
                return reject({ success: false, message: 'Insert TapChanger failed', err: parentResult.err })
            }

            // 2. Lưu vào bảng ratio_tap_changer
            dbsql.run(
                `INSERT INTO ratio_tap_changer(
                    mrid, step_voltage_increment, tcul_control_mode, transformer_end, ratio_tap_changer_table
                ) VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    step_voltage_increment = excluded.step_voltage_increment,
                    tcul_control_mode = excluded.tcul_control_mode,
                    transformer_end = excluded.transformer_end,
                    ratio_tap_changer_table = excluded.ratio_tap_changer_table
                `,
                [
                    info.mrid,
                    info.step_voltage_increment,
                    info.tcul_control_mode,
                    info.transformer_end,
                    info.ratio_tap_changer_table
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Insert ratioTapChanger failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert ratioTapChanger completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert ratioTapChanger transaction failed' })
        }
    })
}

// Cập nhật RatioTapChanger (transaction)
export const updateRatioTapChangerTransaction = async (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 1. Gọi transaction update của lớp cha
            const parentResult = await TapChangerFunc.updateTapChangerTransaction(mrid, info, dbsql)
            if (!parentResult.success) {
                return reject({ success: false, message: 'Update TapChanger failed', err: parentResult.err })
            }

            // 2. Update bảng ratio_tap_changer
            dbsql.run(
                `UPDATE ratio_tap_changer SET
                    step_voltage_increment = ?,
                    tcul_control_mode = ?,
                    transformer_end = ?,
                    ratio_tap_changer_table = ?
                WHERE mrid = ?`,
                [
                    info.step_voltage_increment,
                    info.tcul_control_mode,
                    info.transformer_end,
                    info.ratio_tap_changer_table,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Update ratioTapChanger failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Update ratioTapChanger completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update ratioTapChanger transaction failed' })
        }
    })
}

// Xóa RatioTapChanger (transaction)
export const deleteRatioTapChangerTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 1. Gọi transaction delete của lớp cha
            const parentResult = await TapChangerFunc.deleteTapChangerTransaction(mrid, dbsql)
            if (!parentResult.success) {
                return reject({ success: false, message: 'Delete TapChanger failed', err: parentResult.err })
            }

            // 2. Xoá ở bảng ratio_tap_changer
            dbsql.run("DELETE FROM ratio_tap_changer WHERE mrid=?", [mrid], function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Delete ratioTapChanger failed' })
                }
                return resolve({ success: true, data: mrid, message: 'Delete ratioTapChanger completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete ratioTapChanger transaction failed' })
        }
    })
}