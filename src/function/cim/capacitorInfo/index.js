import db from '../../datacontext/index'
import * as AssetInfoFunc from '../assetInfo/index.js'

// Lấy capacitorInfo theo mrid
export const getCapacitorInfoById = async (mrid) => {
    try {
        const assetInfoResult = await AssetInfoFunc.getAssetInfoById(mrid)
        if (!assetInfoResult.success) {
            return { success: false, data: null, message: 'AssetInfo not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM capacitor_info WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get capacitorInfo by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'CapacitorInfo not found' })
                    console.log('=== Got CapacitorInfo from DB ===');
                    console.log('row.phase_name from DB:', row.phase_name);
                    console.log('Full row:', JSON.stringify(row, null, 2));
                    return resolve({ success: true, data: { ...assetInfoResult.data, ...row }, message: 'Get capacitorInfo by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get capacitorInfo by id failed' }
    }
}

// Thêm mới capacitorInfo (transaction)
export const insertCapacitorInfoTransaction = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetInfoResult = await AssetInfoFunc.insertAssetInfoTransaction(info, dbsql)
            if (!assetInfoResult.success) {
                return reject({ success: false, message: 'Insert assetInfo failed', err: assetInfoResult.err })
            }
            dbsql.run(
                `INSERT INTO capacitor_info(
                    mrid, phase_number, phase_name, rated_voltage, rated_current, rated_frequency,
                    rated_power, insulation_type, weight
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    phase_number = excluded.phase_number,
                    phase_name = excluded.phase_name,
                    rated_voltage = excluded.rated_voltage,
                    rated_current = excluded.rated_current,
                    rated_frequency = excluded.rated_frequency,
                    rated_power = excluded.rated_power,
                    insulation_type = excluded.insulation_type,
                    weight = excluded.weight
                `,
                [
                    info.mrid,
                    info.phase_number,
                    info.phase_name,
                    info.rated_voltage,
                    info.rated_current,
                    info.rated_frequency,
                    info.rated_power,
                    info.insulation_type,
                    info.weight
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Insert capacitorInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert capacitorInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert capacitorInfo transaction failed' })
        }
    })
}

// Cập nhật capacitorInfo (transaction)
export const updateCapacitorInfoTransaction = async (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetInfoResult = await AssetInfoFunc.updateAssetInfoTransaction(mrid, info, dbsql)
            if (!assetInfoResult.success) {
                return reject({ success: false, message: 'Update assetInfo failed', err: assetInfoResult.err })
            }
            dbsql.run(
                `UPDATE capacitor_info SET
                    phase_number = ?,
                    phase_name = ?,
                    rated_voltage = ?,
                    rated_current = ?,
                    rated_frequency = ?,
                    rated_power = ?,
                    insulation_type = ?,
                    weight = ?
                WHERE mrid = ?`,
                [
                    info.phase_number,
                    info.phase_name,
                    info.rated_voltage,
                    info.rated_current,
                    info.rated_frequency,
                    info.rated_power,
                    info.insulation_type,
                    info.weight,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Update capacitorInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Update capacitorInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update capacitorInfo transaction failed' })
        }
    })
}

// Xóa capacitorInfo (transaction)
export const deleteCapacitorInfoTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetInfoResult = await AssetInfoFunc.deleteAssetInfoByIdTransaction(mrid, dbsql)
            if (!assetInfoResult.success) {
                return reject({ success: false, message: 'Delete assetInfo failed', err: assetInfoResult.err })
            }
            dbsql.run("DELETE FROM capacitor_info WHERE mrid=?", [mrid], function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Delete capacitorInfo failed' })
                }
                return resolve({ success: true, data: mrid, message: 'Delete capacitorInfo completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete capacitorInfo transaction failed' })
        }
    })
}

export default {
    getCapacitorInfoById,
    insertCapacitorInfoTransaction,
    updateCapacitorInfoTransaction,
    deleteCapacitorInfoTransaction
}