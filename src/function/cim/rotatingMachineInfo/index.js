import db from '../../datacontext/index'
import * as AssetInfoFunc from '../assetInfo/index.js'

// Lấy rotatingMachineInfo theo mrid
export const getRotatingMachineInfoById = async (mrid) => {
    try {
        const assetInfoResult = await AssetInfoFunc.getAssetInfoById(mrid)
        if (!assetInfoResult.success) {
            return { success: false, data: null, message: 'AssetInfo not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM rotating_machine_info WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get rotatingMachineInfo by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'RotatingMachineInfo not found' })
                    return resolve({ success: true, data: { ...assetInfoResult.data, ...row }, message: 'Get rotatingMachineInfo by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get rotatingMachineInfo by id failed' }
    }
}

// Thêm mới rotatingMachineInfo (transaction)
export const insertRotatingMachineInfoTransaction = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetInfoResult = await AssetInfoFunc.insertAssetInfoTransaction(info, dbsql)
            if (!assetInfoResult.success) {
                return reject({ success: false, message: 'Insert assetInfo failed', err: assetInfoResult.err })
            }
            dbsql.run(
                `INSERT INTO rotating_machine_info(
                    mrid, star_point, rated_frequency, rated_current, rated_u, rated_speed,
                    rated_power, rated_power_factor, rated_thermal_class, rated_ifd, rated_ufd
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    star_point = excluded.star_point,
                    rated_frequency = excluded.rated_frequency,
                    rated_current = excluded.rated_current,
                    rated_u = excluded.rated_u,
                    rated_speed = excluded.rated_speed,
                    rated_power = excluded.rated_power,
                    rated_power_factor = excluded.rated_power_factor,
                    rated_thermal_class = excluded.rated_thermal_class,
                    rated_ifd = excluded.rated_ifd,
                    rated_ufd = excluded.rated_ufd
                `,
                [
                    info.mrid,
                    info.star_point,
                    info.rated_frequency,
                    info.rated_current,
                    info.rated_u,
                    info.rated_speed,
                    info.rated_power,
                    info.rated_power_factor,
                    info.rated_thermal_class,
                    info.rated_ifd,
                    info.rated_ufd
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Insert rotatingMachineInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert rotatingMachineInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert rotatingMachineInfo transaction failed' })
        }
    })
}

// Cập nhật rotatingMachineInfo (transaction)
export const updateRotatingMachineInfoTransaction = async (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetInfoResult = await AssetInfoFunc.updateAssetInfoTransaction(mrid, info, dbsql)
            if (!assetInfoResult.success) {
                return reject({ success: false, message: 'Update assetInfo failed', err: assetInfoResult.err })
            }
            dbsql.run(
                `UPDATE rotating_machine_info SET
                    star_point = ?,
                    rated_frequency = ?,
                    rated_current = ?,
                    rated_u = ?,
                    rated_speed = ?,
                    rated_power = ?,
                    rated_power_factor = ?,
                    rated_thermal_class = ?,
                    rated_ifd = ?,
                    rated_ufd = ?
                WHERE mrid = ?`,
                [
                    info.star_point,
                    info.rated_frequency,
                    info.rated_current,
                    info.rated_u,
                    info.rated_speed,
                    info.rated_power,
                    info.rated_power_factor,
                    info.rated_thermal_class,
                    info.rated_ifd,
                    info.rated_ufd,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Update rotatingMachineInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Update rotatingMachineInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update rotatingMachineInfo transaction failed' })
        }
    })
}

// Xóa rotatingMachineInfo (transaction)
export const deleteRotatingMachineInfoTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetInfoResult = await AssetInfoFunc.deleteAssetInfoTransaction(mrid, dbsql)
            if (!assetInfoResult.success) {
                return reject({ success: false, message: 'Delete assetInfo failed', err: assetInfoResult.err })
            }
            dbsql.run("DELETE FROM rotating_machine_info WHERE mrid=?", [mrid], function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Delete rotatingMachineInfo failed' })
                }
                return resolve({ success: true, data: mrid, message: 'Delete rotatingMachineInfo completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete rotatingMachineInfo transaction failed' })
        }
    })
}