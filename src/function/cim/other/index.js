import db from '../../datacontext/index'
import * as IdentifiedObjectFunc from '../identifiedObject/index.js'

// Lấy thông tin other theo mrid
export const getOtherById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM other WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get other by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Other not found' })
            return resolve({ success: true, data: row, message: 'Get other by id completed' })
        })
    })
}

// Lấy danh sách other theo danh sách mrid
export const getOtherByIds = async (mrids) => {
    return new Promise((resolve, reject) => {
        if (!mrids || mrids.length === 0) {
            return resolve({ success: false, data: [], message: 'No mrids provided' })
        }

        const placeholders = mrids.map(() => '?').join(',')

        db.all(
            `SELECT * FROM other WHERE mrid IN (${placeholders})`,
            mrids,
            (err, rows) => {
                if (err) {
                    return reject({ success: false, err: err, message: 'Get other by ids failed' })
                }
                if (!rows || rows.length === 0) {
                    return resolve({ success: false, data: [], message: 'Other not found' })
                }
                return resolve({ success: true, data: rows, message: 'Get other by ids completed' })
            }
        )
    })
}

// Lấy other theo power_transformer_info_id
export const getOtherByPowerTransformerInfoId = async (powerTransformerInfoId) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM other WHERE power_transformer_info_id=?", [powerTransformerInfoId], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get other by power_transformer_info_id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Other not found' })
            return resolve({ success: true, data: row, message: 'Get other by power_transformer_info_id completed' })
        })
    })
}

// Thêm mới other
export const insertOther = async (other) => {
    return new Promise(async (resolve, reject) => {
        try {
            const identifiedObjectResult = await IdentifiedObjectFunc.insertIdentifiedObject(other)
            if (!identifiedObjectResult.success) {
                return reject({ success: false, message: 'Insert identifiedObject failed', err: identifiedObjectResult.err })
            }

            db.run(
                `INSERT OR REPLACE INTO other(mrid, category, insulation_medium, insulation_weight, insulation_volume, power_transformer_info_id, insulation_key, tank_type)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    other.mrid,
                    other.category || null,
                    other.insulation_medium || null,
                    other.insulation_weight || null,
                    other.insulation_volume || null,
                    other.power_transformer_info_id || null,
                    other.insulation_key || null,
                    other.tank_type || null
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err: err, message: 'Insert other failed' })
                    }
                    return resolve({ success: true, data: other, message: 'Insert other completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err: err, message: 'Insert other failed' })
        }
    })
}

// Thêm mới other (transaction)
export const insertOtherTransaction = async (other, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Ensure table has PRIMARY KEY on mrid
            dbsql.run(`CREATE TABLE IF NOT EXISTS other(
                mrid TEXT PRIMARY KEY,
                category TEXT,
                insulation_medium TEXT,
                insulation_weight TEXT,
                insulation_volume TEXT,
                power_transformer_info_id TEXT,
                insulation_key TEXT,
                tank_type TEXT
            )`, [], function(err) {
                if (err && !err.message.includes('already exists')) {
                    console.warn('Create table warning:', err.message);
                }
            });

            const identifiedObjectResult = await IdentifiedObjectFunc.insertIdentifiedObjectTransaction(other, dbsql)
            if (!identifiedObjectResult.success) {
                return reject({ success: false, message: 'Insert identifiedObject failed', err: identifiedObjectResult.err })
            }

            dbsql.run(
                `INSERT OR REPLACE INTO other(mrid, category, insulation_medium, insulation_weight, insulation_volume, power_transformer_info_id, insulation_key, tank_type)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    other.mrid,
                    other.category || null,
                    other.insulation_medium || null,
                    other.insulation_weight || null,
                    other.insulation_volume || null,
                    other.power_transformer_info_id || null,
                    other.insulation_key || null,
                    other.tank_type || null
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err: err, message: 'Insert other failed' })
                    }
                    return resolve({ success: true, data: other, message: 'Insert other completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err: err, message: 'Insert other transaction failed' })
        }
    })
}

// Cập nhật other
export const updateOtherById = async (mrid, other) => {
    return new Promise(async (resolve, reject) => {
        try {
            const identifiedObjectResult = await IdentifiedObjectFunc.updateIdentifiedObjectById(mrid, other)
            if (!identifiedObjectResult.success) {
                return reject({ success: false, message: 'Update identifiedObject failed', err: identifiedObjectResult.err })
            }

            db.run(
                `UPDATE other
                 SET category = ?, insulation_medium = ?, insulation_weight = ?, insulation_volume = ?, power_transformer_info_id = ?, insulation_key = ?, tank_type = ?
                 WHERE mrid = ?`,
                [
                    other.category,
                    other.insulation_medium,
                    other.insulation_weight,
                    other.insulation_volume,
                    other.power_transformer_info_id,
                    other.insulation_key,
                    other.tank_type,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err: err, message: 'Update other failed' })
                    }
                    return resolve({ success: true, data: other, message: 'Update other completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err: err, message: 'Update other failed' })
        }
    })
}

// Cập nhật other (transaction)
export const updateOtherByIdTransaction = async (mrid, other, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const identifiedObjectResult = await IdentifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, other, dbsql)
            if (!identifiedObjectResult.success) {
                return reject({ success: false, message: 'Update identifiedObject failed', err: identifiedObjectResult.err })
            }

            dbsql.run(
                `UPDATE other
                 SET category = ?, insulation_medium = ?, insulation_weight = ?, insulation_volume = ?, power_transformer_info_id = ?, insulation_key = ?, tank_type = ?
                 WHERE mrid = ?`,
                [
                    other.category,
                    other.insulation_medium,
                    other.insulation_weight,
                    other.insulation_volume,
                    other.power_transformer_info_id,
                    other.insulation_key,
                    other.tank_type,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err: err, message: 'Update other failed' })
                    }
                    return resolve({ success: true, data: other, message: 'Update other completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err: err, message: 'Update other transaction failed' })
        }
    })
}

// Xóa other theo mrid
export const deleteOtherById = async (mrid) => {
    return new Promise(async (resolve, reject) => {
        try {
            const identifiedObjectResult = await IdentifiedObjectFunc.deleteIdentifiedObjectById(mrid)
            if (!identifiedObjectResult.success) {
                return reject({ success: false, message: 'Delete identifiedObject failed', err: identifiedObjectResult.err })
            }

            db.run("DELETE FROM other WHERE mrid=?", [mrid], function (err) {
                if (err) {
                    return reject({ success: false, err: err, message: 'Delete other failed' })
                }
                return resolve({ success: true, data: mrid, message: 'Delete other completed' })
            })
        } catch (err) {
            return reject({ success: false, err: err, message: 'Delete other failed' })
        }
    })
}

// Xóa other theo mrid (transaction)
export const deleteOtherByIdTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const identifiedObjectResult = await IdentifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, dbsql)
            if (!identifiedObjectResult.success) {
                return reject({ success: false, message: 'Delete identifiedObject failed', err: identifiedObjectResult.err })
            }

            dbsql.run("DELETE FROM other WHERE mrid=?", [mrid], function (err) {
                if (err) {
                    return reject({ success: false, err: err, message: 'Delete other failed' })
                }
                return resolve({ success: true, data: mrid, message: 'Delete other completed' })
            })
        } catch (err) {
            return reject({ success: false, err: err, message: 'Delete other transaction failed' })
        }
    })
}
