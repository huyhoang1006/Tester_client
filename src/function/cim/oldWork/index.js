import db from '../../datacontext/index'
import * as workFunc from '../work/index'

// Lấy oldWork theo mrid
export const getOldWorkById = async (mrid) => {
    try {
        const work = await workFunc.getWorkById(mrid)
        if (!work.success) {
            return { success: false, data: null, message: 'Work not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM old_work WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get oldWork by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'OldWork not found' })
                    return resolve({ success: true, data: { ...work.data, ...row }, message: 'Get oldWork by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get oldWork by id failed' }
    }
}

export const getOldWorkByAssetId = async (assetId) => {
    try {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT ow.*, w.*, bw.*, d.*, io.*
                 FROM old_work ow
                 LEFT JOIN work w ON ow.mrid = w.mrid
                 LEFT JOIN base_work bw ON ow.mrid = bw.mrid
                 LEFT JOIN document d ON ow.mrid = d.mrid
                 LEFT JOIN identified_object io ON ow.mrid = io.mrid
                 WHERE ow.asset_id = ?`,
                [assetId],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get oldWork by assetId failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'OldWork not found' })
                    return resolve({ success: true, data: row, message: 'Get oldWork by assetId completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get oldWork by assetId failed' }
    }
}

// Thêm mới oldWork
export const insertOldWorkTransaction = async (oldWork, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thêm work trước
            const workResult = await workFunc.insertWorkTransaction(oldWork, dbsql)
            if (!workResult.success) {
                return reject({ success: false, message: 'Insert work failed', err: workResult.err })
            }
            dbsql.run(
                `INSERT INTO old_work(
                    mrid, approval_date, tested_by, ref_standard, execution_date, test_method, asset_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    approval_date = excluded.approval_date,
                    tested_by = excluded.tested_by,
                    ref_standard = excluded.ref_standard,
                    execution_date = excluded.execution_date,
                    test_method = excluded.test_method,
                    asset_id = excluded.asset_id
                `,
                [
                    oldWork.mrid,
                    oldWork.approval_date,
                    oldWork.tested_by,
                    oldWork.ref_standard,
                    oldWork.execution_date,
                    oldWork.test_method,
                    oldWork.asset_id
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert oldWork failed' })
                    return resolve({ success: true, data: oldWork, message: 'Insert oldWork completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert oldWork failed' })
        }
    })
}

// Cập nhật oldWork
export const updateOldWorkByIdTransaction = async (mrid, oldWork, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Cập nhật work trước
            const workResult = await workFunc.updateWorkByIdTransaction(mrid, oldWork, dbsql)
            if (!workResult.success) {
                return reject({ success: false, message: 'Update work failed', err: workResult.err })
            }
            dbsql.run(
                `UPDATE old_work SET
                    approval_date = ?,
                    tested_by = ?,
                    ref_standard = ?,
                    execution_date = ?,
                    test_method = ?,
                    asset_id = ?
                WHERE mrid = ?`,
                [
                    oldWork.approval_date,
                    oldWork.tested_by,
                    oldWork.ref_standard,
                    oldWork.execution_date,
                    oldWork.test_method,
                    oldWork.asset_id,
                    mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update oldWork failed' })
                    return resolve({ success: true, data: oldWork, message: 'Update oldWork completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update oldWork failed' })
        }
    })
}

// Xóa oldWork
export const deleteOldWorkByIdTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM old_work WHERE mrid=?", [mrid], function (err) {
                if (err) return reject({ success: false, err, message: 'Delete old_work failed' })
                if (this.changes === 0) return resolve({ success: false, data: null, message: 'Old_work not found' })
                // Xóa work sau khi xóa old_work
                workFunc.deleteWorkByIdTransaction(mrid, dbsql)
                return resolve({ success: true, data: null, message: 'Delete old_work completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete old_work failed' })
        }
    })
}