import db from '../../datacontext/index'
import * as powerSystemResourceFunc from '../powerSystemResource/index.js'

// Thêm mới ConnectivityNodeContainer (gồm cả insert PowerSystemResource)
export const insertConnectivityNodeContainer = async (cnc) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            powerSystemResourceFunc.insertPowerSystemResourceTransaction(cnc, db)
                .then(result => {
                    if (!result.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Insert PowerSystemResource failed', err: result.err })
                    }
                    db.run(
                        `INSERT INTO connectivity_node_container(mrid)
                         VALUES (?)
                         ON CONFLICT(mrid) DO NOTHING`,
                        [cnc.mrid],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Insert ConnectivityNodeContainer failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: cnc, message: 'Insert ConnectivityNodeContainer completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Insert ConnectivityNodeContainer transaction failed' })
                })
        })
    })
}

// Thêm mới ConnectivityNodeContainer trong transaction (cho lớp cha gọi)
export const insertConnectivityNodeContainerTransaction = async (cnc, dbsql) => {
    return new Promise((resolve, reject) => {
        powerSystemResourceFunc.insertPowerSystemResourceTransaction(cnc, dbsql)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Insert PowerSystemResource failed', err: result.err })
                }
                dbsql.run(
                    `INSERT INTO connectivity_node_container(mrid)
                     VALUES (?)
                     ON CONFLICT(mrid) DO NOTHING`,
                    [cnc.mrid],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Insert ConnectivityNodeContainer failed' })
                        }
                        return resolve({ success: true, data: cnc, message: 'Insert ConnectivityNodeContainer completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Insert ConnectivityNodeContainer transaction failed' })
            })
    })
}

// Lấy ConnectivityNodeContainer theo mrid (gộp cả cha)
export const getConnectivityNodeContainerById = async (mrid) => {
    try {
        const psrResult = await powerSystemResourceFunc.getPowerSystemResourceById(mrid)
        if (!psrResult.success) {
            return { success: false, data: null, message: 'PowerSystemResource not found' }
        }
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM connectivity_node_container WHERE mrid = ?", [mrid], (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get ConnectivityNodeContainer failed' })
                if (!row) return resolve({ success: false, data: null, message: 'ConnectivityNodeContainer not found' })
                const data = { ...psrResult.data, ...row }
                return resolve({ success: true, data : data, message: 'Get ConnectivityNodeContainer completed' })
            })
        })
    } catch (err) {
        return { success: false, err, message: 'Get ConnectivityNodeContainer failed' }
    }
}

// Xóa ConnectivityNodeContainer (gồm cả PowerSystemResource, dùng cascade)
export const deleteConnectivityNodeContainerById = async (mrid) => {
    return new Promise((resolve, reject) => {
        powerSystemResourceFunc.deletePowerSystemResourceByIdTransaction(mrid, db)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete PowerSystemResource failed', err: result.err })
                }
                return resolve({ success: true, message: 'Delete ConnectivityNodeContainer (and PowerSystemResource) completed' })
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Delete ConnectivityNodeContainer transaction failed' })
            })
    })
}

// Xóa ConnectivityNodeContainer trong transaction (cho lớp cha gọi)
export const deleteConnectivityNodeContainerByIdTransaction = async (mrid, dbsql) => {
    return powerSystemResourceFunc.deletePowerSystemResourceByIdTransaction(mrid, dbsql)
}

// Cập nhật ConnectivityNodeContainer (gồm cả PowerSystemResource)
export const updateConnectivityNodeContainerById = async (mrid, cnc) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            powerSystemResourceFunc.updatePowerSystemResourceTransaction(mrid, cnc, db)
                .then(result => {
                    if (!result.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Update PowerSystemResource failed', err: result.err })
                    }
                    db.run(
                        `UPDATE connectivity_node_container SET mrid = ? WHERE mrid = ?`,
                        [cnc.mrid, mrid],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Update ConnectivityNodeContainer failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: cnc, message: 'Update ConnectivityNodeContainer completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Update ConnectivityNodeContainer transaction failed' })
                })
        })
    })
}

// Cập nhật ConnectivityNodeContainer trong transaction (cho lớp cha gọi)
export const updateConnectivityNodeContainerByIdTransaction = async (mrid, cnc, dbsql) => {
    return new Promise((resolve, reject) => {
        powerSystemResourceFunc.updatePowerSystemResourceTransaction(mrid, cnc, dbsql)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Update PowerSystemResource failed', err: result.err })
                }
                dbsql.run(
                    `UPDATE connectivity_node_container SET mrid = ? WHERE mrid = ?`,
                    [cnc.mrid, mrid],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Update ConnectivityNodeContainer failed' })
                        }
                        return resolve({ success: true, data: cnc, message: 'Update ConnectivityNodeContainer completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Update ConnectivityNodeContainer transaction failed' })
            })
    })
}