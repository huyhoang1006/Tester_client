import db from '../../datacontext/index'
import * as documentFunc from '../document/index'

// Lấy procedure theo mrid
export const getProcedureById = async (mrid) => {
    try {
        const document = await documentFunc.getDocumentById(mrid)
        if (!document.success) {
            return { success: false, data: null, message: 'Document not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM procedure WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get procedure by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'Procedure not found' })
                    return resolve({ success: true, data: { ...document.data, ...row }, message: 'Get procedure by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get procedure by id failed' }
    }
}

// Thêm mới procedure
export const insertProcedureTransaction = async (procedure, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thêm document trước
            const docResult = await documentFunc.insertDocumentTransaction(procedure, dbsql)
            if (!docResult.success) {
                return reject({ success: false, message: 'Insert document failed', err: docResult.err })
            }
            dbsql.run(
                `INSERT INTO procedure(
                    mrid, instruction, kind, sequence_number
                ) VALUES (?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    instruction = excluded.instruction,
                    kind = excluded.kind,
                    sequence_number = excluded.sequence_number
                `,
                [
                    procedure.mrid,
                    procedure.instruction,
                    procedure.kind,
                    procedure.sequence_number
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert procedure failed' })
                    return resolve({ success: true, data: procedure, message: 'Insert procedure completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert procedure failed' })
        }
    })
}

// Cập nhật procedure
export const updateProcedureByIdTransaction = async (mrid, procedure, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Cập nhật document trước
            const docResult = await documentFunc.updateDocumentByIdTransaction(mrid, procedure, dbsql)
            if (!docResult.success) {
                return reject({ success: false, message: 'Update document failed', err: docResult.err })
            }
            dbsql.run(
                `UPDATE procedure SET
                    instruction = ?,
                    kind = ?,
                    sequence_number = ?
                WHERE mrid = ?`,
                [
                    procedure.instruction,
                    procedure.kind,
                    procedure.sequence_number,
                    mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update procedure failed' })
                    return resolve({ success: true, data: procedure, message: 'Update procedure completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update procedure failed' })
        }
    })
}

// Xóa procedure
export const deleteProcedureByIdTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM procedure WHERE mrid=?", [mrid], function (err) {
                if (err) return reject({ success: false, err, message: 'Delete procedure failed' })
                if (this.changes === 0) return resolve({ success: false, data: null, message: 'Procedure not found' })
                // Xóa document sau khi xóa procedure
                documentFunc.deleteDocumentByIdTransaction(mrid, dbsql)
                return resolve({ success: true, data: null, message: 'Delete procedure completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete procedure failed' })
        }
    })
}