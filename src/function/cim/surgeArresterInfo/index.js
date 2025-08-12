import db from '../../datacontext/index'
import * as AssetInfoFunc from '../assetInfo/index.js'

// Lấy thông tin surge arrester info theo mrid
export const getSurgeArresterInfoById = async (mrid) => {
    try {
        const assetInfoResult = await AssetInfoFunc.getAssetInfoById(mrid)
        if (!assetInfoResult.success) {
            return { success: false, data: null, message: 'AssetInfo not found' }
        }
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM surge_arrester_info WHERE mrid=?", [mrid], (err, row) => {
                if (err) return reject({ success: false, err: err, message: 'Get surge arrester info by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'SurgeArresterInfo not found' })
                const data = { ...assetInfoResult.data, ...row }
                return resolve({ success: true, data: data, message: 'Get surge arrester info by id completed' })
            })
        })
    } catch (err) {
        return { success: false, err: err, message: 'Get surge arrester info by id failed' }
    }
}

// Thêm mới surge arrester info
export const insertSurgeArresterInfo = async (info) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            AssetInfoFunc.insertAssetInfoTransaction(info, db)
                .then(assetInfoResult => {
                    if (!assetInfoResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Insert assetInfo failed', err: assetInfoResult.err })
                    }
                    db.run(
                        `INSERT INTO surge_arrester_info(
                            mrid, continuous_operating_voltage, is_polymer, lightning_impulse_discharge_voltage,
                            line_discharge_class, nominal_discharge_current, pressure_relief_class, rated_voltage,
                            steep_front_discharge_voltage, switching_impulse_discharge_voltage
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(mrid) DO UPDATE SET
                            continuous_operating_voltage = excluded.continuous_operating_voltage,
                            is_polymer = excluded.is_polymer,
                            lightning_impulse_discharge_voltage = excluded.lightning_impulse_discharge_voltage,
                            line_discharge_class = excluded.line_discharge_class,
                            nominal_discharge_current = excluded.nominal_discharge_current,
                            pressure_relief_class = excluded.pressure_relief_class,
                            rated_voltage = excluded.rated_voltage,
                            steep_front_discharge_voltage = excluded.steep_front_discharge_voltage,
                            switching_impulse_discharge_voltage = excluded.switching_impulse_discharge_voltage
                        `,
                        [
                            info.mrid,
                            info.continuous_operating_voltage,
                            info.is_polymer,
                            info.lightning_impulse_discharge_voltage,
                            info.line_discharge_class,
                            info.nominal_discharge_current,
                            info.pressure_relief_class,
                            info.rated_voltage,
                            info.steep_front_discharge_voltage,
                            info.switching_impulse_discharge_voltage
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err: err, message: 'Insert surge arrester info failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: info, message: 'Insert surge arrester info completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err: err, message: 'Insert surge arrester info transaction failed' })
                })
        })
    })
}

// Transaction: Thêm mới surge arrester info
export const insertSurgeArresterInfoTransaction = (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetInfoResult = await AssetInfoFunc.insertAssetInfoTransaction(info, dbsql)
            if (!assetInfoResult.success) {
                return reject({ success: false, message: 'Insert assetInfo failed', err: assetInfoResult.err })
            }
            dbsql.run(
                `INSERT INTO surge_arrester_info(
                    mrid, continuous_operating_voltage, is_polymer, lightning_impulse_discharge_voltage,
                    line_discharge_class, nominal_discharge_current, pressure_relief_class, rated_voltage,
                    steep_front_discharge_voltage, switching_impulse_discharge_voltage
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    continuous_operating_voltage = excluded.continuous_operating_voltage,
                    is_polymer = excluded.is_polymer,
                    lightning_impulse_discharge_voltage = excluded.lightning_impulse_discharge_voltage,
                    line_discharge_class = excluded.line_discharge_class,
                    nominal_discharge_current = excluded.nominal_discharge_current,
                    pressure_relief_class = excluded.pressure_relief_class,
                    rated_voltage = excluded.rated_voltage,
                    steep_front_discharge_voltage = excluded.steep_front_discharge_voltage,
                    switching_impulse_discharge_voltage = excluded.switching_impulse_discharge_voltage
                `,
                [
                    info.mrid,
                    info.continuous_operating_voltage,
                    info.is_polymer,
                    info.lightning_impulse_discharge_voltage,
                    info.line_discharge_class,
                    info.nominal_discharge_current,
                    info.pressure_relief_class,
                    info.rated_voltage,
                    info.steep_front_discharge_voltage,
                    info.switching_impulse_discharge_voltage
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err: err, message: 'Insert surge arrester info transaction failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert surge arrester info transaction completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err: err, message: 'Insert surge arrester info transaction failed' })
        }
    })
}

