import db from '../../datacontext/index'

// Lấy pickupVoltageBreakerInfo theo mrid
export const getPickupVoltageBreakerInfoById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM pickup_voltage_breaker_info WHERE mrid = ?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get pickupVoltageBreakerInfo by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'PickupVoltageBreakerInfo not found' })
                return resolve({ success: true, data: row, message: 'Get pickupVoltageBreakerInfo by id completed' })
            }
        )
    })
}

// Lấy danh sách theo assessment_limit_breaker_info_id
export const getPickupVoltageBreakerInfoByAssessmentLimitId = async (assessmentLimitId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM pickup_voltage_breaker_info WHERE assessment_limit_breaker_info_id = ?`,
            [assessmentLimitId],
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get pickupVoltageBreakerInfo by assessment_limit_breaker_info_id failed' })
                return resolve({ success: true, data: rows, message: 'Get pickupVoltageBreakerInfo by assessment_limit_breaker_info_id completed' })
            }
        )
    })
}

// Thêm mới pickupVoltageBreakerInfo (transaction)
export const insertPickupVoltageBreakerInfoTransaction = async (info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO pickup_voltage_breaker_info(
                mrid, assessment_limit_breaker_info_id, parameter_name, v_min, v_max, v_ref, v_dev
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                assessment_limit_breaker_info_id = excluded.assessment_limit_breaker_info_id,
                parameter_name = excluded.parameter_name,
                v_min = excluded.v_min,
                v_max = excluded.v_max,
                v_ref = excluded.v_ref,
                v_dev = excluded.v_dev
            `,
            [
                info.mrid,
                info.assessment_limit_breaker_info_id,
                info.parameter_name,
                info.v_min,
                info.v_max,
                info.v_ref,
                info.v_dev
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert pickupVoltageBreakerInfo failed' })
                return resolve({ success: true, data: info, message: 'Insert pickupVoltageBreakerInfo completed' })
            }
        )
    })
}

// Cập nhật pickupVoltageBreakerInfo (transaction)
export const updatePickupVoltageBreakerInfoTransaction = async (mrid, info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE pickup_voltage_breaker_info SET
                assessment_limit_breaker_info_id = ?,
                parameter_name = ?,
                v_min = ?,
                v_max = ?,
                v_ref = ?,
                v_dev = ?
            WHERE mrid = ?`,
            [
                info.assessment_limit_breaker_info_id,
                info.parameter_name,
                info.v_min,
                info.v_max,
                info.v_ref,
                info.v_dev,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update pickupVoltageBreakerInfo failed' })
                return resolve({ success: true, data: info, message: 'Update pickupVoltageBreakerInfo completed' })
            }
        )
    })
}

// Xóa pickupVoltageBreakerInfo (transaction)
export const deletePickupVoltageBreakerInfoTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM pickup_voltage_breaker_info WHERE mrid = ?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete pickupVoltageBreakerInfo failed' })
            return resolve({ success: true, data: mrid, message: 'Delete pickupVoltageBreakerInfo completed' })
        })
    })
}