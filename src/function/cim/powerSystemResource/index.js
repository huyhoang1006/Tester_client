import db from '../../datacontext/index'
import * as identifiedObjectFunc from '../identifiedObject/index.js'

// Thêm mới PowerSystemResource (gồm cả insert identified_object)
export const insertPowerSystemResource = async (psr) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            identifiedObjectFunc.insertIdentifiedObjectTransaction(psr, db)
                .then(identifiedResult => {
                    if (!identifiedResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
                    }
                    db.run(
                        `INSERT INTO power_system_resource(
                            mrid,
                            psr_type_id,
                            location
                        ) VALUES (?, ?, ?)
                        ON CONFLICT(mrid) DO UPDATE SET
                            psr_type_id = excluded.psr_type_id,
                            location = excluded.location`,
                        [
                            psr.mrid,
                            psr.psr_type_id,
                            psr.location
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Insert powerSystemResource failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: psr, message: 'Insert powerSystemResource completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Insert powerSystemResource transaction failed' })
                })
        })
    })
}

// Thêm mới PowerSystemResource trong transaction (cho lớp cha gọi)
export const insertPowerSystemResourceTransaction = async (psr, dbsql) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.insertIdentifiedObjectTransaction(psr, dbsql)
            .then(identifiedResult => {
                if (!identifiedResult.success) {
                    return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
                }
                dbsql.run(
                    `INSERT INTO power_system_resource(
                        mrid,
                        psr_type_id,
                        location
                    ) VALUES (?, ?, ?)
                    ON CONFLICT(mrid) DO UPDATE SET
                        psr_type_id = excluded.psr_type_id,
                        location = excluded.location`,
                    [
                        psr.mrid,
                        psr.psr_type_id,
                        psr.location
                    ],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Insert powerSystemResource failed' })
                        }
                        return resolve({ success: true, data: psr, message: 'Insert powerSystemResource completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Insert powerSystemResource transaction failed' })
            })
    })
}

// Lấy PowerSystemResource theo mrid (gộp cả cha)
export const getPowerSystemResourceById = async (mrid) => {
    try {
        const identifiedResult = await identifiedObjectFunc.getIdentifiedObjectById(mrid)
        if (!identifiedResult.success) {
            return { success: false, data: null, message: 'Identified object not found' }
        }
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM power_system_resource WHERE mrid = ?", [mrid], (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get powerSystemResource failed' })
                if (!row) return resolve({ success: false, data: null, message: 'PowerSystemResource not found' })
                const data = { ...identifiedResult.data, ...row }
                return resolve({ success: true, data : data, message: 'Get powerSystemResource completed' })
            })
        })
    } catch (err) {
        return { success: false, err, message: 'Get powerSystemResource failed' }
    }
}

// Cập nhật PowerSystemResource (gồm cả identified_object)
export const updatePowerSystemResourceById = async (mrid, psr) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, psr, db)
                .then(identifiedResult => {
                    if (!identifiedResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
                    }
                    db.run(
                        `UPDATE power_system_resource SET
                            psr_type_id = ?,
                            location = ?
                        WHERE mrid = ?`,
                        [
                            psr.psr_type_id,
                            psr.location,
                            mrid
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Update powerSystemResource failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: psr, message: 'Update powerSystemResource completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Update powerSystemResource transaction failed' })
                })
        })
    })
}

// Cập nhật PowerSystemResource trong transaction (cho lớp cha gọi)
export const updatePowerSystemResourceByIdTransaction = async (mrid, psr, dbsql) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, psr, dbsql)
            .then(identifiedResult => {
                if (!identifiedResult.success) {
                    return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
                }
                dbsql.run(
                    `UPDATE power_system_resource SET
                        psr_type_id = ?,
                        location = ?
                    WHERE mrid = ?`,
                    [
                        psr.psr_type_id,
                        psr.location,
                        mrid
                    ],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Update powerSystemResource failed' })
                        }
                        return resolve({ success: true, data: psr, message: 'Update powerSystemResource completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Update powerSystemResource transaction failed' })
            })
    })
}

// Xóa PowerSystemResource (gồm cả identified_object, dùng cascade)
export const deletePowerSystemResourceById = async (mrid) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, db)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete identified object failed', err: result.err })
                }
                return resolve({ success: true, message: 'Delete powerSystemResource (and identified object) completed' })
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Delete powerSystemResource transaction failed' })
            })
    })
}

// Xóa PowerSystemResource trong transaction (cho lớp cha gọi)
export const deletePowerSystemResourceByIdTransaction = async (mrid, dbsql) => {
    return identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, dbsql)
}