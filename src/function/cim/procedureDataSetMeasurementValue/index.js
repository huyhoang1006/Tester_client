import db from '../../datacontext/index'

// Lấy procedureDataSetMeasurementValue theo mrid
export const getProcedureDataSetMeasurementValueById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM procedure_dataset_measurement_value WHERE mrid=?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get procedureDataSetMeasurementValue by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'ProcedureDataSetMeasurementValue not found' })
                return resolve({ success: true, data: row, message: 'Get procedureDataSetMeasurementValue by id completed' })
            }
        )
    })
}

// Thêm mới procedureDataSetMeasurementValue (transaction)
export const insertProcedureDataSetMeasurementValueTransaction = async (info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO procedure_dataset_measurement_value(
                mrid, procedure_dataset_id, measurement_value_id
            ) VALUES (?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                procedure_dataset_id = excluded.procedure_dataset_id,
                measurement_value_id = excluded.measurement_value_id
            `,
            [
                info.mrid,
                info.procedure_dataset_id,
                info.measurement_value_id
            ],
            function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Insert procedureDataSetMeasurementValue failed' })
                }
                return resolve({ success: true, data: info, message: 'Insert procedureDataSetMeasurementValue completed' })
            }
        )
    })
}

// Cập nhật procedureDataSetMeasurementValue (transaction)
export const updateProcedureDataSetMeasurementValueTransaction = async (mrid, info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE procedure_dataset_measurement_value SET
                procedure_dataset_id = ?,
                measurement_value_id = ?
            WHERE mrid = ?`,
            [
                info.procedure_dataset_id,
                info.measurement_value_id,
                mrid
            ],
            function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Update procedureDataSetMeasurementValue failed' })
                }
                return resolve({ success: true, data: info, message: 'Update procedureDataSetMeasurementValue completed' })
            }
        )
    })
}

// Xóa procedureDataSetMeasurementValue (transaction)
export const deleteProcedureDataSetMeasurementValueTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM procedure_dataset_measurement_value WHERE mrid=?", [mrid], function (err) {
            if (err) {
                return reject({ success: false, err, message: 'Delete procedureDataSetMeasurementValue failed' })
            }
            return resolve({ success: true, data: mrid, message: 'Delete procedureDataSetMeasurementValue completed' })
        })
    })
}