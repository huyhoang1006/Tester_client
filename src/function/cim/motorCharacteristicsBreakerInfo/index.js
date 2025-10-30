import db from '../../datacontext/index'

// Lấy MotorCharacteristicsBreakerInfo theo mrid
export const getMotorCharacteristicsBreakerInfoById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM motor_characteristics_breaker_info WHERE mrid = ?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get motorCharacteristicsBreakerInfo by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'MotorCharacteristicsBreakerInfo not found' })
                return resolve({ success: true, data: row, message: 'Get motorCharacteristicsBreakerInfo by id completed' })
            }
        )
    })
}

// Lấy danh sách theo assessment_limit_breaker_info_id
export const getMotorCharacteristicsBreakerInfoByAssessmentLimitId = async (assessmentLimitId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM motor_characteristics_breaker_info WHERE assessment_limit_breaker_info_id = ?`,
            [assessmentLimitId],
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get motorCharacteristicsBreakerInfo by assessment_limit_breaker_info_id failed' })
                return resolve({ success: true, data: rows, message: 'Get motorCharacteristicsBreakerInfo by assessment_limit_breaker_info_id completed' })
            }
        )
    })
}

// Thêm mới (transaction)
export const insertMotorCharacteristicsBreakerInfoTransaction = async (info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO motor_characteristics_breaker_info(
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
                if (err) return reject({ success: false, err, message: 'Insert motorCharacteristicsBreakerInfo failed' })
                return resolve({ success: true, data: info, message: 'Insert motorCharacteristicsBreakerInfo completed' })
            }
        )
    })
}

// Cập nhật (transaction)
export const updateMotorCharacteristicsBreakerInfoTransaction = async (mrid, info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE motor_characteristics_breaker_info SET
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
                if (err) return reject({ success: false, err, message: 'Update motorCharacteristicsBreakerInfo failed' })
                return resolve({ success: true, data: info, message: 'Update motorCharacteristicsBreakerInfo completed' })
            }
        )
    })
}

// Xóa (transaction)
export const deleteMotorCharacteristicsBreakerInfoTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `DELETE FROM motor_characteristics_breaker_info WHERE mrid = ?`,
            [mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Delete motorCharacteristicsBreakerInfo failed' })
                return resolve({ success: true, data: mrid, message: 'Delete motorCharacteristicsBreakerInfo completed' })
            }
        )
    })
}