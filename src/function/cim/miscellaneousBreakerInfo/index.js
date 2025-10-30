import db from '../../datacontext/index'

// Lấy miscellaneousBreakerInfo theo mrid
export const getMiscellaneousBreakerInfoById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM miscellaneous_breaker_info WHERE mrid = ?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get miscellaneousBreakerInfo by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'MiscellaneousBreakerInfo not found' })
                return resolve({ success: true, data: row, message: 'Get miscellaneousBreakerInfo by id completed' })
            }
        )
    })
}

// Lấy danh sách theo assessment_limit_breaker_info_id
export const getMiscellaneousBreakerInfoByAssessmentLimitId = async (assessmentLimitId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM miscellaneous_breaker_info WHERE assessment_limit_breaker_info_id = ?`,
            [assessmentLimitId],
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get miscellaneousBreakerInfo by assessment_limit_breaker_info_id failed' })
                return resolve({ success: true, data: rows, message: 'Get miscellaneousBreakerInfo by assessment_limit_breaker_info_id completed' })
            }
        )
    })
}

// Thêm mới miscellaneousBreakerInfo (transaction)
export const insertMiscellaneousBreakerInfoTransaction = async (info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO miscellaneous_breaker_info(
                mrid, assessment_limit_breaker_info_id, parameter_name, min, max, ref, dev
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                assessment_limit_breaker_info_id = excluded.assessment_limit_breaker_info_id,
                parameter_name = excluded.parameter_name,
                min = excluded.min,
                max = excluded.max,
                ref = excluded.ref,
                dev = excluded.dev
            `,
            [
                info.mrid,
                info.assessment_limit_breaker_info_id,
                info.parameter_name,
                info.min,
                info.max,
                info.ref,
                info.dev
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert miscellaneousBreakerInfo failed' })
                return resolve({ success: true, data: info, message: 'Insert miscellaneousBreakerInfo completed' })
            }
        )
    })
}

// Cập nhật miscellaneousBreakerInfo (transaction)
export const updateMiscellaneousBreakerInfoTransaction = async (mrid, info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE miscellaneous_breaker_info SET
                assessment_limit_breaker_info_id = ?,
                parameter_name = ?,
                min = ?,
                max = ?,
                ref = ?,
                dev = ?
            WHERE mrid = ?`,
            [
                info.assessment_limit_breaker_info_id,
                info.parameter_name,
                info.min,
                info.max,
                info.ref,
                info.dev,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update miscellaneousBreakerInfo failed' })
                return resolve({ success: true, data: info, message: 'Update miscellaneousBreakerInfo completed' })
            }
        )
    })
}

// Xóa miscellaneousBreakerInfo (transaction)
export const deleteMiscellaneousBreakerInfoTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM miscellaneous_breaker_info WHERE mrid = ?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete miscellaneousBreakerInfo failed' })
            return resolve({ success: true, data: mrid, message: 'Delete miscellaneousBreakerInfo completed' })
        })
    })
}