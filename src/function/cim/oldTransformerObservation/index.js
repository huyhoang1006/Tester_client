import db from '../../datacontext/index'
import * as transformerObservationFunc from '../transformerObservation/index'

// Lấy oldTransformerObservation theo mrid
export const getOldTransformerObservationById = async (mrid) => {
    try {
        const transformerObservation = await transformerObservationFunc.getTransformerObservationById(mrid)
        if (!transformerObservation.success) {
            return { success: false, data: null, message: 'TransformerObservation not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM old_transformer_observation WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get oldTransformerObservation by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'OldTransformerObservation not found' })
                    return resolve({ success: true, data: { ...transformerObservation.data, ...row }, message: 'Get oldTransformerObservation by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get oldTransformerObservation by id failed' }
    }
}

// Thêm mới oldTransformerObservation
export const insertOldTransformerObservationTransaction = async (oldTransformerObservation, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thêm transformerObservation trước
            const obsResult = await transformerObservationFunc.insertTransformerObservationTransaction(oldTransformerObservation, dbsql)
            if (!obsResult.success) {
                return reject({ success: false, message: 'Insert transformerObservation failed', err: obsResult.err })
            }
            dbsql.run(
                `INSERT INTO old_transformer_observation(
                    mrid, bottom_oil_temp, work_task_id
                ) VALUES (?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    bottom_oil_temp = excluded.bottom_oil_temp,
                    work_task_id = excluded.work_task_id
                `,
                [
                    oldTransformerObservation.mrid,
                    oldTransformerObservation.bottom_oil_temp,
                    oldTransformerObservation.work_task_id
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert oldTransformerObservation failed' })
                    return resolve({ success: true, data: oldTransformerObservation, message: 'Insert oldTransformerObservation completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert oldTransformerObservation failed' })
        }
    })
}

// Cập nhật oldTransformerObservation
export const updateOldTransformerObservationByIdTransaction = async (mrid, oldTransformerObservation, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Cập nhật transformerObservation trước
            const obsResult = await transformerObservationFunc.updateTransformerObservationByIdTransaction(mrid, oldTransformerObservation, dbsql)
            if (!obsResult.success) {
                return reject({ success: false, message: 'Update transformerObservation failed', err: obsResult.err })
            }
            dbsql.run(
                `UPDATE old_transformer_observation SET
                    bottom_oil_temp = ?,
                    work_task_id = ?
                WHERE mrid = ?`,
                [
                    oldTransformerObservation.bottom_oil_temp,
                    oldTransformerObservation.work_task_id,
                    mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update oldTransformerObservation failed' })
                    return resolve({ success: true, data: oldTransformerObservation, message: 'Update oldTransformerObservation completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update oldTransformerObservation failed' })
        }
    })
}

// Xóa oldTransformerObservation
export const deleteOldTransformerObservationByIdTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM old_transformer_observation WHERE mrid=?", [mrid], function (err) {
                if (err) return reject({ success: false, err, message: 'Delete oldTransformerObservation failed' })
                if (this.changes === 0) return resolve({ success: false, data: null, message: 'OldTransformerObservation not found' })
                // Xóa transformerObservation sau khi xóa oldTransformerObservation
                transformerObservationFunc.deleteTransformerObservationByIdTransaction(mrid, dbsql)
                return resolve({ success: true, data: null, message: 'Delete oldTransformerObservation completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete oldTransformerObservation failed' })
        }
    })
}

// Lấy oldTransformerObservation theo work_task_id
export const getOldTransformerObservationByWorkTaskId = async (workTaskId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT oto.*, tobs.*, io.*
             FROM old_transformer_observation oto
             LEFT JOIN transformer_observation tobs ON oto.mrid = tobs.mrid
             LEFT JOIN identified_object io ON tobs.mrid = io.mrid
             WHERE oto.work_task_id = ?`,
            [workTaskId],
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get oldTransformerObservation by work_task_id failed' })
                if (!rows || rows.length === 0) return resolve({ success: false, data: [], message: 'No oldTransformerObservation found for this work_task_id' })
                return resolve({ success: true, data: rows, message: 'Get oldTransformerObservation by work_task_id completed' })
            }
        )
    })
}