import db from '../../datacontext/index'
import * as identifiedObjectFunc from '../identifiedObject/index.js'

// Thêm mới ActivityRecord (gồm cả insert identified_object)
export const insertActivityRecord = async (activity) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            identifiedObjectFunc.insertIdentifiedObjectTransaction(activity, db)
                .then(identifiedResult => {
                    if (!identifiedResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
                    }
                    db.run(
                        `INSERT INTO activity_record(
                            mrid, status, created_date_time, reason, severity, type, asset, provider, cost
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(mrid) DO UPDATE SET
                            status = excluded.status,
                            created_date_time = excluded.created_date_time,
                            reason = excluded.reason,
                            severity = excluded.severity,
                            type = excluded.type,
                            asset = excluded.asset,
                            provider = excluded.provider,
                            cost = excluded.cost`,
                        [
                            activity.mrid,
                            activity.status,
                            activity.created_date_time,
                            activity.reason,
                            activity.severity,
                            activity.type,
                            activity.asset,
                            activity.provider,
                            activity.cost
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Insert activity record failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: activity, message: 'Insert activity record completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Insert activity record transaction failed' })
                })
        })
    })
}

// Thêm mới ActivityRecord trong transaction (cho lớp cha gọi)
export const insertActivityRecordTransaction = async (activity, dbsql) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.insertIdentifiedObjectTransaction(activity, dbsql)
            .then(identifiedResult => {
                if (!identifiedResult.success) {
                    return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
                }
                dbsql.run(
                    `INSERT INTO activity_record(
                        mrid, status, created_date_time, reason, severity, type, asset, provider, cost
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(mrid) DO UPDATE SET
                        status = excluded.status,
                        created_date_time = excluded.created_date_time,
                        reason = excluded.reason,
                        severity = excluded.severity,
                        type = excluded.type,
                        asset = excluded.asset,
                        provider = excluded.provider,
                        cost = excluded.cost`,
                    [
                        activity.mrid,
                        activity.status,
                        activity.created_date_time,
                        activity.reason,
                        activity.severity,
                        activity.type,
                        activity.asset,
                        activity.provider,
                        activity.cost
                    ],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Insert activity record failed' })
                        }
                        return resolve({ success: true, data: activity, message: 'Insert activity record completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Insert activity record transaction failed' })
            })
    })
}

// Lấy ActivityRecord theo mrid (gộp cả cha)
export const getActivityRecordById = async (mrid) => {
    try {
        const identifiedResult = await identifiedObjectFunc.getIdentifiedObjectById(mrid)
        if (!identifiedResult.success) {
            return { success: false, data: null, message: 'Identified object not found' }
        }
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM activity_record WHERE mrid = ?", [mrid], (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get activity record failed' })
                if (!row) return resolve({ success: false, data: null, message: 'Activity record not found' })
                const data = { ...identifiedResult.data, ...row }
                return resolve({ success: true, data: data, message: 'Get activity record completed' })
            })
        })
    } catch (err) {
        return { success: false, err, message: 'Get activity record failed' }
    }
}

// Lấy các activity_record theo asset (dùng cho Repair History: lọc type='Repair')
export const getActivityRecordByAssetId = async (assetId, type = 'Repair') => {
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT * FROM activity_record WHERE asset = ? AND type = ?",
            [assetId, type],
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get activity record by asset failed' })
                if (!rows || rows.length === 0) return resolve({ success: false, data: null, message: 'Activity record not found' })
                return resolve({ success: true, data: rows, message: 'Get activity record by asset completed' })
            }
        )
    })
}

// Cập nhật ActivityRecord (gồm cả identified_object)
export const updateActivityRecordById = async (mrid, activity) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, activity, db)
                .then(identifiedResult => {
                    if (!identifiedResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
                    }
                    db.run(
                        `UPDATE activity_record SET
                            status = ?,
                            created_date_time = ?,
                            reason = ?,
                            severity = ?,
                            type = ?,
                            asset = ?,
                            provider = ?,
                            cost = ?
                         WHERE mrid = ?`,
                        [
                            activity.status,
                            activity.created_date_time,
                            activity.reason,
                            activity.severity,
                            activity.type,
                            activity.asset,
                            activity.provider,
                            activity.cost,
                            mrid
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Update activity record failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: activity, message: 'Update activity record completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Update activity record transaction failed' })
                })
        })
    })
}

// Cập nhật ActivityRecord trong transaction (cho lớp cha gọi)
export const updateActivityRecordByIdTransaction = async (mrid, activity, dbsql) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, activity, dbsql)
            .then(identifiedResult => {
                if (!identifiedResult.success) {
                    return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
                }
                dbsql.run(
                    `UPDATE activity_record SET
                        status = ?,
                        created_date_time = ?,
                        reason = ?,
                        severity = ?,
                        type = ?,
                        asset = ?,
                        provider = ?,
                        cost = ?
                     WHERE mrid = ?`,
                    [
                        activity.status,
                        activity.created_date_time,
                        activity.reason,
                        activity.severity,
                        activity.type,
                        activity.asset,
                        activity.provider,
                        activity.cost,
                        mrid
                    ],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Update activity record failed' })
                        }
                        return resolve({ success: true, data: activity, message: 'Update activity record completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Update activity record transaction failed' })
            })
    })
}

// Xóa ActivityRecord (gồm cả identified_object, dùng cascade)
export const deleteActivityRecordById = async (mrid) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, db)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete identified object failed', err: result.err })
                }
                return resolve({ success: true, message: 'Delete activity record (and identified object) completed' })
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Delete activity record transaction failed' })
            })
    })
}

// Xóa ActivityRecord trong transaction (cho lớp cha gọi)
export const deleteActivityRecordByIdTransaction = async (mrid, dbsql) => {
    return identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, dbsql)
}