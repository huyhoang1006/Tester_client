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

export const getValueAliasSetAndValueToAliasById = async (mrid) => {
    try {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    vas.*, 
                    io.*, 
                    vta.mrid AS vta_mrid, 
                    vta.value,
                    io_vta.name AS vta_name,
                    io_vta.alias_name AS vta_alias
                FROM value_alias_set vas
                LEFT JOIN identified_object io ON vas.mrid = io.mrid
                LEFT JOIN value_to_alias vta ON vas.mrid = vta.value_alias_set
                LEFT JOIN identified_object io_vta ON vta.mrid = io_vta.mrid
                WHERE vas.mrid = ?
            `;
            db.all(sql, [mrid], (err, rows) => {
                if (err) {
                    return reject({ success: false, err, message: 'Get valueAliasSet by id failed' });
                }
                if (!rows || rows.length === 0) {
                    return resolve({ success: false, data: null, message: 'ValueAliasSet not found' });
                }

                // Gom dữ liệu
                const row0 = rows[0];
                const valueAliasSet = {
                    mrid: row0.mrid,
                    name: row0.name,
                    alias_name: row0.alias_name,
                    description: row0.description,
                    // ... các trường khác của value_alias_set + io
                    value_to_aliases: rows
                        .filter(r => r.vta_mrid) // loại bỏ nếu không có vta
                        .map(r => ({
                            mrid: r.vta_mrid,
                            value: r.value,
                            name: r.vta_name,
                            alias: r.vta_alias
                        }))
                };

                return resolve({
                    success: true,
                    data: valueAliasSet,
                    message: 'Get valueAliasSet by id completed'
                });
            });
        });
    } catch (err) {
        return { success: false, err, message: 'Get valueAliasSet by id failed' };
    }
};


export const getValueAliasSetByIds = async (mridArray) => {
    try {
        if (!Array.isArray(mridArray) || mridArray.length === 0) {
            return { success: false, data: [], message: 'Empty mrid array' };
        }

        return new Promise((resolve, reject) => {
            // tạo placeholders (?,?,?,...) dựa vào số lượng phần tử
            const placeholders = mridArray.map(() => '?').join(',');

            const sql = `
                SELECT vas.*, io.*
                FROM value_alias_set vas
                LEFT JOIN identified_object io ON vas.mrid = io.mrid
                WHERE vas.mrid IN (${placeholders})
            `;

            db.all(sql, mridArray, (err, rows) => {
                if (err) {
                    return reject({ success: false, err, message: 'Get valueAliasSet by ids failed' });
                }
                if (!rows || rows.length === 0) {
                    return resolve({ success: false, data: [], message: 'No ValueAliasSet found' });
                }
                return resolve({
                    success: true,
                    data: rows,
                    message: 'Get valueAliasSet by ids completed'
                });
            });
        });
    } catch (err) {
        return { success: false, err, message: 'Get valueAliasSet by ids failed' };
    }
};


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