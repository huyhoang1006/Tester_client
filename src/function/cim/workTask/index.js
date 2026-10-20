import db from '../../datacontext/index'
import * as baseWorkFunc from '../baseWork/index'
import * as oldWorkFunc from '../oldWork/index'
import uuid from '@/utils/uuid'

const TEST_YEAR_CONTAINER_KIND = 'test-year-container'
const NO_TESTING_DATE_JOB_NAME = 'Job No testing date'

const getAsync = (connection, sql, params = []) => {
    return new Promise((resolve, reject) => {
        connection.get(sql, params, (err, row) => {
            if (err) return reject(err)
            return resolve(row || null)
        })
    })
}

const getTestingYear = (testingDate) => {
    const match = String(testingDate || '').match(/\b(19|20)\d{2}\b/)
    return match ? match[0] : null
}

const getYearContainerName = (testingDate) => {
    const year = getTestingYear(testingDate)
    return year ? `Job ${year}` : NO_TESTING_DATE_JOB_NAME
}

const getOldWorkEntityByIdTransaction = (mrid, dbsql) => {
    return getAsync(
        dbsql,
        `SELECT ow.*, w.*, bw.*, d.*, io.*
         FROM old_work ow
         LEFT JOIN work w ON w.mrid = ow.mrid
         LEFT JOIN base_work bw ON bw.mrid = ow.mrid
         LEFT JOIN document d ON d.mrid = ow.mrid
         LEFT JOIN identified_object io ON io.mrid = ow.mrid
         WHERE ow.mrid = ?`,
        [mrid]
    )
}

const findYearContainerTransaction = (assetId, name, dbsql) => {
    return getAsync(
        dbsql,
        `SELECT ow.mrid
         FROM old_work ow
         INNER JOIN identified_object io ON io.mrid = ow.mrid
         LEFT JOIN base_work bw ON bw.mrid = ow.mrid
         WHERE ow.asset_id = ?
           AND LOWER(TRIM(io.name)) = LOWER(TRIM(?))
         ORDER BY CASE WHEN bw.kind = ? THEN 0 ELSE 1 END, ow.rowid
         LIMIT 1`,
        [assetId, name, TEST_YEAR_CONTAINER_KIND]
    )
}

