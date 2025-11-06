import db from '../../datacontext/index'
import * as OperatingMechanismFunc from '../operatingMechanism/index.js'

// Lấy oldOperatingMechanism theo mrid
export const getOldOperatingMechanismById = async (mrid) => {
    try {
        const parentRes = await OperatingMechanismFunc.getOperatingMechanismById(mrid)
        if (!parentRes.success) return { success: false, data: null, message: 'OperatingMechanism not found' }

        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM old_operating_mechanism WHERE mrid = ?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get oldOperatingMechanism by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'OldOperatingMechanism not found' })
                    return resolve({ success: true, data: { ...parentRes.data, ...row }, message: 'Get oldOperatingMechanism by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get oldOperatingMechanism by id failed' }
    }
}

export const getOldOperatingMechanismByAssetIdTransaction = async (assetId, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const query = `
                SELECT o.*, om.*, a.*, io.*
                FROM old_operating_mechanism o
                JOIN operating_mechanism om ON o.mrid = om.mrid
                JOIN asset a ON om.mrid = a.mrid
                JOIN identified_object io ON a.mrid = io.mrid
                WHERE om.asset_id = ?
            `;

            dbsql.get(query, [assetId], (err, row) => {
                if (err) {
                    return reject({
                        success: false,
                        message: 'Get oldOperatingMechanism failed',
                        err
                    });
                }

                if (!row) {
                    return resolve({
                        success: true,
                        data: null,
                        message: 'No oldOperatingMechanism found for this asset'
                    });
                }

                return resolve({
                    success: true,
                    data: row,
                    message: 'Get oldOperatingMechanism successfully'
                });
            });
        } catch (err) {
            return reject({
                success: false,
                err,
                message: 'Get oldOperatingMechanism transaction failed'
            });
        }
    });
};


// Thêm mới oldOperatingMechanism (transaction)
export const insertOldOperatingMechanismTransaction = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const parentRes = await OperatingMechanismFunc.insertOperatingMechanismTransaction(info, dbsql)
            if (!parentRes.success) return reject({ success: false, message: 'Insert OperatingMechanism failed', err: parentRes.err })

            dbsql.run(
                `INSERT INTO old_operating_mechanism(
                    mrid, number_of_trip_coil, number_of_close_coil
                ) VALUES (?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    number_of_trip_coil = excluded.number_of_trip_coil,
                    number_of_close_coil = excluded.number_of_close_coil
                `,
                [
                    info.mrid,
                    info.number_of_trip_coil,
                    info.number_of_close_coil
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert oldOperatingMechanism failed' })
                    return resolve({ success: true, data: info, message: 'Insert oldOperatingMechanism completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert oldOperatingMechanism transaction failed' })
        }
    })
}

// Cập nhật oldOperatingMechanism (transaction)
export const updateOldOperatingMechanismTransaction = async (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const parentRes = await OperatingMechanismFunc.updateOperatingMechanismTransaction(mrid, info, dbsql)
            if (!parentRes.success) return reject({ success: false, message: 'Update OperatingMechanism failed', err: parentRes.err })

            dbsql.run(
                `UPDATE old_operating_mechanism SET
                    number_of_trip_coil = ?,
                    number_of_close_coil = ?
                WHERE mrid = ?`,
                [
                    info.number_of_trip_coil,
                    info.number_of_close_coil,
                    mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update oldOperatingMechanism failed' })
                    return resolve({ success: true, data: info, message: 'Update oldOperatingMechanism completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update oldOperatingMechanism transaction failed' })
        }
    })
}

// Xóa oldOperatingMechanism (transaction)
export const deleteOldOperatingMechanismTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Delete child row first
            dbsql.run("DELETE FROM old_operating_mechanism WHERE mrid = ?", [mrid], function (err) {
                if (err) return reject({ success: false, err, message: 'Delete oldOperatingMechanism failed' })

                // then delete parent operating_mechanism
                OperatingMechanismFunc.deleteOperatingMechanismTransaction(mrid, dbsql)
                    .then(res => {
                        if (!res.success) return reject({ success: false, message: 'Delete OperatingMechanism failed', err: res.err })
                        return resolve({ success: true, data: mrid, message: 'Delete oldOperatingMechanism completed' })
                    })
                    .catch(err2 => reject({ success: false, err: err2, message: 'Delete OperatingMechanism transaction failed' }))
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete oldOperatingMechanism transaction failed' })
        }
    })
}