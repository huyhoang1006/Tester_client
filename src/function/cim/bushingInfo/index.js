import db from '../../datacontext/index'
import * as AssetInfoFunc from '../assetInfo/index.js'

// Lấy bushingInfo theo mrid
export const getBushingInfoById = async (mrid) => {
    try {
        const assetInfoResult = await AssetInfoFunc.getAssetInfoById(mrid)
        if (!assetInfoResult.success) {
            return { success: false, data: null, message: 'AssetInfo not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM bushing_info WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get bushingInfo by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'BushingInfo not found' })
                    return resolve({ success: true, data: { ...assetInfoResult.data, ...row }, message: 'Get bushingInfo by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get bushingInfo by id failed' }
    }
}

// Thêm mới bushingInfo (transaction)
export const insertBushingInfoTransaction = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetInfoResult = await AssetInfoFunc.insertAssetInfoTransaction(info, dbsql)
            if (!assetInfoResult.success) {
                return reject({ success: false, message: 'Insert assetInfo failed', err: assetInfoResult.err })
            }
            dbsql.run(
                `INSERT INTO bushing_info(
                    mrid, c_capacitance, c_power_factor, insulation_kind, rated_current,
                    rated_impulse_withstand_voltage, rated_line_to_ground_voltage, rated_voltage
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    c_capacitance = excluded.c_capacitance,
                    c_power_factor = excluded.c_power_factor,
                    insulation_kind = excluded.insulation_kind,
                    rated_current = excluded.rated_current,
                    rated_impulse_withstand_voltage = excluded.rated_impulse_withstand_voltage,
                    rated_line_to_ground_voltage = excluded.rated_line_to_ground_voltage,
                    rated_voltage = excluded.rated_voltage
                `,
                [
                    info.mrid,
                    info.c_capacitance,
                    info.c_power_factor,
                    info.insulation_kind,
                    info.rated_current,
                    info.rated_impulse_withstand_voltage,
                    info.rated_line_to_ground_voltage,
                    info.rated_voltage
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Insert bushingInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert bushingInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert bushingInfo transaction failed' })
        }
    })
}

// Cập nhật bushingInfo (transaction)
export const updateBushingInfoTransaction = async (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetInfoResult = await AssetInfoFunc.updateAssetInfoTransaction(mrid, info, dbsql)
            if (!assetInfoResult.success) {
                return reject({ success: false, message: 'Update assetInfo failed', err: assetInfoResult.err })
            }
            dbsql.run(
                `UPDATE bushing_info SET
                    c_capacitance = ?,
                    c_power_factor = ?,
                    insulation_kind = ?,
                    rated_current = ?,
                    rated_impulse_withstand_voltage = ?,
                    rated_line_to_ground_voltage = ?,
                    rated_voltage = ?
                WHERE mrid = ?`,
                [
                    info.c_capacitance,
                    info.c_power_factor,
                    info.insulation_kind,
                    info.rated_current,
                    info.rated_impulse_withstand_voltage,
                    info.rated_line_to_ground_voltage,
                    info.rated_voltage,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Update bushingInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Update bushingInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update bushingInfo transaction failed' })
        }
    })
}

// Xóa bushingInfo (transaction)
export const deleteBushingInfoTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetInfoResult = await AssetInfoFunc.deleteAssetInfoByIdTransaction(mrid, dbsql)
            if (!assetInfoResult.success) {
                return reject({ success: false, message: 'Delete assetInfo failed', err: assetInfoResult.err })
            }
            dbsql.run("DELETE FROM bushing_info WHERE mrid=?", [mrid], function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Delete bushingInfo failed' })
                }
                return resolve({ success: true, data: mrid, message: 'Delete bushingInfo completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete bushingInfo transaction failed' })
        }
    })
}