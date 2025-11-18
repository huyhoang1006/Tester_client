import db from '../../datacontext/index.js';
import * as identifiedObjectFunc from '../identifiedObject/index.js';

// Insert TransformerTest trong transaction (cho lớp cha gọi)
export const insertTransformerTestTransaction = async (tt, dbsql) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.insertIdentifiedObjectTransaction(tt, dbsql)
            .then(result => {
                if (!result.success) {
                    return reject({
                        success: false,
                        message: 'Insert identified object failed',
                        err: result.err
                    });
                }

                dbsql.run(
                    `INSERT INTO transformer_test (
                        mrid,
                        base_power,
                        base_voltage,
                        temperature
                    ) VALUES (?, ?, ?, ?)
                    ON CONFLICT(mrid) DO UPDATE SET
                        base_power = excluded.base_power,
                        base_voltage = excluded.base_voltage,
                        temperature = excluded.temperature`,
                    [
                        tt.mrid,
                        tt.base_power,
                        tt.base_voltage,
                        tt.temperature
                    ],
                    function(err) {
                        if (err) {
                            return reject({
                                success: false,
                                err,
                                message: 'Insert TransformerTest failed'
                            });
                        }

                        return resolve({
                            success: true,
                            data: tt,
                            message: 'Insert TransformerTest completed'
                        });
                    }
                );
            })
            .catch(err => {
                return reject({
                    success: false,
                    err,
                    message: 'Insert TransformerTest transaction failed'
                });
            });
    });
};

// Update TransformerTest trong transaction (cho lớp cha gọi)
export const updateTransformerTestByIdTransaction = async (mrid, tt, dbsql) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, tt, dbsql)
            .then(result => {
                if (!result.success) {
                    return reject({
                        success: false,
                        message: 'Update identified object failed',
                        err: result.err
                    });
                }

                dbsql.run(
                    `UPDATE transformer_test SET
                        base_power = ?,
                        base_voltage = ?,
                        temperature = ?
                    WHERE mrid = ?`,
                    [
                        tt.base_power,
                        tt.base_voltage,
                        tt.temperature,
                        mrid
                    ],
                    function(err) {
                        if (err) {
                            return reject({
                                success: false,
                                err,
                                message: 'Update TransformerTest failed'
                            });
                        }

                        return resolve({
                            success: true,
                            data: tt,
                            message: 'Update TransformerTest completed'
                        });
                    }
                );
            })
            .catch(err => {
                return reject({
                    success: false,
                    err,
                    message: 'Update TransformerTest transaction failed'
                });
            });
    });
};

// Delete TransformerTest trong transaction (xóa trước bảng transformer_test, sau đó xóa IdentifiedObject)
export const deleteTransformerTestByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(`DELETE FROM transformer_test WHERE mrid = ?`, [mrid], function(err) {
            if (err) {
                return reject({
                    success: false,
                    err,
                    message: 'Delete TransformerTest failed'
                });
            }

            // Sau đó xóa IdentifiedObject
            identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, dbsql)
                .then(result => resolve(result))
                .catch(err => reject({
                    success: false,
                    err,
                    message: 'Delete IdentifiedObject failed after TransformerTest delete'
                }));
        });
    });
};

// Get TransformerTest (không transaction)
export const getTransformerTestById = async (mrid) => {
    try {
        // Lấy dữ liệu cha
        const identifiedResult = await identifiedObjectFunc.getIdentifiedObjectById(mrid);
        if (!identifiedResult.success) {
            return { success: false, data: null, message: 'Identified object not found' };
        }

        // Lấy dữ liệu TransformerTest
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM transformer_test WHERE mrid = ?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get TransformerTest failed' });
                    if (!row) return resolve({ success: false, data: null, message: 'TransformerTest not found' });

                    const data = { ...identifiedResult.data, ...row };
                    return resolve({ success: true, data, message: 'Get TransformerTest completed' });
                }
            );
        });
    } catch (err) {
        return { success: false, err, message: 'Get TransformerTest failed' };
    }
};
