import db from '../../datacontext/index.js';

// ================================
// Insert ShortCircuitRating trong transaction
// ================================
export const insertShortCircuitRatingTransaction = async (scr, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO short_circuit_rating (
                mrid,
                power_transformer_info_id,
                short_circuit_current,
                duration_seconds
            ) VALUES (?, ?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                power_transformer_info_id = excluded.power_transformer_info_id,
                short_circuit_current = excluded.short_circuit_current,
                duration_seconds = excluded.duration_seconds`,
            [
                scr.mrid,
                scr.power_transformer_info_id,
                scr.short_circuit_current,
                scr.duration_seconds
            ],
            function(err) {
                if (err) {
                    return reject({
                        success: false,
                        err,
                        message: 'Insert ShortCircuitRating failed'
                    });
                }

                return resolve({
                    success: true,
                    data: scr,
                    message: 'Insert ShortCircuitRating completed'
                });
            }
        );
    });
};

// ================================
// Update ShortCircuitRating trong transaction
// ================================
export const updateShortCircuitRatingByIdTransaction = async (mrid, scr, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE short_circuit_rating SET
                power_transformer_info_id = ?,
                short_circuit_current = ?,
                duration_seconds = ?
            WHERE mrid = ?`,
            [
                scr.power_transformer_info_id,
                scr.short_circuit_current,
                scr.duration_seconds,
                mrid
            ],
            function(err) {
                if (err) {
                    return reject({
                        success: false,
                        err,
                        message: 'Update ShortCircuitRating failed'
                    });
                }

                return resolve({
                    success: true,
                    data: scr,
                    message: 'Update ShortCircuitRating completed'
                });
            }
        );
    });
};

// ================================
// Delete ShortCircuitRating trong transaction
// ================================
export const deleteShortCircuitRatingByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(`DELETE FROM short_circuit_rating WHERE mrid = ?`, [mrid], function(err) {
            if (err) {
                return reject({
                    success: false,
                    err,
                    message: 'Delete ShortCircuitRating failed'
                });
            }

            return resolve({
                success: true,
                message: 'Delete ShortCircuitRating completed'
            });
        });
    });
};

// ================================
// Get ShortCircuitRating (không transaction)
// ================================
export const getShortCircuitRatingById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM short_circuit_rating WHERE mrid = ?`,
            [mrid],
            (err, row) => {
                if (err) {
                    return reject({
                        success: false,
                        err,
                        message: 'Get ShortCircuitRating failed'
                    });
                }

                if (!row) {
                    return resolve({
                        success: false,
                        data: null,
                        message: 'ShortCircuitRating not found'
                    });
                }

                return resolve({
                    success: true,
                    data: row,
                    message: 'Get ShortCircuitRating completed'
                });
            }
        );
    });
};

// ================================
// Get ShortCircuitRating theo power_transformer_info_id (không transaction)
// ================================
export const getShortCircuitRatingByPowerTransformerInfoId = async (powerTransformerInfoId) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM short_circuit_rating WHERE power_transformer_info_id = ?`,
            [powerTransformerInfoId],
            (err, rows) => {
                if (err) {
                    return reject({
                        success: false,
                        err,
                        message: 'Get ShortCircuitRating by PowerTransformerInfoId failed'
                    });
                }

                if (!rows) {
                    return resolve({
                        success: false,
                        data: null,
                        message: 'No ShortCircuitRating found for this PowerTransformerInfoId'
                    });
                }

                return resolve({
                    success: true,
                    data: rows,
                    message: 'Get ShortCircuitRating by PowerTransformerInfoId completed'
                });
            }
        );
    });
};
