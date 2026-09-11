import db from '../../datacontext/index'

/**
 * Replace the complete Motor Current waveform of one procedure_dataset row.
 * The caller owns the surrounding job transaction.
 */
export const replaceCbMotorCurrentPointsTransaction = (datasetId, points, dbsql) => {
    return new Promise((resolve, reject) => {
        if (!datasetId) {
            return resolve({ success: true, data: [], message: 'No dataset id, nothing to write' })
        }

        dbsql.run(
            'DELETE FROM cb_motor_current_point WHERE procedure_dataset_id = ?',
            [datasetId],
            function (deleteError) {
                if (deleteError) {
                    return reject({
                        success: false,
                        err: deleteError,
                        message: `Delete Motor Current points failed: ${deleteError.message}`,
                    })
                }

                const list = Array.isArray(points) ? points.filter(Boolean) : []
                if (list.length === 0) {
                    return resolve({ success: true, data: [], message: 'Motor Current waveform cleared' })
                }

                const statement = dbsql.prepare(
                    `INSERT INTO cb_motor_current_point(
                        mrid, procedure_dataset_id, sequence_number, time, current, voltage
                    ) VALUES (?, ?, ?, ?, ?, ?)`
                )
                let pending = list.length
                let failed = null

                list.forEach((point, index) => {
                    statement.run(
                        [
                            point.mrid,
                            datasetId,
                            index,
                            point.time === null || point.time === undefined ? null : String(point.time),
                            point.current === null || point.current === undefined ? null : String(point.current),
                            point.voltage === null || point.voltage === undefined ? null : String(point.voltage),
                        ],
                        (insertError) => {
                            if (insertError && !failed) failed = insertError
                            if (--pending !== 0) return

                            statement.finalize(() => {
                                if (failed) {
                                    return reject({
                                        success: false,
                                        err: failed,
                                        message: `Insert Motor Current points failed: ${failed.message}`,
                                    })
                                }
                                return resolve({
                                    success: true,
                                    data: list,
                                    message: 'Motor Current waveform written',
                                })
                            })
                        }
                    )
                })
            }
        )
    })
}

export const getCbMotorCurrentPointsByDatasetId = (datasetId) => {
    return new Promise((resolve, reject) => {
        if (!datasetId) return resolve({ success: true, data: [], message: 'No dataset id' })
        db.all(
            `SELECT * FROM cb_motor_current_point
              WHERE procedure_dataset_id = ?
              ORDER BY sequence_number ASC`,
            [datasetId],
            (error, rows) => {
                if (error) {
                    return reject({
                        success: false,
                        err: error,
                        message: `Get Motor Current points failed: ${error.message}`,
                    })
                }
                return resolve({
                    success: true,
                    data: rows || [],
                    message: 'Get Motor Current points completed',
                })
            }
        )
    })
}

export const getCbMotorCurrentPointsByDatasetIds = (datasetIds) => {
    return new Promise((resolve, reject) => {
        const ids = (Array.isArray(datasetIds) ? datasetIds : []).filter(Boolean)
        if (ids.length === 0) return resolve({ success: true, data: {}, message: 'No dataset' })

        const placeholders = ids.map(() => '?').join(',')
        db.all(
            `SELECT * FROM cb_motor_current_point
              WHERE procedure_dataset_id IN (${placeholders})
              ORDER BY procedure_dataset_id ASC, sequence_number ASC`,
            ids,
            (error, rows) => {
                if (error) {
                    return reject({
                        success: false,
                        err: error,
                        message: `Get Motor Current points failed: ${error.message}`,
                    })
                }
                const grouped = {}
                for (const row of (rows || [])) {
                    if (!grouped[row.procedure_dataset_id]) grouped[row.procedure_dataset_id] = []
                    grouped[row.procedure_dataset_id].push(row)
                }
                return resolve({
                    success: true,
                    data: grouped,
                    message: 'Get Motor Current points completed',
                })
            }
        )
    })
}

