import db from '../../datacontext/index'
import * as measurementFunc from '../measurement/index'

// Lấy analog theo mrid
export const getAnalogById = async (mrid) => {
    try {
        const measurement = await measurementFunc.getMeasurementById(mrid)
        if (!measurement.success) {
            return { success: false, data: null, message: 'Measurement not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM analog WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get analog by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'Analog not found' })
                    return resolve({ success: true, data: { ...measurement.data, ...row }, message: 'Get analog by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get analog by id failed' }
    }
}

export const getAllAnalogByProcedure = (procedureId) => {
    try {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT a.*, m.*, io.*
                FROM measurement_procedure mp
                LEFT JOIN measurement m ON mp.measurement_id = m.mrid
                LEFT JOIN analog a ON a.mrid = m.mrid
                LEFT JOIN identified_object io ON m.mrid = io.mrid
                WHERE mp.procedure_id = ?
            `
            db.all(sql, [procedureId], (err, rows) => {
                if (err) {
                    return reject({
                        success: false,
                        err,
                        message: 'Get all analog by procedure failed'
                    })
                }
                if (!rows || rows.length === 0) {
                    return resolve({
                        success: false,
                        data: [],
                        message: 'No analog found'
                    })
                }
                return resolve({
                    success: true,
                    data: rows,
                    message: 'Get all analog by procedure completed'
                })
            })
        })
    } catch (err) {
        return { success: false, err, message: 'Get all analog by procedure failed' }
    }
}


// Thêm mới analog
export const insertAnalogTransaction = async (analog, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thêm measurement trước
            const measResult = await measurementFunc.insertMeasurementTransaction(analog, dbsql)
            if (!measResult.success) {
                return reject({ success: false, message: 'Insert measurement failed', err: measResult.err })
            }
            dbsql.run(
                `INSERT INTO analog(
                    mrid, max_value, min_value, normal_value, positive_flow_in
                ) VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    max_value = excluded.max_value,
                    min_value = excluded.min_value,
                    normal_value = excluded.normal_value,
                    positive_flow_in = excluded.positive_flow_in
                `,
                [
                    analog.mrid,
                    analog.max_value,
                    analog.min_value,
                    analog.normal_value,
                    analog.positive_flow_in
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert analog failed' })
                    return resolve({ success: true, data: analog, message: 'Insert analog completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert analog failed' })
        }
    })
}

// Thêm mới analog
export const insertAnalog = async (analog) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION', async (err) => {
                if (err) {
                    return reject({ success: false, err, message: 'Begin transaction failed' });
                }

                try {
                    // Thêm measurement trước
                    const measResult = await measurementFunc.insertMeasurementTransaction(analog, db);
                    if (!measResult.success) {
                        db.run('ROLLBACK');
                        return reject({ success: false, message: 'Insert measurement failed', err: measResult.err });
                    }

                    // Thêm hoặc update analog
                    db.run(
                        `
                        INSERT INTO analog(
                            mrid, max_value, min_value, normal_value, positive_flow_in
                        ) VALUES (?, ?, ?, ?, ?)
                        ON CONFLICT(mrid) DO UPDATE SET
                            max_value = excluded.max_value,
                            min_value = excluded.min_value,
                            normal_value = excluded.normal_value,
                            positive_flow_in = excluded.positive_flow_in
                        `,
                        [
                            analog.mrid,
                            analog.max_value,
                            analog.min_value,
                            analog.normal_value,
                            analog.positive_flow_in
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK');
                                return reject({ success: false, err, message: 'Insert analog failed' });
                            }
                            db.run('COMMIT', (err) => {
                                if (err) {
                                    return reject({ success: false, err, message: 'Commit failed' });
                                }
                                return resolve({
                                    success: true,
                                    data: analog,
                                    message: 'Insert analog completed'
                                });
                            });
                        }
                    );
                } catch (err) {
                    db.run('ROLLBACK');
                    return reject({ success: false, err, message: 'Insert analog failed (exception)' });
                }
            });
        });
    });
};

// Cập nhật analog
export const updateAnalogByIdTransaction = async (mrid, analog, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Cập nhật measurement trước
            const measResult = await measurementFunc.updateMeasurementByIdTransaction(mrid, analog, dbsql)
            if (!measResult.success) {
                return reject({ success: false, message: 'Update measurement failed', err: measResult.err })
            }
            dbsql.run(
                `UPDATE analog SET
                    max_value = ?,
                    min_value = ?,
                    normal_value = ?,
                    positive_flow_in = ?
                WHERE mrid = ?`,
                [
                    analog.max_value,
                    analog.min_value,
                    analog.normal_value,
                    analog.positive_flow_in,
                    mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update analog failed' })
                    return resolve({ success: true, data: analog, message: 'Update analog completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update analog failed' })
        }
    })
}

// Xóa analog
export const deleteAnalogByIdTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM analog WHERE mrid=?", [mrid], function (err) {
                if (err) return reject({ success: false, err, message: 'Delete analog failed' })
                if (this.changes === 0) return resolve({ success: false, data: null, message: 'Analog not found' })
                // Xóa measurement sau khi xóa analog
                measurementFunc.deleteMeasurementByIdTransaction(mrid, dbsql)
                return resolve({ success: true, data: null, message: 'Delete analog completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete analog failed' })
        }
    })
}

export const deleteAnalogById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Bắt đầu transaction
            db.run('BEGIN TRANSACTION', async (err) => {
                if (err) {
                    return reject({ success: false, err, message: 'Begin transaction failed' });
                }

                try {
                    // Xóa analog trước
                    db.run("DELETE FROM analog WHERE mrid=?", [mrid], function (err) {
                        if (err) {
                            db.run('ROLLBACK');
                            return reject({ success: false, err, message: 'Delete analog failed' });
                        }

                        if (this.changes === 0) {
                            db.run('ROLLBACK');
                            return resolve({ success: false, data: null, message: 'Analog not found' });
                        }

                        // Xóa measurement sau khi xóa analog
                        measurementFunc.deleteMeasurementByIdTransaction(mrid, db)
                            .then(() => {
                                db.run('COMMIT', (err) => {
                                    if (err) {
                                        return reject({ success: false, err, message: 'Commit failed' });
                                    }
                                    return resolve({
                                        success: true,
                                        data: null,
                                        message: 'Delete analog & measurement completed'
                                    });
                                });
                            })
                            .catch((err) => {
                                db.run('ROLLBACK');
                                return reject({ success: false, err, message: 'Delete measurement failed' });
                            });
                    });
                } catch (err) {
                    db.run('ROLLBACK');
                    return reject({ success: false, err, message: 'Delete analog transaction failed' });
                }
            });
        });
    });
};
