import db from '../../datacontext/index'
import * as AssetInfoFunc from '../assetInfo/index.js'

// Lấy thông tin power transformer info theo mrid
export const getPowerTransformerInfoById = async (mrid) => {
    try {
        const assetInfoResult = await AssetInfoFunc.getAssetInfoById(mrid)
        if (!assetInfoResult.success) {
            return { success: false, data: null, message: 'AssetInfo not found' }
        }
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM power_transformer_info WHERE mrid=?", [mrid], (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get powerTransformerInfo by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'PowerTransformerInfo not found' })
                const data = { ...assetInfoResult.data, ...row }
                return resolve({ success: true, data: data, message: 'Get powerTransformerInfo by id completed' })
            })
        })
    } catch (err) {
        return { success: false, err: err, message: 'Get powerTransformerInfo by id failed' }
    }
}

// Thêm mới power transformer info (transaction)
export const insertPowerTransformerInfoTransaction = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetInfoResult = await AssetInfoFunc.insertAssetInfoTransaction(info, dbsql)
            if (!assetInfoResult.success) {
                return reject({ success: false, message: 'Insert assetInfo failed', err: assetInfoResult.err })
            }
            dbsql.run(
                `INSERT INTO power_transformer_info(mrid)
                 VALUES (?)
                 ON CONFLICT(mrid) DO NOTHING`,
                [info.mrid],
                function (err) {
                    if (err) {
                        return reject({ success: false, err: err, message: 'Insert powerTransformerInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert powerTransformerInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err: err, message: 'Insert powerTransformerInfo transaction failed' })
        }
    })
}

// Cập nhật power transformer info (transaction)
export const updatePowerTransformerInfoTransaction = async (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetInfoResult = await AssetInfoFunc.updateAssetInfoTransaction(mrid, info, dbsql)
            if (!assetInfoResult.success) {
                return reject({ success: false, message: 'Update assetInfo failed', err: assetInfoResult.err })
            }
            // Nếu chỉ có mrid thì không cần update gì thêm
            return resolve({ success: true, data: info, message: 'Update powerTransformerInfo completed' })
        } catch (err) {
            return reject({ success: false, err: err, message: 'Update powerTransformerInfo transaction failed' })
        }
    })
}

// Xóa power transformer info (transaction)
export const deletePowerTransformerInfoTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetInfoResult = await AssetInfoFunc.deleteAssetInfoByIdTransaction(mrid, dbsql)
            if (!assetInfoResult.success) {
                return reject({ success: false, message: 'Delete assetInfo failed', err: assetInfoResult.err })
            }
            dbsql.run("DELETE FROM power_transformer_info WHERE mrid=?", [mrid], function (err) {
                if (err) {
                    return reject({ success: false, err: err, message: 'Delete powerTransformerInfo failed' })
                }
                return resolve({ success: true, data: mrid, message: 'Delete powerTransformerInfo completed' })
            })
        } catch (err) {
            return reject({ success: false, err: err, message: 'Delete powerTransformerInfo transaction failed' })
        }
    })
}