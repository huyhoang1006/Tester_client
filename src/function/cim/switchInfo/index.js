import db from '../../datacontext/index'
import * as AssetInfoFunc from '../assetInfo/index.js'

// --- READ ---
export const getSwitchInfoById = async (mrid) => {
    try {
        const assetInfoResult = await AssetInfoFunc.getAssetInfoById(mrid)
        if (!assetInfoResult.success) {
            return { success: false, data: null, message: 'AssetInfo not found' }
        }
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM switch_info WHERE mrid=?", [mrid], (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get SwitchInfo failed' })
                if (!row) return resolve({ success: false, data: null, message: 'SwitchInfo not found' })
                const data = { ...assetInfoResult.data, ...row }
                return resolve({ success: true, data, message: 'Get SwitchInfo completed' })
            })
        })
    } catch (err) {
        return { success: false, err, message: 'Get SwitchInfo failed' }
    }
}

// --- CREATE / UPSERT ---
export const insertSwitchInfoTransaction = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetInfoResult = await AssetInfoFunc.insertAssetInfoTransaction(info, dbsql)
            if (!assetInfoResult.success) {
                return reject({ success: false, message: 'Insert AssetInfo failed', err: assetInfoResult.err })
            }
            dbsql.run(
                `INSERT INTO switch_info (mrid, breaking_capacity, gas_weight_per_tank, oil_volume_per_tank, rated_current, rated_frequency, rated_impulse_withstand_voltage, rated_interrupting_time, rated_voltage)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON CONFLICT(mrid) DO NOTHING`,
                [info.mrid],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Insert SwitchInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert SwitchInfo completed' })
                }
            )
        } catch (err) {
            console.log(err);
            return reject({ success: false, err, message: 'Insert SwitchInfo failed' })
        }
    })
}

// --- UPDATE ---
export const updateSwitchInfoTransaction = async (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetInfoResult = await AssetInfoFunc.updateAssetInfoTransaction(mrid, info, dbsql)
            if (!assetInfoResult.success) {
                return reject({ success: false, message: 'Update AssetInfo failed', err: assetInfoResult.err })
            }
            dbsql.run(
                `UPDATE switch_info SET name=?, location=?, rated_current=?, rated_voltage=? WHERE mrid=?`,
                [info.name, info.location, info.rated_current, info.rated_voltage, mrid],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update SwitchInfo failed' })
                    return resolve({ success: true, data: info, message: 'Update SwitchInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update SwitchInfo failed' })
        }
    })
}

// --- DELETE ---
export const deleteSwitchInfoByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        AssetInfoFunc.deleteAssetInfoByIdTransaction(mrid, dbsql)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete AssetInfo failed', err: result.err })
                }
                dbsql.run("DELETE FROM switch_info WHERE mrid=?", [mrid], function (err) {
                    if (err) return reject({ success: false, err, message: 'Delete SwitchInfo failed' })
                    return resolve({ success: true, data: mrid, message: 'Delete SwitchInfo completed' })
                })
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Delete SwitchInfo transaction failed' })
            })
    })
}
