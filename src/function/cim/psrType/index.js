import db from '../../datacontext/index'
import * as identifiedObjectFunc from '../identifiedObject/index.js'

// Thêm mới PsrType (gồm cả insert identified_object)
export const insertPsrType = async (psrType) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            identifiedObjectFunc.insertIdentifiedObjectTransaction(psrType, db)
                .then(identifiedResult => {
                    if (!identifiedResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
                    }
                    db.run(
                        `INSERT INTO psr_type(mrid) VALUES (?)
                         ON CONFLICT(mrid) DO NOTHING`,
                        [psrType.mrid],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Insert psrType failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: psrType, message: 'Insert psrType completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Insert psrType transaction failed' })
                })
        })
    })
}

// Thêm mới PsrType trong transaction (cho lớp cha gọi)
export const insertPsrTypeTransaction = async (psrType, dbsql) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.insertIdentifiedObjectTransaction(psrType, dbsql)
            .then(identifiedResult => {
                if (!identifiedResult.success) {
                    return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
                }
                dbsql.run(
                    `INSERT INTO psr_type(mrid) VALUES (?)
                     ON CONFLICT(mrid) DO NOTHING`,
                    [psrType.mrid],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Insert psrType failed' })
                        }
                        return resolve({ success: true, data: psrType, message: 'Insert psrType completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Insert psrType transaction failed' })
            })
    })
}

// Lấy PsrType theo mrid (gộp cả cha)
export const getPsrTypeById = async (mrid) => {
    try {
        const identifiedResult = await identifiedObjectFunc.getIdentifiedObjectById(mrid)
        if (!identifiedResult.success) {
            return { success: false, data: null, message: 'Identified object not found' }
        }
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM psr_type WHERE mrid = ?", [mrid], (err, row) => {
                if (err) return reject
                if (!row) return resolve({ success: false, data: null, message: 'PsrType not found' })
                const data = { ...identifiedResult.data, ...row }
                return resolve({ success: true, data : data, message: 'Get psrType completed' })
            })
        })
    } catch (err) {
        return { success: false, err, message: 'Get psrType failed' }
    }
}

// Cập nhật PsrType (gồm cả identified_object)
export const updatePsrTypeById = async (mrid, psrType) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, psrType, db)
                .then(identifiedResult => {
                    if (!identifiedResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
                    }
                    db.run(
                        `UPDATE psr_type SET
                            -- Nếu có thêm trường khác thì cập nhật ở đây, hiện tại chỉ có mrid nên không cần cập nhật gì thêm
                            mrid = ?
                         WHERE mrid = ?`,
                        [
                            psrType.mrid,
                            mrid
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Update psrType failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: psrType, message: 'Update psrType completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Update psrType transaction failed' })
                })
        })
    })
}

// Cập nhật PsrType trong transaction (cho lớp cha gọi)
export const updatePsrTypeByIdTransaction = async (mrid, psrType, dbsql) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, psrType, dbsql)
            .then(identifiedResult => {
                if (!identifiedResult.success) {
                    return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
                }
                dbsql.run(
                    `UPDATE psr_type SET
                        mrid = ?
                     WHERE mrid = ?`,
                    [
                        psrType.mrid,
                        mrid
                    ],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Update psrType failed' })
                        }
                        return resolve({ success: true, data: psrType, message: 'Update psrType completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Update psrType transaction failed' })
            })
    })
}

// Xóa PsrType (gồm cả identified_object, dùng cascade)
export const deletePsrTypeById = async (mrid) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, db)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete identified object failed', err: result.err })
                }
                return resolve({ success: true, message: 'Delete psrType (and identified object) completed' })
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Delete psrType transaction failed' })
            })
    })
}

// Xóa PsrType trong transaction (cho lớp cha gọi)
export const deletePsrTypeByIdTransaction = async (mrid, dbsql) => {
    return identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, dbsql)
}