import db from '../../datacontext/index'
import * as MeasurementFunc from '../measurement/index.js'

// Lấy discrete theo mrid
export const getDiscreteById = async (mrid) => {
    try {
        const measurementResult = await MeasurementFunc.getMeasurementById(mrid)
        if (!measurementResult.success) {
            return { success: false, data: null, message: 'Measurement not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM discrete WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get discrete by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'Discrete not found' })
                    return resolve({ success: true, data: { ...measurementResult.data, ...row }, message: 'Get discrete by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get discrete by id failed' }
    }
}

export const getAllDiscreteByProcedure = (procedureId) => {
    try {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT d.*, m.*, io.*
                FROM measurement_procedure mp
                LEFT JOIN measurement m ON mp.measurement_id = m.mrid
                LEFT JOIN discrete d ON d.mrid = m.mrid
                LEFT JOIN identified_object io ON m.mrid = io.mrid
                WHERE mp.procedure_id = ?
            `
            db.all(sql, [procedureId], (err, rows) => {
                if (err) {
                    return reject({
                        success: false,
                        err,
                        message: 'Get all discrete by procedure failed'
                    })
                }
                if (!rows || rows.length === 0) {
                    return resolve({
                        success: false,
                        data: [],
                        message: 'No discrete found'
                    })
                }
                return resolve({
                    success: true,
                    data: rows,
                    message: 'Get all discrete by procedure completed'
                })
            })
        })
    } catch (err) {
        return { success: false, err, message: 'Get all discrete by procedure failed' }
    }
}

// Thêm mới discrete (transaction)
export const insertDiscreteTransaction = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const measurementResult = await MeasurementFunc.insertMeasurementTransaction(info, dbsql)
            if (!measurementResult.success) {
                return reject({ success: false, message: 'Insert measurement failed', err: measurementResult.err })
            }
            dbsql.run(
                `INSERT INTO discrete(
                    mrid, max_value, min_value, normal_value, value_alias_set
                ) VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    max_value = excluded.max_value,
                    min_value = excluded.min_value,
                    normal_value = excluded.normal_value,
                    value_alias_set = excluded.value_alias_set
                `,
                [
                    info.mrid,
                    info.max_value,
                    info.min_value,
                    info.normal_value,
                    info.value_alias_set
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Insert discrete failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert discrete completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert discrete transaction failed' })
        }
    })
}

export const insertDiscrete = async (info) => {
    return new Promise(async (resolve, reject) => {
        db.serialize(async () => {
            db.run('BEGIN TRANSACTION');
            try {
                // Thêm measurement trước
                const measurementResult = await MeasurementFunc.insertMeasurementTransaction(info, db);
                if (!measurementResult.success) {
                    db.run('ROLLBACK');
                    return reject({ success: false, message: 'Insert measurement failed', err: measurementResult.err });
                }
                db.run(
                    `INSERT INTO discrete(
                        mrid, max_value, min_value, normal_value, value_alias_set
                    ) VALUES (?, ?, ?, ?, ?)
                    ON CONFLICT(mrid) DO UPDATE SET
                        max_value = excluded.max_value,
                        min_value = excluded.min_value,
                        normal_value = excluded.normal_value,
                        value_alias_set = excluded.value_alias_set
                    `,
                    [
                        info.mrid,
                        info.max_value,
                        info.min_value,
                        info.normal_value,
                        info.value_alias_set
                    ],
                    function (err) {
                        if (err) {
                            db.run('ROLLBACK');
                            return reject({ success: false, err, message: 'Insert discrete failed' });
                        }
                        db.run('COMMIT');
                        return resolve({ success: true, data: info, message: 'Insert discrete completed' });
                    }
                );
            } catch (err) {
                db.run('ROLLBACK');
                return reject({ success: false, err, message: 'Insert discrete failed' });
            }
        });
    });
}

// Cập nhật discrete (transaction)
export const updateDiscreteByIdTransaction = async (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const measurementResult = await MeasurementFunc.updateMeasurementByIdTransaction(mrid, info, dbsql)
            if (!measurementResult.success) {
                return reject({ success: false, message: 'Update measurement failed', err: measurementResult.err })
            }
            dbsql.run(
                `UPDATE discrete SET
                    max_value = ?,
                    min_value = ?,
                    normal_value = ?,
                    value_alias_set = ?
                WHERE mrid = ?`,
                [
                    info.max_value,
                    info.min_value,
                    info.normal_value,
                    info.value_alias_set,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Update discrete failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Update discrete completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update discrete transaction failed' })
        }
    })
}

// Xóa discrete (transaction)
export const deleteDiscreteByIdTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Xóa discrete trước
            dbsql.run("DELETE FROM discrete WHERE mrid=?", [mrid], function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Delete discrete failed' })
                }
                // Sau đó xóa measurement
                MeasurementFunc.deleteMeasurementByIdTransaction(mrid, dbsql)
                    .then(measurementResult => {
                        if (!measurementResult.success) {
                            return reject({ success: false, message: 'Delete measurement failed', err: measurementResult.err })
                        }
                        return resolve({ success: true, data: mrid, message: 'Delete discrete completed' })
                    })
                    .catch(error => {
                        return reject({ success: false, err: error, message: 'Delete measurement transaction failed' })
                    });
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete discrete transaction failed' })
        }
    })
}

export const deleteDiscreteById = async (mrid) => {
    return new Promise(async (resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            // Xóa discrete trước
            db.run("DELETE FROM discrete WHERE mrid=?", [mrid], function (err) {
                if (err) {
                    db.run('ROLLBACK');
                    return reject({ success: false, err, message: 'Delete discrete failed' });
                }
                // Sau đó xóa measurement
                MeasurementFunc.deleteMeasurementByIdTransaction(mrid, db)
                    .then(measurementResult => {
                        if (!measurementResult.success) {
                            db.run('ROLLBACK');
                            return reject({ success: false, message: 'Delete measurement failed', err: measurementResult.err });
                        }
                        db.run('COMMIT');
                        return resolve({ success: true, data: mrid, message: 'Delete discrete completed' });
                    })
                    .catch(error => {
                        db.run('ROLLBACK');
                        return reject({ success: false, err: error, message: 'Delete measurement transaction failed' });
                    });
            });
        });
    });
}