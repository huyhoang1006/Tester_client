import db from '../../datacontext/index'

// Lấy tripOperation theo mrid
export const getTripOperationById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM trip_operation WHERE mrid = ?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get tripOperation by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'TripOperation not found' })
                return resolve({ success: true, data: row, message: 'Get tripOperation by id completed' })
            }
        )
    })
}

// Lấy danh sách theo auxiliary_contacts_breaker_info_id
export const getTripOperationByAuxiliaryContactsId = async (auxId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM trip_operation WHERE auxiliary_contacts_breaker_info_id = ?`,
            [auxId],
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get tripOperation by auxiliary id failed' })
                return resolve({ success: true, data: rows, message: 'Get tripOperation by auxiliary id completed' })
            }
        )
    })
}

// Thêm mới tripOperation (transaction)
export const insertTripOperationTransaction = async (info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO trip_operation(
                mrid, auxiliary_contacts_breaker_info_id, parameter_name,
                t_min, t_max, t_ref, t_dev
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                auxiliary_contacts_breaker_info_id = excluded.auxiliary_contacts_breaker_info_id,
                parameter_name = excluded.parameter_name,
                t_min = excluded.t_min,
                t_max = excluded.t_max,
                t_ref = excluded.t_ref,
                t_dev = excluded.t_dev
            `,
            [
                info.mrid,
                info.auxiliary_contacts_breaker_info_id,
                info.parameter_name,
                info.t_min,
                info.t_max,
                info.t_ref,
                info.t_dev
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert tripOperation failed' })
                return resolve({ success: true, data: info, message: 'Insert tripOperation completed' })
            }
        )
    })
}

// Cập nhật tripOperation (transaction)
export const updateTripOperationTransaction = async (mrid, info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE trip_operation SET
                auxiliary_contacts_breaker_info_id = ?,
                parameter_name = ?,
                t_min = ?,
                t_max = ?,
                t_ref = ?,
                t_dev = ?
            WHERE mrid = ?`,
            [
                info.auxiliary_contacts_breaker_info_id,
                info.parameter_name,
                info.t_min,
                info.t_max,
                info.t_ref,
                info.t_dev,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update tripOperation failed' })
                return resolve({ success: true, data: info, message: 'Update tripOperation completed' })
            }
        )
    })
}

// Xóa tripOperation (transaction)
export const deleteTripOperationTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM trip_operation WHERE mrid = ?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete tripOperation failed' })
            return resolve({ success: true, data: mrid, message: 'Delete tripOperation completed' })
        })
    })
}