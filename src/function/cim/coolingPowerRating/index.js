import db from '../../datacontext/index'
import * as IdentifiedObjectFunc from '../identifiedObject/index.js'

// Lấy coolingPowerRating theo mrid
export const getCoolingPowerRatingById = async (mrid) => {
    try {
        const identifiedObjectResult = await IdentifiedObjectFunc.getIdentifiedObjectById(mrid)
        if (!identifiedObjectResult.success) {
            return { success: false, data: null, message: 'IdentifiedObject not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM cooling_power_rating WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get coolingPowerRating by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'CoolingPowerRating not found' })
                    return resolve({ success: true, data: { ...identifiedObjectResult.data, ...row }, message: 'Get coolingPowerRating by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get coolingPowerRating by id failed' }
    }
}

export const getCoolingPowerRatingByPowerTransformerInfoId = async (powerTransformerInfoId) => {
    try {
        const rows = await new Promise((resolve, reject) => {
            db.all(
                `
                SELECT
                    cpr.*,
                    io.*
                FROM cooling_power_rating cpr
                LEFT JOIN identified_object io
                    ON io.mrid = cpr.mrid
                WHERE cpr.power_transformer_info_id = ?
                `,
                [powerTransformerInfoId],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows);
                }
            );
        });

        if (!rows || rows.length === 0) {
            return {
                success: false,
                data: [],
                message: 'No coolingPowerRating found for this powerTransformerInfoId'
            };
        }

        return {
            success: true,
            data: rows,
            message: 'Get coolingPowerRating by powerTransformerInfoId completed'
        };
    } catch (err) {
        return {
            success: false,
            err,
            data: [],
            message: 'Get coolingPowerRating by powerTransformerInfoId failed'
        };
    }
}


// Thêm mới coolingPowerRating (transaction)
export const insertCoolingPowerRatingTransaction = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const identifiedObjectResult = await IdentifiedObjectFunc.insertIdentifiedObjectTransaction(info, dbsql)
            if (!identifiedObjectResult.success) {
                return reject({ success: false, message: 'Insert IdentifiedObject failed', err: identifiedObjectResult.err })
            }
            dbsql.run(
                `INSERT INTO cooling_power_rating(
                    mrid, power_rating, stage, cooling_kind, temp_rise_wind, power_transformer_info_id
                ) VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    power_rating = excluded.power_rating,
                    stage = excluded.stage,
                    cooling_kind = excluded.cooling_kind,
                    temp_rise_wind = excluded.temp_rise_wind,
                    power_transformer_info_id = excluded.power_transformer_info_id
                `,
                [
                    info.mrid,
                    info.power_rating,
                    info.stage,
                    info.cooling_kind,
                    info.temp_rise_wind,
                    info.power_transformer_info_id
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Insert coolingPowerRating failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert coolingPowerRating completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert coolingPowerRating transaction failed' })
        }
    })
}

// Cập nhật coolingPowerRating (transaction)
export const updateCoolingPowerRatingTransaction = async (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const identifiedObjectResult = await IdentifiedObjectFunc.updateIdentifiedObjectTransaction(mrid, info, dbsql)
            if (!identifiedObjectResult.success) {
                return reject({ success: false, message: 'Update IdentifiedObject failed', err: identifiedObjectResult.err })
            }
            dbsql.run(
                `UPDATE cooling_power_rating SET
                    power_rating = ?,
                    stage = ?,
                    cooling_kind = ?,
                    temp_rise_wind = ?,
                    power_transformer_info_id = ?
                WHERE mrid = ?`,
                [
                    info.power_rating,
                    info.stage,
                    info.cooling_kind,
                    info.temp_rise_wind,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Update coolingPowerRating failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Update coolingPowerRating completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update coolingPowerRating transaction failed' })
        }
    })
}

// Xóa coolingPowerRating (transaction)
export const deleteCoolingPowerRatingTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const identifiedObjectResult = await IdentifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, dbsql)
            if (!identifiedObjectResult.success) {
                return reject({ success: false, message: 'Delete IdentifiedObject failed', err: identifiedObjectResult.err })
            }
            dbsql.run("DELETE FROM cooling_power_rating WHERE mrid=?", [mrid], function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Delete coolingPowerRating failed' })
                }
                return resolve({ success: true, data: mrid, message: 'Delete coolingPowerRating completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete coolingPowerRating transaction failed' })
        }
    })
}