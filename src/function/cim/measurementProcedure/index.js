import db from '../../datacontext/index'

// Lấy measurementProcedure theo mrid
export const getMeasurementProcedureById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM measurement_procedure WHERE mrid=?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get measurementProcedure by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'MeasurementProcedure not found' })
                return resolve({ success: true, data: row, message: 'Get measurementProcedure by id completed' })
            }
        )
    })
}

// Thêm mới measurementProcedure (transaction)
export const insertMeasurementProcedureTransaction = async (info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO measurement_procedure(
                mrid, measurement_id, procedure_id
            ) VALUES (?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                measurement_id = excluded.measurement_id,
                procedure_id = excluded.procedure_id
            `,
            [
                info.mrid,
                info.measurement_id,
                info.procedure_id
            ],
            function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Insert measurementProcedure failed' })
                }
                return resolve({ success: true, data: info, message: 'Insert measurementProcedure completed' })
            }
        )
    })
}

// Cập nhật measurementProcedure (transaction)
export const updateMeasurementProcedureTransaction = async (mrid, info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE measurement_procedure SET
                measurement_id = ?,
                procedure_id = ?
            WHERE mrid = ?`,
            [
                info.measurement_id,
                info.procedure_id,
                mrid
            ],
            function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Update measurementProcedure failed' })
                }
                return resolve({ success: true, data: info, message: 'Update measurementProcedure completed' })
            }
        )
    })
}

// Xóa measurementProcedure (transaction)
export const deleteMeasurementProcedureTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM measurement_procedure WHERE mrid=?", [mrid], function (err) {
            if (err) {
                return reject({ success: false, err, message: 'Delete measurementProcedure failed' })
            }
            return resolve({ success: true, data: mrid, message: 'Delete measurementProcedure completed' })
        })
    })
}