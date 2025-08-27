import db from '../../datacontext/index'
import * as workTaskFunc from '../workTask/index'

// Lấy surgeArresterWorkTask theo mrid
export const getSurgeArresterWorkTaskById = async (mrid) => {
    try {
        const workTask = await workTaskFunc.getWorkTaskById(mrid)
        if (!workTask.success) {
            return { success: false, data: null, message: 'WorkTask not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM surge_arrester_work_task WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get surgeArresterWorkTask by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'SurgeArresterWorkTask not found' })
                    return resolve({ success: true, data: { ...workTask.data, ...row }, message: 'Get surgeArresterWorkTask by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get surgeArresterWorkTask by id failed' }
    }
}

// Thêm mới surgeArresterWorkTask
export const insertSurgeArresterWorkTaskTransaction = async (surgeArresterWorkTask, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thêm workTask trước
            const workTaskResult = await workTaskFunc.insertWorkTaskTransaction(surgeArresterWorkTask, dbsql)
            if (!workTaskResult.success) {
                return reject({ success: false, message: 'Insert workTask failed', err: workTaskResult.err })
            }
            dbsql.run(
                `INSERT INTO surge_arrester_work_task(
                    mrid, test_type_surge_arrester_id, test_standard_id
                ) VALUES (?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    test_type_surge_arrester_id = excluded.test_type_surge_arrester_id,
                    test_standard_id = excluded.test_standard_id
                `,
                [
                    surgeArresterWorkTask.mrid,
                    surgeArresterWorkTask.test_type_surge_arrester_id,
                    surgeArresterWorkTask.test_standard_id
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert surgeArresterWorkTask failed' })
                    return resolve({ success: true, data: surgeArresterWorkTask, message: 'Insert surgeArresterWorkTask completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert surgeArresterWorkTask failed' })
        }
    })
}

// Cập nhật surgeArresterWorkTask
export const updateSurgeArresterWorkTaskByIdTransaction = async (mrid, surgeArresterWorkTask, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Cập nhật workTask trước
            const workTaskResult = await workTaskFunc.updateWorkTaskByIdTransaction(mrid, surgeArresterWorkTask, dbsql)
            if (!workTaskResult.success) {
                return reject({ success: false, message: 'Update workTask failed', err: workTaskResult.err })
            }
            dbsql.run(
                `UPDATE surge_arrester_work_task SET
                    test_type_surge_arrester_id = ?,
                    test_standard_id = ?
                WHERE mrid = ?`,
                [
                    surgeArresterWorkTask.test_type_surge_arrester_id,
                    surgeArresterWorkTask.test_standard_id,
                    mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update surgeArresterWorkTask failed' })
                    return resolve({ success: true, data: surgeArresterWorkTask, message: 'Update surgeArresterWorkTask completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update surgeArresterWorkTask failed' })
        }
    })
}

// Xóa surgeArresterWorkTask
export const deleteSurgeArresterWorkTaskByIdTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM surge_arrester_work_task WHERE mrid=?", [mrid], function (err) {
                if (err) return reject({ success: false, err, message: 'Delete surgeArresterWorkTask failed' })
                if (this.changes === 0) return resolve({ success: false, data: null, message: 'SurgeArresterWorkTask not found' })
                // Xóa workTask sau khi xóa surgeArresterWorkTask
                workTaskFunc.deleteWorkTaskByIdTransaction(mrid, dbsql)
                return resolve({ success: true, data: null, message: 'Delete surgeArresterWorkTask completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete surgeArresterWorkTask failed'})
        }
    })
}