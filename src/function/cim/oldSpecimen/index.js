import db from '../../datacontext/index'
import * as specimenFunc from '../specimen/index'

// Lấy oldSpecimen theo mrid
export const getOldSpecimenById = async (mrid) => {
    try {
        const specimen = await specimenFunc.getSpecimenById(mrid)
        if (!specimen.success) {
            return { success: false, data: null, message: 'Specimen not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM old_specimen WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get oldSpecimen by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'OldSpecimen not found' })
                    return resolve({ success: true, data: { ...specimen.data, ...row }, message: 'Get oldSpecimen by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get oldSpecimen by id failed' }
    }
}

// Lấy oldSpecimen theo workTaskId
export const getOldSpecimenByWorkTaskId = async (workTaskId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT os.*, s.*, io.*
             FROM old_specimen os
             LEFT JOIN specimen s ON os.mrid = s.mrid
             LEFT JOIN identified_object io ON s.mrid = io.mrid
             WHERE os.work_task_id = ?`,
            [workTaskId],
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get oldSpecimen by work_task_id failed' })
                if (!rows || rows.length === 0) return resolve({ success: false, data: [], message: 'No oldSpecimen found for this work_task_id' })
                return resolve({ success: true, data: rows, message: 'Get oldSpecimen by work_task_id completed' })
            }
        )
    })
}

// Thêm mới oldSpecimen
export const insertOldSpecimenTransaction = async (oldSpecimen, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thêm specimen trước
            const specimenResult = await specimenFunc.insertSpecimenTransaction(oldSpecimen, dbsql)
            if (!specimenResult.success) {
                return reject({ success: false, message: 'Insert specimen failed', err: specimenResult.err })
            }
            dbsql.run(
                `INSERT INTO old_specimen(
                    mrid, weather_kind, reference_temp, winding_temp, work_task_id
                ) VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    weather_kind = excluded.weather_kind,
                    reference_temp = excluded.reference_temp,
                    winding_temp = excluded.winding_temp,
                    work_task_id = excluded.work_task_id
                `,
                [
                    oldSpecimen.mrid,
                    oldSpecimen.weather_kind,
                    oldSpecimen.reference_temp,
                    oldSpecimen.winding_temp,
                    oldSpecimen.work_task_id
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert oldSpecimen failed' })
                    return resolve({ success: true, data: oldSpecimen, message: 'Insert oldSpecimen completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert oldSpecimen failed' })
        }
    })
}

// Cập nhật oldSpecimen
export const updateOldSpecimenByIdTransaction = async (mrid, oldSpecimen, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Cập nhật specimen trước
            const specimenResult = await specimenFunc.updateSpecimenByIdTransaction(mrid, oldSpecimen, dbsql)
            if (!specimenResult.success) {
                return reject({ success: false, message: 'Update specimen failed', err: specimenResult.err })
            }
            dbsql.run(
                `UPDATE old_specimen SET
                    weather_kind = ?,
                    reference_temp = ?,
                    winding_temp = ?,
                    work_task_id = ?
                WHERE mrid = ?`,
                [
                    oldSpecimen.weather_kind,
                    oldSpecimen.reference_temp,
                    oldSpecimen.winding_temp,
                    oldSpecimen.work_task_id,
                    mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update oldSpecimen failed' })
                    return resolve({ success: true, data: oldSpecimen, message: 'Update oldSpecimen completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update oldSpecimen failed' })
        }
    })
}

// Xóa oldSpecimen
export const deleteOldSpecimenByIdTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM old_specimen WHERE mrid=?", [mrid], function (err) {
                if (err) return reject({ success: false, err, message: 'Delete oldSpecimen failed' })
                if (this.changes === 0) return resolve({ success: false, data: null, message: 'OldSpecimen not found' })
                // Xóa specimen sau khi xóa oldSpecimen
                specimenFunc.deleteSpecimenByIdTransaction(mrid, dbsql)
                return resolve({ success: true, data: null, message: 'Delete oldSpecimen completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete oldSpecimen failed' })
        }
    })
}