// Jobs remain as hidden persistence containers. Every test is attached to the
// container matching its own Testing date, not to the Job that opened the form.
export const resolveWorkTaskYearContainerTransaction = async (workTask, dbsql) => {
    if (!workTask || !workTask.work) return null

    const sourceWork = await getOldWorkEntityByIdTransaction(workTask.work, dbsql)
    if (!sourceWork || !sourceWork.asset_id) return null

    const containerName = getYearContainerName(workTask.testing_date)
    const existing = await findYearContainerTransaction(sourceWork.asset_id, containerName, dbsql)
    if (existing) {
        workTask.work = existing.mrid
        return existing.mrid
    }

    const container = {
        ...sourceWork,
        mrid: uuid.newUuid(),
        name: containerName,
        kind: TEST_YEAR_CONTAINER_KIND,
        type: workTask.type || sourceWork.type,
        approver: workTask.approved_by || sourceWork.approver,
        approval_date: workTask.approved_date || null,
        tested_by: workTask.tested_by || null,
        ref_standard: workTask.reference_standard || null,
        execution_date: workTask.testing_date || null
    }
    const result = await oldWorkFunc.insertOldWorkTransaction(container, dbsql)
    if (!result.success) {
        throw result.err || new Error(result.message || 'Create test year container failed')
    }

    workTask.work = container.mrid
    return container.mrid
}

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
    return new Promise((resolve, reject) => {
        void (async () => {
        try {
            await resolveWorkTaskYearContainerTransaction(workTask, dbsql)
            // Thêm baseWork trước
            const baseResult = await baseWorkFunc.insertBaseWorkTransaction({
                ...workTask, type: workTask.test_type_code || workTask.type
            }, dbsql)
            if (!baseResult.success) {
                return reject({ success: false, message: 'Insert baseWork failed', err: baseResult.err })
            }
            dbsql.run(
                `INSERT INTO work_task(
                    mrid, test_name, type, test_type_code, testing_date, tested_by, approved_by,
                    approved_date, reference_standard, completed_date_time, contractor_cost, crew_eta, instruction,
                    estimated_completion_time, sched_override, started_date_time, task_kind,
                    tool_cost, trouble_order, switching_plan, work
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    test_name = excluded.test_name,
                    type = excluded.type,
                    test_type_code = excluded.test_type_code,
                    testing_date = excluded.testing_date,
                    tested_by = excluded.tested_by,
                    approved_by = excluded.approved_by,
                    approved_date = excluded.approved_date,
                    reference_standard = excluded.reference_standard,
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
                    workTask.test_name,
                    workTask.type,
                    workTask.test_type_code,
                    workTask.testing_date,
                    workTask.tested_by,
                    workTask.approved_by,
                    workTask.approved_date,
                    workTask.reference_standard,
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
        })().catch(reject)
    })
}

// Cập nhật workTask
export const updateWorkTaskByIdTransaction = async (mrid, workTask, dbsql) => {
    return new Promise((resolve, reject) => {
        void (async () => {
        try {
            await resolveWorkTaskYearContainerTransaction(workTask, dbsql)
            // Cập nhật baseWork trước
            const baseResult = await baseWorkFunc.updateBaseWorkByIdTransaction(mrid, {
                ...workTask, type: workTask.test_type_code || workTask.type
            }, dbsql)
            if (!baseResult.success) {
                return reject({ success: false, message: 'Update baseWork failed', err: baseResult.err })
            }
            dbsql.run(
                `UPDATE work_task SET
                    test_name = ?,
                    type = ?,
                    test_type_code = ?,
                    testing_date = ?,
                    tested_by = ?,
                    approved_by = ?,
                    approved_date = ?,
                    reference_standard = ?,
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
                    workTask.test_name,
                    workTask.type,
                    workTask.test_type_code,
                    workTask.testing_date,
                    workTask.tested_by,
                    workTask.approved_by,
                    workTask.approved_date,
                    workTask.reference_standard,
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
        })().catch(reject)
    })
}

// Xóa workTask
export const deleteWorkTaskByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        void (async () => {
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
        })().catch(reject)
    })
}

export const getWorkTaskByWork = async (workId, dbsql) => {
  const connection = dbsql || db
  return new Promise((resolve, reject) => {
    connection.all(
      `SELECT 
          wt.*, 
          bw.*, 
          d.*, 
          io.*,
          wt.type AS type,
          wt.mrid AS mrid
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

export const getWorkTaskByAsset = async (assetId, dbsql) => {
  const connection = dbsql || db
  return new Promise((resolve, reject) => {
    connection.all(
      `SELECT
          wt.*,
          bw.*,
          d.*,
          io.*,
          wt.work AS work_mrid,
          work_io.name AS work_name,
          ow.execution_date AS work_execution_date,
          ow.tested_by AS work_tested_by,
          wt.type AS type,
          -- Đặt CUỐI để thắng: base_work, document, identified_object đều có cột mrid và
          -- đều LEFT JOIN. Thiếu dòng ở bảng nào thì mrid NULL của bảng đó đè lên mrid của
          -- work_task (cột trùng tên thì cột sau thắng), node test trên cây không mở được.
          wt.mrid AS mrid
       FROM work_task wt
       INNER JOIN old_work ow ON ow.mrid = wt.work
       LEFT JOIN base_work bw ON wt.mrid = bw.mrid
       LEFT JOIN document d ON wt.mrid = d.mrid
       LEFT JOIN identified_object io ON wt.mrid = io.mrid
       LEFT JOIN identified_object work_io ON ow.mrid = work_io.mrid
       WHERE ow.asset_id = ?`,
      [assetId],
      (err, rows) => {
        if (err) return reject({ success: false, err, message: 'Get workTask by asset failed' })
        return resolve({ success: true, data: rows || [], message: 'Get workTask by asset completed' })
      }
    )
  })
}

