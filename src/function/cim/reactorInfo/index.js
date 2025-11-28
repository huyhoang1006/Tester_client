import db from '../../datacontext/index'
import * as AssetInfoFunc from '../assetInfo/index.js'

// Lấy reactorInfo theo mrid
export const getReactorInfoById = async (mrid) => {
    try {
        const assetInfoResult = await AssetInfoFunc.getAssetInfoById(mrid)
        if (!assetInfoResult.success) {
            return { success: false, data: null, message: 'AssetInfo not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM reactor_info WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get reactorInfo by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'ReactorInfo not found' })
                    console.log('=== Got ReactorInfo from DB ===');
                    console.log('row.phase_name from DB:', row.phase_name);
                    console.log('Full row:', JSON.stringify(row, null, 2));
                    return resolve({ success: true, data: { ...assetInfoResult.data, ...row }, message: 'Get reactorInfo by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get reactorInfo by id failed' }
    }
}

// Thêm mới reactorInfo (transaction)
export const insertReactorInfoTransaction = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetInfoResult = await AssetInfoFunc.insertAssetInfoTransaction(info, dbsql)
            if (!assetInfoResult.success) {
                return reject({ success: false, message: 'Insert assetInfo failed', err: assetInfoResult.err })
            }
            dbsql.run(
                `INSERT INTO reactor_info(
                    mrid, rated_voltage, rated_current, rated_frequency,
                    rated_power, insulation_type, inductance
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    rated_voltage = excluded.rated_voltage,
                    rated_current = excluded.rated_current,
                    rated_frequency = excluded.rated_frequency,
                    rated_power = excluded.rated_power,
                    insulation_type = excluded.insulation_type,
                    inductance = excluded.inductance
                `,
                [
                    info.mrid,
                    info.rated_voltage,
                    info.rated_current,
                    info.rated_frequency,
                    info.rated_power,
                    info.insulation_type,
                    info.inductance
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Insert reactorInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert reactorInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert reactorInfo transaction failed' })
        }
    })
}

// Cập nhật reactorInfo (transaction)
export const updateReactorInfoTransaction = async (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetInfoResult = await AssetInfoFunc.updateAssetInfoTransaction(mrid, info, dbsql)
            if (!assetInfoResult.success) {
                return reject({ success: false, message: 'Update assetInfo failed', err: assetInfoResult.err })
            }
            dbsql.run(
                `UPDATE reactor_info SET
                    rated_voltage = ?,
                    rated_current = ?,
                    rated_frequency = ?,
                    rated_power = ?,
                    insulation_type = ?,
                    inductance = ?
                WHERE mrid = ?`,
                [
                    info.rated_voltage,
                    info.rated_current,
                    info.rated_frequency,
                    info.rated_power,
                    info.insulation_type,
                    info.inductance,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Update reactorInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Update reactorInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update reactorInfo transaction failed' })
        }
    })
}

// Xóa reactorInfo (transaction)
export const deleteReactorInfoTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetInfoResult = await AssetInfoFunc.deleteAssetInfoByIdTransaction(mrid, dbsql)
            if (!assetInfoResult.success) {
                return reject({ success: false, message: 'Delete assetInfo failed', err: assetInfoResult.err })
            }
            dbsql.run("DELETE FROM reactor_info WHERE mrid=?", [mrid], function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Delete reactorInfo failed' })
                }
                return resolve({ success: true, data: mrid, message: 'Delete reactorInfo completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete reactorInfo transaction failed' })
        }
    })
}

export default {
    getReactorInfoById,
    insertReactorInfoTransaction,
    updateReactorInfoTransaction,
    deleteReactorInfoTransaction
}