import db from '../../datacontext/index'

// Thêm mới measurementProcedure (transaction)
export const insertMeasurementProcedureTransaction = async (info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO measurement_procedure(
                measurement_id, procedure_id
            ) VALUES (?, ?)
            ON CONFLICT(measurement_id, procedure_id) DO NOTHING
            `,
            [
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