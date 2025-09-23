import db from '../../datacontext/index'
import * as IdentifiedObjectFunc from '../identifiedObject/index.js'

// Lấy reconditioning theo mrid
export const getReconditioningById = async (mrid) => {
    try {
        const identifiedObjectResult = await IdentifiedObjectFunc.getIdentifiedObjectById(mrid)
        if (!identifiedObjectResult.success) {
            return { success: false, data: null, message: 'IdentifiedObject not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM reconditioning WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get reconditioning by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'Reconditioning not found' })
                    return resolve({ success: true, data: { ...identifiedObjectResult.data, ...row }, message: 'Get reconditioning by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get reconditioning by id failed' }
    }
}

// Thêm mới reconditioning (transaction)
export const insertReconditioningTransaction = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const identifiedObjectResult = await IdentifiedObjectFunc.insertIdentifiedObjectTransaction(info, dbsql)
            if (!identifiedObjectResult.success) {
                return reject({ success: false, message: 'Insert IdentifiedObject failed', err: identifiedObjectResult.err })
            }
            dbsql.run(
                `INSERT INTO reconditioning(
                    mrid, asset, date_time
                ) VALUES (?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    asset = excluded.asset,
                    date_time = excluded.date_time
                `,
                [
                    info.mrid,
                    info.asset,
                    info.date_time
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Insert reconditioning failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert reconditioning completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert reconditioning transaction failed' })
        }
    })
}

// Cập nhật reconditioning (transaction)
export const updateReconditioningTransaction = async (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const identifiedObjectResult = await IdentifiedObjectFunc.updateIdentifiedObjectTransaction(mrid, info, dbsql)
            if (!identifiedObjectResult.success) {
                return reject({ success: false, message: 'Update IdentifiedObject failed', err: identifiedObjectResult.err })
            }
            dbsql.run(
                `UPDATE reconditioning SET
                    asset = ?,
                    date_time = ?
                WHERE mrid = ?`,
                [
                    info.asset,
                    info.date_time,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Update reconditioning failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Update reconditioning completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update reconditioning transaction failed' })
        }
    })
}

// Xóa reconditioning (transaction)
export const deleteReconditioningTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const identifiedObjectResult = await IdentifiedObjectFunc.deleteIdentifiedObjectTransaction(mrid, dbsql)
            if (!identifiedObjectResult.success) {
                return reject({ success: false, message: 'Delete IdentifiedObject failed', err: identifiedObjectResult.err })
            }
            dbsql.run("DELETE FROM reconditioning WHERE mrid=?", [mrid], function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Delete reconditioning failed' })
                }
                return resolve({ success: true, data: mrid, message: 'Delete reconditioning completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete reconditioning transaction failed' })
        }
    })
}