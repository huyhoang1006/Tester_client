import db from '../../datacontext/index'
import * as identifiedObjectFunc from '../identifiedObject/index'

// Lấy valueToAlias theo mrid
export const getValueToAliasById = async (mrid) => {
    try {
        const identifiedObject = await identifiedObjectFunc.getIdentifiedObjectById(mrid)
        if (!identifiedObject.success) {
            return { success: false, data: null, message: 'IdentifiedObject not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM value_to_alias WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get valueToAlias by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'ValueToAlias not found' })
                    return resolve({ success: true, data: { ...identifiedObject.data, ...row }, message: 'Get valueToAlias by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get valueToAlias by id failed' }
    }
}

export const getValueToAliasByValueAliasSetId = async (valueAliasSetId) => {
    try {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT vta.*, io.*
                FROM value_to_alias vta
                LEFT JOIN identified_object io ON vta.mrid = io.mrid
                WHERE vta.value_alias_set = ?
            `;

            db.all(sql, [valueAliasSetId], (err, rows) => {
                if (err) {
                    return reject({ success: false, err, message: 'Get valueToAlias by valueAliasSetId failed' });
                }
                if (!rows || rows.length === 0) {
                    return resolve({ success: false, data: [], message: 'No ValueToAlias found' });
                }

                // rows sẽ chứa thông tin của cả value_to_alias và identified_object
                return resolve({ success: true, data: rows, message: 'Get valueToAlias by valueAliasSetId completed' });
            });
        });
    } catch (err) {
        return { success: false, err, message: 'Get valueToAlias by valueAliasSetId failed' };
    }
};


// Thêm mới valueToAlias
export const insertValueToAliasTransaction = async (valueToAlias, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thêm identifiedObject trước
            const idObjResult = await identifiedObjectFunc.insertIdentifiedObjectTransaction(valueToAlias, dbsql)
            if (!idObjResult.success) {
                return reject({ success: false, message: 'Insert identifiedObject failed', err: idObjResult.err })
            }
            dbsql.run(
                `INSERT INTO value_to_alias(
                    mrid, value, value_alias_set
                ) VALUES (?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    value = excluded.value,
                    value_alias_set = excluded.value_alias_set
                `,
                [
                    valueToAlias.mrid,
                    valueToAlias.value,
                    valueToAlias.value_alias_set
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert valueToAlias failed' })
                    return resolve({ success: true, data: valueToAlias, message: 'Insert valueToAlias completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert valueToAlias failed' })
        }
    })
}

// Cập nhật valueToAlias
export const updateValueToAliasByIdTransaction = async (mrid, valueToAlias, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Cập nhật identifiedObject trước
            const idObjResult = await identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, valueToAlias, dbsql)
            if (!idObjResult.success) {
                return reject({ success: false, message: 'Update identifiedObject failed', err: idObjResult.err })
            }
            dbsql.run(
                `UPDATE value_to_alias SET
                    value = ?,
                    value_alias_set = ?
                WHERE mrid = ?`,
                [
                    valueToAlias.value,
                    valueToAlias.value_alias_set,
                    mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update valueToAlias failed' })
                    return resolve({ success: true, data: valueToAlias, message: 'Update valueToAlias completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update valueToAlias failed' })
        }
    })
}

// Xóa valueToAlias
export const deleteValueToAliasByIdTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM value_to_alias WHERE mrid=?", [mrid], function (err) {
                if (err) return reject({ success: false, err, message: 'Delete valueToAlias failed' })
                if (this.changes === 0) return resolve({ success: false, data: null, message: 'ValueToAlias not found' })
                // Xóa identifiedObject sau khi xóa valueToAlias
                identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, dbsql)
                return resolve({ success: true, data: null, message: 'Delete valueToAlias completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete valueToAlias failed'})
        }
    })
}