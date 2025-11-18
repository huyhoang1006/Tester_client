import db from '../../datacontext/index.js';
import * as identifiedObjectFunc from '../identifiedObject/index.js';

// Insert BasePower trong transaction (cho lớp cha gọi)
export const insertBasePowerTransaction = async (basePower, dbsql) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.insertIdentifiedObjectTransaction(basePower, dbsql)
            .then(result => {
                if (!result.success) {
                    return reject({
                        success: false,
                        message: 'Insert identified object failed',
                        err: result.err
                    });
                }

                dbsql.run(
                    `INSERT INTO base_power (
                        mrid,
                        base_power
                    ) VALUES (?, ?)
                    ON CONFLICT(mrid) DO UPDATE SET
                        base_power = excluded.base_power`,
                    [
                        basePower.mrid,
                        basePower.base_power
                    ],
                    function (err) {
                        if (err) {
                            return reject({
                                success: false,
                                err,
                                message: 'Insert basePower failed'
                            });
                        }

                        return resolve({
                            success: true,
                            data: basePower,
                            message: 'Insert basePower completed'
                        });
                    }
                );
            })
            .catch(err => {
                return reject({
                    success: false,
                    err,
                    message: 'Insert basePower transaction failed'
                });
            });
    });
};

// Update BasePower trong transaction (cho lớp cha gọi)
export const updateBasePowerByIdTransaction = async (mrid, basePower, dbsql) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, basePower, dbsql)
            .then(result => {
                if (!result.success) {
                    return reject({
                        success: false,
                        message: 'Update identified object failed',
                        err: result.err
                    });
                }

                dbsql.run(
                    `UPDATE base_power SET
                        base_power = ?
                    WHERE mrid = ?`,
                    [
                        basePower.base_power,
                        mrid
                    ],
                    function (err) {
                        if (err) {
                            return reject({
                                success: false,
                                err,
                                message: 'Update basePower failed'
                            });
                        }

                        return resolve({
                            success: true,
                            data: basePower,
                            message: 'Update basePower completed'
                        });
                    }
                );
            })
            .catch(err => {
                return reject({
                    success: false,
                    err,
                    message: 'Update basePower transaction failed'
                });
            });
    });
};

// Delete BasePower trong transaction (xóa base_power trước, sau đó xóa cha)
export const deleteBasePowerByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(`DELETE FROM base_power WHERE mrid = ?`, [mrid], function(err) {
            if (err) {
                return reject({
                    success: false,
                    err,
                    message: 'Delete basePower failed'
                });
            }
            // Sau đó xóa IdentifiedObject
            identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, dbsql)
                .then(result => resolve(result))
                .catch(err => reject({
                    success: false,
                    err,
                    message: 'Delete identified object failed after basePower delete'
                }));
        });
    });
};

// Get BasePower (không cần transaction)
export const getBasePowerById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT bp.*, io.* FROM base_power bp
             LEFT JOIN identified_object io ON bp.mrid = io.mrid
             WHERE bp.mrid = ?`,
            [mrid],
            (err, row) => {
                if (err) {
                    return reject({
                        success: false,
                        err,
                        message: 'Get basePower failed'
                    });
                }

                if (!row) {
                    return resolve({
                        success: false,
                        data: null,
                        message: 'BasePower not found'
                    });
                }

                return resolve({
                    success: true,
                    data: row,
                    message: 'Get basePower completed'
                });
            }
        );
    });
};
