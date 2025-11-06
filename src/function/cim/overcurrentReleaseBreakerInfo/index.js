import db from '../../datacontext/index'

// Lấy OvercurrentReleaseBreakerInfo theo mrid
export const getOvercurrentReleaseBreakerInfoById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM overcurrent_release_breaker_info WHERE mrid = ?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get overcurrentReleaseBreakerInfo by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'OvercurrentReleaseBreakerInfo not found' })
                return resolve({ success: true, data: row, message: 'Get overcurrentReleaseBreakerInfo by id completed' })
            }
        )
    })
}

// Lấy danh sách theo assessment_limit_breaker_info_id
export const getOvercurrentReleaseBreakerInfoByAssessmentLimitId = async (assessmentLimitId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM overcurrent_release_breaker_info WHERE assessment_limit_breaker_info_id = ?`,
            [assessmentLimitId],
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get overcurrentReleaseBreakerInfo by assessment_limit_breaker_info_id failed' })
                return resolve({ success: true, data: rows, message: 'Get overcurrentReleaseBreakerInfo by assessment_limit_breaker_info_id completed' })
            }
        )
    })
}

// Thêm mới (transaction)
export const insertOvercurrentReleaseBreakerInfoTransaction = async (info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO overcurrent_release_breaker_info(
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
                if (err) return reject({ success: false, err, message: 'Insert overcurrentReleaseBreakerInfo failed' })
                return resolve({ success: true, data: info, message: 'Insert overcurrentReleaseBreakerInfo completed' })
            }
        )
    })
}

// Cập nhật (transaction)
export const updateOvercurrentReleaseBreakerInfoTransaction = async (mrid, info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE overcurrent_release_breaker_info SET
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
                if (err) return reject({ success: false, err, message: 'Update overcurrentReleaseBreakerInfo failed' })
                return resolve({ success: true, data: info, message: 'Update overcurrentReleaseBreakerInfo completed' })
            }
        )
    })
}

// Xóa (transaction)
export const deleteOvercurrentReleaseBreakerInfoTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `DELETE FROM overcurrent_release_breaker_info WHERE mrid = ?`,
            [mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Delete overcurrentReleaseBreakerInfo failed' })
                return resolve({ success: true, data: mrid, message: 'Delete overcurrentReleaseBreakerInfo completed' })
            }
        )
    })
}