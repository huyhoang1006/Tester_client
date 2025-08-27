import db from '../../datacontext/index'
import * as documentFunc from '../document/index'

// Lấy procedureDataSet theo mrid
export const getProcedureDataSetById = async (mrid) => {
    try {
        const document = await documentFunc.getDocumentById(mrid)
        if (!document.success) {
            return { success: false, data: null, message: 'Document not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM procedure_dataset WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get procedureDataSet by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'ProcedureDataSet not found' })
                    return resolve({ success: true, data: { ...document.data, ...row }, message: 'Get procedureDataSet by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get procedureDataSet by id failed' }
    }
}

// Thêm mới procedureDataSet
export const insertProcedureDataSetTransaction = async (procedureDataSet, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thêm document trước
            const docResult = await documentFunc.insertDocumentTransaction(procedureDataSet, dbsql)
            if (!docResult.success) {
                return reject({ success: false, message: 'Insert document failed', err: docResult.err })
            }
            dbsql.run(
                `INSERT INTO procedure_dataset(
                    mrid, completed_date_time, work_task, asset, procedure
                ) VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    completed_date_time = excluded.completed_date_time,
                    work_task = excluded.work_task,
                    asset = excluded.asset,
                    procedure = excluded.procedure
                `,
                [
                    procedureDataSet.mrid,
                    procedureDataSet.completed_date_time,
                    procedureDataSet.work_task,
                    procedureDataSet.asset,
                    procedureDataSet.procedure
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert procedureDataSet failed' })
                    return resolve({ success: true, data: procedureDataSet, message: 'Insert procedureDataSet completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert procedureDataSet failed' })
        }
    })
}

// Cập nhật procedureDataSet
export const updateProcedureDataSetByIdTransaction = async (mrid, procedureDataSet, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Cập nhật document trước
            const docResult = await documentFunc.updateDocumentByIdTransaction(mrid, procedureDataSet, dbsql)
            if (!docResult.success) {
                return reject({ success: false, message: 'Update document failed', err: docResult.err })
            }
            dbsql.run(
                `UPDATE procedure_dataset SET
                    completed_date_time = ?,
                    work_task = ?,
                    asset = ?,
                    procedure = ?
                WHERE mrid = ?`,
                [
                    procedureDataSet.completed_date_time,
                    procedureDataSet.work_task,
                    procedureDataSet.asset,
                    procedureDataSet.procedure,
                    mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update procedureDataSet failed' })
                    return resolve({ success: true, data: procedureDataSet, message: 'Update procedureDataSet completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update procedureDataSet failed' })
        }
    })
}

// Xóa procedureDataSet
export const deleteProcedureDataSetByIdTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM procedure_dataset WHERE mrid=?", [mrid], function (err) {
                if (err) return reject({ success: false, err, message: 'Delete procedureDataSet failed' })
                if (this.changes === 0) return resolve({ success: false, data: null, message: 'ProcedureDataSet not found' })
                // Xóa document sau khi xóa procedureDataSet
                documentFunc.deleteDocumentByIdTransaction(mrid, dbsql)
                return resolve({ success: true, data: null, message: 'Delete procedureDataSet completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete procedureDataSet failed' })
        }
    })
}