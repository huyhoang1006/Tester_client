import db from '../../datacontext/index'
import * as baseWorkFunc from '../baseWork/index'

// Lấy work theo mrid
export const getWorkById = async (mrid) => {
    try {
        const baseWork = await baseWorkFunc.getBaseWorkById(mrid)
        if (!baseWork.success) {
            return { success: false, data: null, message: 'BaseWork not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM work WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get work by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'Work not found' })
                    return resolve({ success: true, data: { ...baseWork.data, ...row }, message: 'Get work by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get work by id failed' }
    }
}

// Thêm mới work
export const insertWorkTransaction = async (work, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thêm baseWork trước
            const baseResult = await baseWorkFunc.insertBaseWorkTransaction(work, dbsql)
            if (!baseResult.success) {
                return reject({ success: false, message: 'Insert baseWork failed', err: baseResult.err })
            }
            dbsql.run(
                `INSERT INTO work(
                    mrid, request_date_time, work_order_number, erp_project_accounting, project,
                    work_flow_steps, business_case, work_billing_info
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    request_date_time = excluded.request_date_time,
                    work_order_number = excluded.work_order_number,
                    erp_project_accounting = excluded.erp_project_accounting,
                    project = excluded.project,
                    work_flow_steps = excluded.work_flow_steps,
                    business_case = excluded.business_case,
                    work_billing_info = excluded.work_billing_info
                `,
                [
                    work.mrid,
                    work.request_date_time,
                    work.work_order_number,
                    work.erp_project_accounting,
                    work.project,
                    work.work_flow_steps,
                    work.business_case,
                    work.work_billing_info
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert work failed' })
                    return resolve({ success: true, data: work, message: 'Insert work completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert work failed' })
        }
    })
}

// Cập nhật work
export const updateWorkByIdTransaction = async (mrid, work, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Cập nhật baseWork trước
            const baseResult = await baseWorkFunc.updateBaseWorkByIdTransaction(mrid, work, dbsql)
            if (!baseResult.success) {
                return reject({ success: false, message: 'Update baseWork failed', err: baseResult.err })
            }
            dbsql.run(
                `UPDATE work SET
                    request_date_time = ?,
                    work_order_number = ?,
                    erp_project_accounting = ?,
                    project = ?,
                    work_flow_steps = ?,
                    business_case = ?,
                    work_billing_info = ?
                WHERE mrid = ?`,
                [
                    work.request_date_time,
                    work.work_order_number,
                    work.erp_project_accounting,
                    work.project,
                    work.work_flow_steps,
                    work.business_case,
                    work.work_billing_info,
                    mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update work failed' })
                    return resolve({ success: true, data: work, message: 'Update work completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update work failed' })
        }
    })
}

// Xóa work
export const deleteWorkByIdTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM work WHERE mrid=?", [mrid], function (err) {
                if (err) return reject({ success: false, err, message: 'Delete work failed' })
                if (this.changes === 0) return resolve({ success: false, data: null, message: 'Work not found' })
                // Xóa baseWork sau khi xóa work
                baseWorkFunc.deleteBaseWorkByIdTransaction(mrid, dbsql)
                return resolve({ success: true, data: null, message: 'Delete work completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete work failed' })
        }
    })
}