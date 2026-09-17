import db from '../../datacontext/index'
import * as PowerTransformerInfoFunc from '../powerTransformerInfo/index.js'

// Lấy oldPowerTransformerInfo theo mrid
export const getOldPowerTransformerInfoById = async (mrid) => {
    try {
        const baseResult = await PowerTransformerInfoFunc.getPowerTransformerInfoById(mrid)
        if (!baseResult.success) {
            return { success: false, data: null, message: 'PowerTransformerInfo not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM old_power_transformer_info WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get oldPowerTransformerInfo by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'OldPowerTransformerInfo not found' })
                    return resolve({ success: true, data: { ...baseResult.data, ...row }, message: 'Get oldPowerTransformerInfo by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get oldPowerTransformerInfo by id failed' }
    }
}

// Thêm mới oldPowerTransformerInfo (transaction)
export const insertOldPowerTransformerInfoTransaction = async (info, dbsql) => {
    let baseResult
    try {
        baseResult = await PowerTransformerInfoFunc.insertPowerTransformerInfoTransaction(info, dbsql)
    } catch (err) {
        return Promise.reject({ success: false, err, message: 'Insert oldPowerTransformerInfo transaction failed' })
    }
    if (!baseResult.success) {
        return Promise.reject({ success: false, message: 'Insert powerTransformerInfo failed', err: baseResult.err })
    }

    return new Promise((resolve, reject) => {
            dbsql.run(
                `INSERT INTO old_power_transformer_info(
                    mrid, phases, vector_group, vector_group_data, vector_group_custom, unsupported_vector_group,
                    rated_frequency, impedance_temperature, category, apparatus_id, vector_group_type
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    phases = excluded.phases,
                    vector_group = excluded.vector_group,
                    vector_group_data = excluded.vector_group_data,
                    vector_group_custom = excluded.vector_group_custom,
                    unsupported_vector_group = excluded.unsupported_vector_group,
                    rated_frequency = excluded.rated_frequency,
                    impedance_temperature = excluded.impedance_temperature,
                    category = excluded.category,
                    apparatus_id = excluded.apparatus_id,
                    vector_group_type = excluded.vector_group_type
                `,
                [
                    info.mrid,
                    info.phases,
                    info.vector_group,
                    info.vector_group_data,
                    info.vector_group_custom,
                    info.unsupported_vector_group,
                    info.rated_frequency,
                    info.impedance_temperature,
                    info.category,
                    info.apparatus_id,
                    info.vector_group_type
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Insert oldPowerTransformerInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert oldPowerTransformerInfo completed' })
                }
            )
    })
}

// Cập nhật oldPowerTransformerInfo (transaction)
export const updateOldPowerTransformerInfoTransaction = async (mrid, info, dbsql) => {
    let baseResult
    try {
        baseResult = await PowerTransformerInfoFunc.updatePowerTransformerInfoTransaction(mrid, info, dbsql)
    } catch (err) {
        return Promise.reject({ success: false, err, message: 'Update oldPowerTransformerInfo transaction failed' })
    }
    if (!baseResult.success) {
        return Promise.reject({ success: false, message: 'Update powerTransformerInfo failed', err: baseResult.err })
    }

    return new Promise((resolve, reject) => {
            dbsql.run(
                `UPDATE old_power_transformer_info SET
                    phases = ?,
                    vector_group = ?,
                    vector_group_data = ?,
                    vector_group_custom = ?,
                    unsupported_vector_group = ?,
                    rated_frequency = ?,
                    impedance_temperature = ?,
                    category = ?,
                    apparatus_id = ?,
                    vector_group_type = ?
                WHERE mrid = ?`,
                [
                    info.phases,
                    info.vector_group,
                    info.vector_group_data,
                    info.vector_group_custom,
                    info.unsupported_vector_group,
                    info.rated_frequency,
                    info.impedance_temperature,
                    info.category,
                    info.apparatus_id,
                    info.vector_group_type,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Update oldPowerTransformerInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Update oldPowerTransformerInfo completed' })
                }
            )
    })
}

// Xóa oldPowerTransformerInfo (transaction)
export const deleteOldPowerTransformerInfoTransaction = async (mrid, dbsql) => {
    let baseResult
    try {
        baseResult = await PowerTransformerInfoFunc.deletePowerTransformerInfoTransaction(mrid, dbsql)
    } catch (err) {
        return Promise.reject({ success: false, err, message: 'Delete oldPowerTransformerInfo transaction failed' })
    }
    if (!baseResult.success) {
        return Promise.reject({ success: false, message: 'Delete powerTransformerInfo failed', err: baseResult.err })
    }

    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM old_power_transformer_info WHERE mrid=?", [mrid], function (err) {
            if (err) {
                return reject({ success: false, err, message: 'Delete oldPowerTransformerInfo failed' })
            }
            return resolve({ success: true, data: mrid, message: 'Delete oldPowerTransformerInfo completed' })
        })
    })
}
