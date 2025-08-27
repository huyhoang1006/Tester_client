import db from '../../datacontext/index'
import * as identifiedObjectFunc from '../identifiedObject/index'

// Lấy document theo mrid
export const getDocumentById = async (mrid) => {
    try {
        const identifiedObject = await identifiedObjectFunc.getIdentifiedObjectById(mrid)
        if (!identifiedObject.success) {
            return { success: false, data: null, message: 'IdentifiedObject not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM document WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err: err, message: 'Get document by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'Document not found' })
                    return resolve({ success: true, data: { ...identifiedObject.data, ...row }, message: 'Get document by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get document by id failed' }
    }
}

// Thêm mới document
export const insertDocumentTransaction = async (document, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thêm identifiedObject trước
            const idObjResult = await identifiedObjectFunc.insertIdentifiedObjectTransaction(document, db)
            if (!idObjResult.success) {
                return reject({ success: false, message: 'Insert identifiedObject failed', err: idObjResult.err })
            }
            dbsql.run(
                `INSERT INTO document(
                    mrid, type, created_date_time, last_modified_date_time, revision_number, electronic_address,
                    subject, title, doc_status, status, author_name, comment, author, editor, issuer, approver
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    type = excluded.type,
                    created_date_time = excluded.created_date_time,
                    last_modified_date_time = excluded.last_modified_date_time,
                    revision_number = excluded.revision_number,
                    electronic_address = excluded.electronic_address,
                    subject = excluded.subject,
                    title = excluded.title,
                    doc_status = excluded.doc_status,
                    status = excluded.status,
                    author_name = excluded.author_name,
                    comment = excluded.comment,
                    author = excluded.author,
                    editor = excluded.editor,
                    issuer = excluded.issuer,
                    approver = excluded.approver
                `,
                [
                    document.mrid,
                    document.type,
                    document.created_date_time,
                    document.last_modified_date_time,
                    document.revision_number,
                    document.electronic_address,
                    document.subject,
                    document.title,
                    document.doc_status,
                    document.status,
                    document.author_name,
                    document.comment,
                    document.author,
                    document.editor,
                    document.issuer,
                    document.approver
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert document failed' })
                    return resolve({ success: true, data: document, message: 'Insert document completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert document failed' })
        }
    })
}

// Cập nhật document
export const updateDocumentByIdTransaction = async (mrid, document, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Cập nhật identifiedObject trước
            const idObjResult = await identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, document, dbsql)
            if (!idObjResult.success) {
                return reject({ success: false, message: 'Update identifiedObject failed', err: idObjResult.err })
            }
            dbsql.run(
                `UPDATE document SET
                    type = ?,
                    created_date_time = ?,
                    last_modified_date_time = ?,
                    revision_number = ?,
                    electronic_address = ?,
                    subject = ?,
                    title = ?,
                    doc_status = ?,
                    status = ?,
                    author_name = ?,
                    comment = ?,
                    author = ?,
                    editor = ?,
                    issuer = ?,
                    approver = ?
                WHERE mrid = ?`,
                [
                    document.type,
                    document.created_date_time,
                    document.last_modified_date_time,
                    document.revision_number,
                    document.electronic_address,
                    document.subject,
                    document.title,
                    document.doc_status,
                    document.status,
                    document.author_name,
                    document.comment,
                    document.author,
                    document.editor,
                    document.issuer,
                    document.approver,
                    mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update document failed' })
                    return resolve({ success: true, data: document, message: 'Update document completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update document failed' })
        }
    })
}

// Xóa document
export const deleteDocumentByIdTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM document WHERE mrid=?", [mrid], function (err) {
                if (err) return reject({ success: false, err, message: 'Delete document failed' })
                if (this.changes === 0) return resolve({ success: false, data: null, message: 'Document not found' })
                // Xóa identifiedObject sau khi xóa document
                identifiedObjectFunc.deleteIdentifiedObjectById(mrid, dbsql)
                return resolve({ success: true, data: null, message: 'Delete document completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete document failed' })
        }
    })
}