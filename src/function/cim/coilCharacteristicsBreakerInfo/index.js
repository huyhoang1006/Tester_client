import db from '../../datacontext/index'

// Lấy coilCharacteristicsBreakerInfo theo mrid
export const getCoilCharacteristicsBreakerInfoById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM coil_characteristics_breaker_info WHERE mrid = ?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get coilCharacteristicsBreakerInfo by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'CoilCharacteristicsBreakerInfo not found' })
                return resolve({ success: true, data: row, message: 'Get coilCharacteristicsBreakerInfo by id completed' })
            }
        )
    })
}

// Lấy danh sách theo assessment_limit_breaker_info_id
export const getCoilCharacteristicsBreakerInfoByAssessmentLimitId = async (assessmentLimitId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM coil_characteristics_breaker_info WHERE assessment_limit_breaker_info_id = ?`,
            [assessmentLimitId],
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get coilCharacteristicsBreakerInfo by assessment_limit_breaker_info_id failed' })
                return resolve({ success: true, data: rows, message: 'Get coilCharacteristicsBreakerInfo by assessment_limit_breaker_info_id completed' })
            }
        )
    })
}

// Thêm mới (transaction)
export const insertCoilCharacteristicsBreakerInfoTransaction = async (info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO coil_characteristics_breaker_info(
                mrid, assessment_limit_breaker_info_id, parameter_name, min, max, ref, dev_negative, dev_positive
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                assessment_limit_breaker_info_id = excluded.assessment_limit_breaker_info_id,
                parameter_name = excluded.parameter_name,
                min = excluded.min,
                max = excluded.max,
                ref = excluded.ref,
                dev_negative = excluded.dev_negative,
                dev_positive = excluded.dev_positive
            `,
            [
                info.mrid,
                info.assessment_limit_breaker_info_id,
                info.parameter_name,
                info.min,
                info.max,
                info.ref,
                info.dev_negative,
                info.dev_positive
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert coilCharacteristicsBreakerInfo failed' })
                return resolve({ success: true, data: info, message: 'Insert coilCharacteristicsBreakerInfo completed' })
            }
        )
    })
}

// Cập nhật (transaction)
export const updateCoilCharacteristicsBreakerInfoTransaction = async (mrid, info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE coil_characteristics_breaker_info SET
                assessment_limit_breaker_info_id = ?,
                parameter_name = ?,
                min = ?,
                max = ?,
                ref = ?,
                dev_negative = ?,
                dev_positive = ?
            WHERE mrid = ?`,
            [
                info.assessment_limit_breaker_info_id,
                info.parameter_name,
                info.min,
                info.max,
                info.ref,
                info.dev_negative,
                info.dev_positive,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update coilCharacteristicsBreakerInfo failed' })
                return resolve({ success: true, data: info, message: 'Update coilCharacteristicsBreakerInfo completed' })
            }
        )
    })
}

// Xóa (transaction)
export const deleteCoilCharacteristicsBreakerInfoTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `DELETE FROM coil_characteristics_breaker_info WHERE mrid = ?`,
            [mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Delete coilCharacteristicsBreakerInfo failed' })
                return resolve({ success: true, data: mrid, message: 'Delete coilCharacteristicsBreakerInfo completed' })
            }
        )
    })
}