// Cập nhật surge arrester info
export const updateSurgeArresterInfo = async (mrid, info) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            AssetInfoFunc.updateAssetInfoTransaction(mrid, info, db)
                .then(assetInfoResult => {
                    if (!assetInfoResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Update assetInfo failed', err: assetInfoResult.err })
                    }
                    db.run(
                        `UPDATE surge_arrester_info SET
                            continuous_operating_voltage = ?,
                            is_polymer = ?,
                            lightning_impulse_discharge_voltage = ?,
                            line_discharge_class = ?,
                            nominal_discharge_current = ?,
                            pressure_relief_class = ?,
                            rated_voltage = ?,
                            steep_front_discharge_voltage = ?,
                            switching_impulse_discharge_voltage = ?
                        WHERE mrid = ?`,
                        [
                            info.continuous_operating_voltage,
                            info.is_polymer,
                            info.lightning_impulse_discharge_voltage,
                            info.line_discharge_class,
                            info.nominal_discharge_current,
                            info.pressure_relief_class,
                            info.rated_voltage,
                            info.steep_front_discharge_voltage,
                            info.switching_impulse_discharge_voltage,
                            mrid
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err: err, message: 'Update surge arrester info failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: info, message: 'Update surge arrester info completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err: err, message: 'Update surge arrester info transaction failed' })
                })
        })
    })
}

// Transaction: Cập nhật surge arrester info
export const updateSurgeArresterInfoTransaction = (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetInfoResult = await AssetInfoFunc.updateAssetInfoTransaction(mrid, info, dbsql)
            if (!assetInfoResult.success) {
                return reject({ success: false, message: 'Update assetInfo failed', err: assetInfoResult.err })
            }
            dbsql.run(
                `UPDATE surge_arrester_info SET
                    continuous_operating_voltage = ?,
                    is_polymer = ?,
                    lightning_impulse_discharge_voltage = ?,
                    line_discharge_class = ?,
                    nominal_discharge_current = ?,
                    pressure_relief_class = ?,
                    rated_voltage = ?,
                    steep_front_discharge_voltage = ?,
                    switching_impulse_discharge_voltage = ?
                WHERE mrid = ?`,
                [
                    info.continuous_operating_voltage,
                    info.is_polymer,
                    info.lightning_impulse_discharge_voltage,
                    info.line_discharge_class,
                    info.nominal_discharge_current,
                    info.pressure_relief_class,
                    info.rated_voltage,
                    info.steep_front_discharge_voltage,
                    info.switching_impulse_discharge_voltage,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err: err, message: 'Update surge arrester info transaction failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Update surge arrester info transaction completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err: err, message: 'Update surge arrester info transaction failed' })
        }
    })
}

// Xóa surge arrester info theo mrid
export const deleteSurgeArresterInfoById = async (mrid) => {
    return new Promise((resolve, reject) => {
        AssetInfoFunc.deleteAssetInfoById(mrid)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete assetInfo failed', err: result.err })
                }
                db.run("DELETE FROM surge_arrester_info WHERE mrid=?", [mrid], function (err) {
                    if (err) {
                        return reject({ success: false, err: err, message: 'Delete surge arrester info failed' })
                    }
                    return resolve({ success: true, data: mrid, message: 'Delete surge arrester info completed' })
                })
            })
            .catch(err => {
                return reject({ success: false, err: err, message: 'Delete surge arrester info transaction failed' })
                })
    })
}

// Transaction: Xóa surge arrester info theo mrid
export const deleteSurgeArresterInfoByIdTransaction = (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        AssetInfoFunc.deleteAssetInfoByIdTransaction(mrid, dbsql)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete assetInfo failed', err: result.err })
                }
                dbsql.run("DELETE FROM surge_arrester_info WHERE mrid=?", [mrid], function (err) {
                    if (err) {
                        return reject({ success: false, err: err, message: 'Delete surge arrester info transaction failed' })
                    }
                    return resolve({ success: true, data: mrid, message: 'Delete surge arrester info transaction completed' })
                })
            })
            .catch(err => {
                return reject({ success: false, err: err, message: 'Delete surge arrester info transaction failed' })
            })
    })
}