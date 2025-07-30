import db from '../../datacontext/index'
import * as identifiedObjectFunc from '../identifiedObject/index.js'

// Thêm mới BaseVoltage (gồm cả insert identified_object)
export const insertBaseVoltage = async (baseVoltage) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            identifiedObjectFunc.insertIdentifiedObjectTransaction(baseVoltage, db)
                .then(identifiedResult => {
                    if (!identifiedResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
                    }
                    db.run(
                        `INSERT INTO base_voltage(
                            mrid,
                            nominal_voltage
                        ) VALUES (?, ?)
                        ON CONFLICT(mrid) DO UPDATE SET
                            nominal_voltage = excluded.nominal_voltage`,
                        [
                            baseVoltage.mrid,
                            baseVoltage.nominal_voltage
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Insert baseVoltage failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: baseVoltage, message: 'Insert baseVoltage completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Insert baseVoltage transaction failed' })
                })
        })
    })
}

// Thêm mới BaseVoltage trong transaction (cho lớp cha gọi)
export const insertBaseVoltageTransaction = async (baseVoltage, dbsql) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.insertIdentifiedObjectTransaction(baseVoltage, dbsql)
            .then(identifiedResult => {
                if (!identifiedResult.success) {
                    return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
                }
                dbsql.run(
                    `INSERT INTO base_voltage(
                        mrid,
                        nominal_voltage
                    ) VALUES (?, ?)
                    ON CONFLICT(mrid) DO UPDATE SET
                        nominal_voltage = excluded.nominal_voltage`,
                    [
                        baseVoltage.mrid,
                        baseVoltage.nominal_voltage
                    ],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Insert baseVoltage failed' })
                        }
                        return resolve({ success: true, data: baseVoltage, message: 'Insert baseVoltage completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Insert baseVoltage transaction failed' })
            })
    })
}

// Lấy BaseVoltage theo mrid (gộp cả cha)
export const getBaseVoltageById = async (mrid) => {
    try {
        const identifiedResult = await identifiedObjectFunc.getIdentifiedObjectById(mrid)
        if (!identifiedResult.success) {
            return { success: false, data: null, message: 'Identified object not found' }
        }
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM base_voltage WHERE mrid = ?", [mrid], (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get baseVoltage failed' })
                if (!row) return resolve({ success: false, data: null, message: 'BaseVoltage not found' })
                const data = { ...identifiedResult.data, ...row }
                return resolve({ success: true, data : data, message: 'Get baseVoltage completed' })
            })
        })
    } catch (err) {
        return { success: false, err, message: 'Get baseVoltage failed' }
    }
}

// Cập nhật BaseVoltage (gồm cả identified_object)
export const updateBaseVoltageById = async (mrid, baseVoltage) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, baseVoltage, db)
                .then(identifiedResult => {
                    if (!identifiedResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
                    }
                    db.run(
                        `UPDATE base_voltage SET
                            nominal_voltage = ?
                        WHERE mrid = ?`,
                        [
                            baseVoltage.nominal_voltage,
                            mrid
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Update baseVoltage failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: baseVoltage, message: 'Update baseVoltage completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Update baseVoltage transaction failed' })
                })
        })
    })
}

// Cập nhật BaseVoltage trong transaction (cho lớp cha gọi)
export const updateBaseVoltageByIdTransaction = async (mrid, baseVoltage, dbsql) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, baseVoltage, dbsql)
            .then(identifiedResult => {
                if (!identifiedResult.success) {
                    return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
                }
                dbsql.run(
                    `UPDATE base_voltage SET
                        nominal_voltage = ?
                    WHERE mrid = ?`,
                    [
                        baseVoltage.nominal_voltage,
                        mrid
                    ],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Update baseVoltage failed' })
                        }
                        return resolve({ success: true, data: baseVoltage, message: 'Update baseVoltage completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Update baseVoltage transaction failed' })
            })
    })
}

// Xóa BaseVoltage (gồm cả identified_object, dùng cascade)
export const deleteBaseVoltageById = async (mrid) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, db)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete identified object failed', err: result.err })
                }
                return resolve({ success: true, message: 'Delete baseVoltage (and identified object) completed' })
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Delete baseVoltage transaction failed' })
            })
    })
}

// Xóa BaseVoltage trong transaction (cho lớp cha gọi)
export const deleteBaseVoltageByIdTransaction = async (mrid, dbsql) => {
    return identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, dbsql)
}

export const getBaseVoltageByLocationIdTransaction = async (locationId, dbsql) => {
    try {
        return new Promise((resolve, reject) => {
            dbsql.all("SELECT * FROM base_voltage WHERE location = ?", [locationId], (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get baseVoltage failed' })
                if (!rows || rows.length === 0) return resolve({ success: false, data: null, message: 'BaseVoltage not found' })
                const data = rows.map(row => ({ ...row }))
                return resolve({ success: true, data: data, message: 'Get baseVoltage completed' })
            })
        })
    } catch (err) {
        return { success: false, err, message: 'Get baseVoltage failed' }
    }
}