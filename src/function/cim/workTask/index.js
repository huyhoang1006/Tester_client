import db from '../../datacontext/index'
import * as baseWorkFunc from '../baseWork/index'

// Lấy workTask theo mrid
export const getWorkTaskById = async (mrid) => {
    try {
        const baseWork = await baseWorkFunc.getBaseWorkById(mrid)
        if (!baseWork.success) {
            return { success: false, data: null, message: 'BaseWork not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM work_task WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get workTask by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'WorkTask not found' })
                    return resolve({ success: true, data: { ...baseWork.data, ...row }, message: 'Get workTask by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get workTask by id failed' }
    }
}

// Thêm mới workTask
export const insertWorkTaskTransaction = async (workTask, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thêm baseWork trước
            const baseResult = await baseWorkFunc.insertBaseWorkTransaction(workTask, dbsql)
            if (!baseResult.success) {
                return reject({ success: false, message: 'Insert baseWork failed', err: baseResult.err })
            }
            dbsql.run(
                `INSERT INTO work_task(
                    mrid, completed_date_time, contractor_cost, crew_eta, instruction,
                    estimated_completion_time, sched_override, started_date_time, task_kind,
                    tool_cost, trouble_order, switching_plan, work
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    completed_date_time = excluded.completed_date_time,
                    contractor_cost = excluded.contractor_cost,
                    crew_eta = excluded.crew_eta,
                    instruction = excluded.instruction,
                    estimated_completion_time = excluded.estimated_completion_time,
                    sched_override = excluded.sched_override,
                    started_date_time = excluded.started_date_time,
                    task_kind = excluded.task_kind,
                    tool_cost = excluded.tool_cost,
                    trouble_order = excluded.trouble_order,
                    switching_plan = excluded.switching_plan,
                    work = excluded.work
                `,
                [
                    workTask.mrid,
                    workTask.completed_date_time,
                    workTask.contractor_cost,
                    workTask.crew_eta,
                    workTask.instruction,
                    workTask.estimated_completion_time,
                    workTask.sched_override,
                    workTask.started_date_time,
                    workTask.task_kind,
                    workTask.tool_cost,
                    workTask.trouble_order,
                    workTask.switching_plan,
                    workTask.work
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert workTask failed' })
                    return resolve({ success: true, data: workTask, message: 'Insert workTask completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert workTask failed' })
        }
    })
}

// Cập nhật workTask
export const updateWorkTaskByIdTransaction = async (mrid, workTask, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Cập nhật baseWork trước
            const baseResult = await baseWorkFunc.updateBaseWorkByIdTransaction(mrid, workTask, dbsql)
            if (!baseResult.success) {
                return reject({ success: false, message: 'Update baseWork failed', err: baseResult.err })
            }
            dbsql.run(
                `UPDATE work_task SET
                    completed_date_time = ?,
                    contractor_cost = ?,
                    crew_eta = ?,
                    instruction = ?,
                    estimated_completion_time = ?,
                    sched_override = ?,
                    started_date_time = ?,
                    task_kind = ?,
                    tool_cost = ?,
                    trouble_order = ?,
                    switching_plan = ?,
                    work = ?
                WHERE mrid = ?`,
                [
                    workTask.completed_date_time,
                    workTask.contractor_cost,
                    workTask.crew_eta,
                    workTask.instruction,
                    workTask.estimated_completion_time,
                    workTask.sched_override,
                    workTask.started_date_time,
                    workTask.task_kind,
                    workTask.tool_cost,
                    workTask.trouble_order,
                    workTask.switching_plan,
                    workTask.work,
                    mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update workTask failed' })
                    return resolve({ success: true, data: workTask, message: 'Update workTask completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update workTask failed' })
        }
    })
}

// Xóa workTask
export const deleteWorkTaskByIdTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM work_task WHERE mrid=?", [mrid], function (err) {
                if (err) return reject({ success: false, err, message: 'Delete work_task failed' })
                if (this.changes === 0) return resolve({ success: false, data: null, message: 'Work_task not found' })
                // Xóa baseWork sau khi xóa work_task
                baseWorkFunc.deleteBaseWorkByIdTransaction(mrid, dbsql)
                return resolve({ success: true, data: null, message: 'Delete work_task completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete work_task failed' })
        }
    })
}

export const getWorkTaskByWork = async (workId, dbsql) => {
  return new Promise((resolve, reject) => {
    dbsql.all(
      `SELECT 
          wt.*, 
          bw.*, 
          d.*, 
          io.*
       FROM work_task wt
       LEFT JOIN base_work bw ON wt.mrid = bw.mrid
       LEFT JOIN document d ON wt.mrid = d.mrid
       LEFT JOIN identified_object io ON wt.mrid = io.mrid
       WHERE wt.work = ?`,
      [workId],
      (err, rows) => {
        if (err) return reject({ success: false, err, message: 'Get workTask by work failed' })
        if (!rows || rows.length === 0) 
          return resolve({ success: false, data: [], message: 'No workTask found for this work' })
        return resolve({ success: true, data: rows, message: 'Get workTask by work completed' })
      }
    )
  })
}

