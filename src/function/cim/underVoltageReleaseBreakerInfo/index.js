import db from '../../datacontext/index'

// Lấy UnderVoltageReleaseBreakerInfo theo mrid
export const getUnderVoltageReleaseBreakerInfoById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM under_voltage_release_breaker_info WHERE mrid = ?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get underVoltageReleaseBreakerInfo by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'UnderVoltageReleaseBreakerInfo not found' })
                return resolve({ success: true, data: row, message: 'Get underVoltageReleaseBreakerInfo by id completed' })
            }
        )
    })
}

// Lấy danh sách theo assessment_limit_breaker_info_id
export const getUnderVoltageReleaseBreakerInfoByAssessmentLimitId = async (assessmentLimitId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM under_voltage_release_breaker_info WHERE assessment_limit_breaker_info_id = ?`,
            [assessmentLimitId],
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get underVoltageReleaseBreakerInfo by assessment_limit_breaker_info_id failed' })
                return resolve({ success: true, data: rows, message: 'Get underVoltageReleaseBreakerInfo by assessment_limit_breaker_info_id completed' })
            }
        )
    })
}

// Thêm mới (transaction)
export const insertUnderVoltageReleaseBreakerInfoTransaction = async (info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO under_voltage_release_breaker_info(
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
                if (err) return reject({ success: false, err, message: 'Insert underVoltageReleaseBreakerInfo failed' })
                return resolve({ success: true, data: info, message: 'Insert underVoltageReleaseBreakerInfo completed' })
            }
        )
    })
}

// Cập nhật (transaction)
export const updateUnderVoltageReleaseBreakerInfoTransaction = async (mrid, info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE under_voltage_release_breaker_info SET
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
                if (err) return reject({ success: false, err, message: 'Update underVoltageReleaseBreakerInfo failed' })
                return resolve({ success: true, data: info, message: 'Update underVoltageReleaseBreakerInfo completed' })
            }
        )
    })
}

// Xóa (transaction)
export const deleteUnderVoltageReleaseBreakerInfoTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `DELETE FROM under_voltage_release_breaker_info WHERE mrid = ?`,
            [mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Delete underVoltageReleaseBreakerInfo failed' })
                return resolve({ success: true, data: mrid, message: 'Delete underVoltageReleaseBreakerInfo completed' })
            }
        )
    })
}