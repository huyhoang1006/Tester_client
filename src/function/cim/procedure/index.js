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

export const getProcedureByAssetId = async (mrid) => {
    try {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT p.*, d.*, io.*
                 FROM procedure p
                 JOIN document d ON p.mrid = d.mrid
                 JOIN identified_object io ON p.mrid = io.mrid
                 JOIN procedure_asset pa ON p.mrid = pa.procedure_id
                 WHERE pa.asset_id = ?`,
                [mrid],
                (err, rows) => {
                    if (err) return reject({ success: false, err, message: 'Get procedure by asset id failed' })
                    return resolve({ success: true, data: rows, message: 'Get procedure by asset id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get procedure by id failed' }
    }
}

export const getProcedureByGenericAssetModel = async (generic_asset_model) => {
    try {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT p.*, d.*, io.*
                 FROM procedure p
                 JOIN document d ON p.mrid = d.mrid
                 JOIN identified_object io ON p.mrid = io.mrid
                 JOIN procedure_asset pa ON p.mrid = pa.procedure_id
                 WHERE p.generic_asset_model = ?`,
                [generic_asset_model],
                (err, rows) => {
                    if (err) return reject({ success: false, err, message: 'Get procedure by generic asset model failed' })
                    return resolve({ success: true, data: rows, message: 'Get procedure by generic asset model completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get procedure by generic asset model failed' }
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
                    mrid, instruction, kind, sequence_number, generic_asset_model
                ) VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    instruction = excluded.instruction,
                    kind = excluded.kind,
                    sequence_number = excluded.sequence_number,
                    generic_asset_model = excluded.generic_asset_model
                `,
                [
                    procedure.mrid,
                    procedure.instruction,
                    procedure.kind,
                    procedure.sequence_number,
                    procedure.generic_asset_model
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
                    sequence_number = ?,
                    generic_asset_model = ?
                WHERE mrid = ?`,
                [
                    procedure.instruction,
                    procedure.kind,
                    procedure.sequence_number,
                    procedure.generic_asset_model,
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