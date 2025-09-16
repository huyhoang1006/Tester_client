import db from '../../datacontext/index'
import * as AssetInfoFunc from '../assetInfo/index.js'
import * as OldSwitchInfoFunc from '../oldSwitchInfo/index.js'

// Lấy disconnector info theo mrid
export const getDisconnectorInfoById = async (mrid) => {
    try {
        const assetInfoResult = await AssetInfoFunc.getAssetInfoById(mrid)
        if (!assetInfoResult.success) {
            return { success: false, data: null, message: 'AssetInfo not found' }
        }
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM disconnector_info WHERE mrid=?", [mrid], (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get disconnector info by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'DisconnectorInfo not found' })
                const data = { ...assetInfoResult.data, ...row }
                return resolve({ success: true, data: data, message: 'Get disconnector info by id completed' })
            })
        })
    } catch (err) {
        return { success: false, err, message: 'Get disconnector info by id failed' }
    }
}

//insert disconnector info
export const insertDisconnectorInfoTransaction = async (info, dbsql) => {

    return new Promise(async (resolve, reject) => {
        console.log('start insert disconnector info : '+ info);
        try {
            const oldSwitchInfoResult = await OldSwitchInfoFunc.insertOldSwitchInfoTransaction(info, dbsql)
            if (!oldSwitchInfoResult.success) {
                return reject({ success: false, message: 'Insert old switch info failed', err: oldSwitchInfoResult.err })
            }
            dbsql.run(
                `INSERT INTO disconnector_info(
                mrid, rated_duration_short_circuit, withstand_voltage_earth_poles, Power_frequency_isolating_distance
            ) VALUES (?, ?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                rated_duration_short_circuit = excluded.rated_duration_short_circuit,
                withstand_voltage_earth_poles = excluded.withstand_voltage_earth_poles,
                Power_frequency_isolating_distance = excluded.Power_frequency_isolating_distance
            `,
                [info.mrid, info.rated_duration_short_circuit, info.withstand_voltage_earth_poles, info.power_frequency_isolating_distance],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert disconnector info failed' })
                    return resolve({ success: true, data: info, message: 'Insert disconnector info completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert disconnector info failed' })
        }
    })

}

// Update disconnector info
export const updateDisconnectorInfo = async (mrid, info) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            AssetInfoFunc.updateAssetInfoTransaction(mrid, info, db)
                .then(assetInfoResult => {
                    if (!assetInfoResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Update assetInfo failed', err: assetInfoResult.err })
                    }
                    db.run(
                        `UPDATE disconnector_info SET
                            rated_duration_short_circuit = ?,
                            withstand_voltage_earth_poles = ?,
                            Power_frequency_isolating_distance = ?
                        WHERE mrid = ?`,
                        [
                            info.rated_duration_short_circuit,
                            info.withstand_voltage_earth_poles,
                            info.power_frequency_isolating_distance,
                            mrid
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Update disconnector info failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: info, message: 'Update disconnector info completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Update disconnector info transaction failed' })
                })
        })
    })
}

// Delete disconnector info
export const deleteDisconnectorInfoById = async (mrid) => {
    return new Promise((resolve, reject) => {
        AssetInfoFunc.deleteAssetInfoById(mrid)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete assetInfo failed', err: result.err })
                }
                db.run("DELETE FROM disconnector_info WHERE mrid=?", [mrid], function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Delete disconnector info failed' })
                    }
                    return resolve({ success: true, data: mrid, message: 'Delete disconnector info completed' })
                })
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Delete disconnector info transaction failed' })
            })
    })
}
