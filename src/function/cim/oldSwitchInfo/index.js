import db from '../../datacontext/index'
import * as SwitchInfoFunc from '../switchInfo/index.js'

// --- READ ---
export const getOldSwitchInfoById = async (mrid) => {
    try {
        const switchInfoResult = await SwitchInfoFunc.getSwitchInfoById(mrid)
        if (!switchInfoResult.success) {
            return { success: false, data: null, message: 'SwitchInfo not found' }
        }
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM old_switch_info WHERE mrid=?", [mrid], (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get OldSwitchInfo failed' })
                if (!row) return resolve({ success: false, data: null, message: 'OldSwitchInfo not found' })
                const data = { ...switchInfoResult.data, ...row }
                return resolve({ success: true, data, message: 'Get OldSwitchInfo completed' })
            })
        })
    } catch (err) {
        return { success: false, err, message: 'Get OldSwitchInfo failed' }
    }
}

// --- CREATE / UPSERT ---
export const insertOldSwitchInfoTransaction = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('start insert old switch info : '+ info.mrid);
            const switchInfoResult = await SwitchInfoFunc.insertSwitchInfoTransaction(info, dbsql)
            if (!switchInfoResult.success) {
                return reject({ success: false, message: 'Insert SwitchInfo failed', err: switchInfoResult.err })
            }
            console.log('insert switch info completed' );
            dbsql.run(
                `INSERT INTO old_switch_info (mrid, dielectric_strength, making_capacity, minimum_current, withstand_current, load_break, pole_count, remote)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                 ON CONFLICT(mrid) DO UPDATE SET 
                    dielectric_strength = excluded.dielectric_strength,
                    making_capacity = excluded.making_capacity,
                    minimum_current = excluded.minimum_current,
                    withstand_current = excluded.withstand_current,
                    load_break = excluded.load_break,
                    pole_count = excluded.pole_count,
                    remote = excluded.remote
                `,
                [
                    info.mrid,
                    info.dielectric_strength,
                    info.making_capacity,
                    info.minimum_current,
                    // Map "Short time withstand current" (currentFlow.mrid) into withstand_current if provided
                    (info.withstand_current || info.short_time_withstand_current),
                    info.load_break,
                    info.pole_count,
                    info.remote
                ],
                function (err) {
                    if (err) {
                        console.log(err);
                        return reject({ success: false, err, message: 'Insert OldSwitchInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert OldSwitchInfo completed' })
                }
            )
            console.log('insert old switch info completed' );
        } catch (err) {
            return reject({ success: false, err, message: 'Insert OldSwitchInfo failed' })
        }
    })
}

// --- UPDATE ---
export const updateOldSwitchInfoTransaction = async (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const switchInfoResult = await SwitchInfoFunc.updateSwitchInfoTransaction(mrid, info, dbsql)
            if (!switchInfoResult.success) {
                return reject({ success: false, message: 'Update SwitchInfo failed', err: switchInfoResult.err })
            }
            dbsql.run(
                `UPDATE old_switch_info SET switch_id=?, reason=?, replaced_at=? WHERE mrid=?`,
                [info.switch_id, info.reason, info.replaced_at, mrid],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update OldSwitchInfo failed' })
                    return resolve({ success: true, data: info, message: 'Update OldSwitchInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update OldSwitchInfo failed' })
        }
    })
}

// --- DELETE ---
export const deleteOldSwitchInfoByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        SwitchInfoFunc.deleteSwitchInfoByIdTransaction(mrid, dbsql)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete SwitchInfo failed', err: result.err })
                }
                dbsql.run("DELETE FROM old_switch_info WHERE mrid=?", [mrid], function (err) {
                    if (err) return reject({ success: false, err, message: 'Delete OldSwitchInfo failed' })
                    return resolve({ success: true, data: mrid, message: 'Delete OldSwitchInfo completed' })
                })
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Delete OldSwitchInfo transaction failed' })
            })
    })
}
