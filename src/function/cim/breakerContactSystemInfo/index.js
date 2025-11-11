// ...existing code...
import db from '../../datacontext/index'

// Lấy breakerContactSystemInfo theo mrid
export const getBreakerContactSystemInfoById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM breaker_contact_system_info WHERE mrid = ?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get breakerContactSystemInfo by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'BreakerContactSystemInfo not found' })
                return resolve({ success: true, data: row, message: 'Get breakerContactSystemInfo by id completed' })
            }
        )
    })
}

// Lấy các bản ghi theo breaker_info_id
export const getBreakerContactSystemInfoByBreakerInfoId = async (breakerInfoId) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM breaker_contact_system_info WHERE breaker_info_id = ?`,
            [breakerInfoId],
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get breakerContactSystemInfo by breaker_info_id failed' })
                return resolve({ success: true, data: rows, message: 'Get breakerContactSystemInfo by breaker_info_id completed' })
            }
        )
    })
}

// Thêm mới breakerContactSystemInfo (transaction)
export const insertBreakerContactSystemInfoTransaction = async (info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO breaker_contact_system_info(
                mrid, breaker_info_id, nominal_total_travel, damping_time, nozzle_length
            ) VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                breaker_info_id = excluded.breaker_info_id,
                nominal_total_travel = excluded.nominal_total_travel,
                damping_time = excluded.damping_time,
                nozzle_length = excluded.nozzle_length
            `,
            [
                info.mrid,
                info.breaker_info_id,
                info.nominal_total_travel,
                info.damping_time,
                info.nozzle_length
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert breakerContactSystemInfo failed' })
                return resolve({ success: true, data: info, message: 'Insert breakerContactSystemInfo completed' })
            }
        )
    })
}

// Cập nhật breakerContactSystemInfo (transaction)
export const updateBreakerContactSystemInfoTransaction = async (mrid, info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE breaker_contact_system_info SET
                breaker_info_id = ?,
                nominal_total_travel = ?,
                damping_time = ?,
                nozzle_length = ?
            WHERE mrid = ?`,
            [
                info.breaker_info_id,
                info.nominal_total_travel,
                info.damping_time,
                info.nozzle_length,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update breakerContactSystemInfo failed' })
                return resolve({ success: true, data: info, message: 'Update breakerContactSystemInfo completed' })
            }
        )
    })
}

// Xóa breakerContactSystemInfo (transaction)
export const deleteBreakerContactSystemInfoTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM breaker_contact_system_info WHERE mrid = ?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete breakerContactSystemInfo failed' })
            return resolve({ success: true, data: mrid, message: 'Delete breakerContactSystemInfo completed' })
        })
    })
}
// ...existing code...