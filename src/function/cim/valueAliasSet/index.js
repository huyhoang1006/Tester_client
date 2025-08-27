import db from '../../datacontext/index'
import * as identifiedObjectFunc from '../identifiedObject/index'

// Lấy valueAliasSet theo mrid
export const getValueAliasSetById = async (mrid) => {
    try {
        const identifiedObject = await identifiedObjectFunc.getIdentifiedObjectById(mrid)
        if (!identifiedObject.success) {
            return { success: false, data: null, message: 'IdentifiedObject not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM value_alias_set WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get valueAliasSet by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'ValueAliasSet not found' })
                    return resolve({ success: true, data: { ...identifiedObject.data, ...row }, message: 'Get valueAliasSet by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get valueAliasSet by id failed' }
    }
}

// Thêm mới valueAliasSet
export const insertValueAliasSetTransaction = async (valueAliasSet, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thêm identifiedObject trước
            const idObjResult = await identifiedObjectFunc.insertIdentifiedObjectTransaction(valueAliasSet, dbsql)
            if (!idObjResult.success) {
                return reject({ success: false, message: 'Insert identifiedObject failed', err: idObjResult.err })
            }
            dbsql.run(
                `INSERT INTO value_alias_set(
                    mrid
                ) VALUES (?)
                ON CONFLICT(mrid) DO UPDATE SET
                    mrid = excluded.mrid
                `,
                [
                    valueAliasSet.mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert valueAliasSet failed' })
                    return resolve({ success: true, data: valueAliasSet, message: 'Insert valueAliasSet completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert valueAliasSet failed' })
        }
    })
}

// Cập nhật valueAliasSet
export const updateValueAliasSetByIdTransaction = async (mrid, valueAliasSet, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Cập nhật identifiedObject trước
            const idObjResult = await identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, valueAliasSet, dbsql)
            if (!idObjResult.success) {
                return reject({ success: false, message: 'Update identifiedObject failed', err: idObjResult.err })
            }
            dbsql.run(
                `UPDATE value_alias_set SET
                    mrid = ?
                WHERE mrid = ?`,
                [
                    valueAliasSet.mrid,
                    mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update valueAliasSet failed' })
                    return resolve({ success: true, data: valueAliasSet, message: 'Update valueAliasSet completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update valueAliasSet failed' })
        }
    })
}

// Xóa valueAliasSet
export const deleteValueAliasSetByIdTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM value_alias_set WHERE mrid=?", [mrid], function (err) {
                if (err) return reject({ success: false, err, message: 'Delete valueAliasSet failed' })
                if (this.changes === 0) return resolve({ success: false, data: null, message: 'ValueAliasSet not found' })
                // Xóa identifiedObject sau khi xóa valueAliasSet
                identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, dbsql)
                return resolve({ success: true, data: null, message: 'Delete valueAliasSet completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete valueAliasSet failed' })
        }
    })
}