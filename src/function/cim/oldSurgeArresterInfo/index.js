import db from '../../datacontext/index'
import * as SurgeArresterInfoFunc from '../surgeArresterInfo/index.js'

// Lấy thông tin old surge arrester info theo mrid
export const getOldSurgeArresterInfoById = async (mrid) => {
    try {
        const arresterInfoResult = await SurgeArresterInfoFunc.getSurgeArresterInfoById(mrid)
        if (!arresterInfoResult.success) {
            return { success: false, data: null, message: 'SurgeArresterInfo not found' }
        }
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM old_surge_arrester_info WHERE mrid=?", [mrid], (err, row) => {
                if (err) return reject({ success: false, err: err, message: 'Get old surge arrester info by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'OldSurgeArresterInfo not found' })
                const data = { ...arresterInfoResult.data, ...row }
                return resolve({ success: true, data: data, message: 'Get old surge arrester info by id completed' })
            })
        })
    } catch (err) {
        return { success: false, err: err, message: 'Get old surge arrester info by id failed' }
    }
}

export const getOldSurgeArresterInfoBySurgeArresterId = (surgeArresterId) => {
    return new Promise((resolve, reject) => {

        const query = `
            SELECT 
                oi.*, 
                ai.*, 
                sai.*, 
                oai.*
            FROM asset a
            INNER JOIN asset_info ai 
                ON a.asset_info = ai.mrid
            INNER JOIN surge_arrester_info sai 
                ON sai.mrid = ai.mrid
            INNER JOIN old_surge_arrester_info oai 
                ON oai.mrid = sai.mrid
            INNER JOIN identified_object oi 
                ON oi.mrid = ai.mrid
            WHERE a.mrid = ?
        `;

        db.get(query, [surgeArresterId], (err, row) => {

            if (err) {
                return reject({
                    success: false,
                    err: err,
                    message: 'Get old surge arrester info failed'
                });
            }

            if (!row) {
                return resolve({
                    success: false,
                    data: null,
                    message: 'No old surge arrester info found'
                });
            }

            return resolve({
                success: true,
                data: row,
                message: 'Get old surge arrester info completed'
            });
        });
    });
};

// Thêm mới old surge arrester info
export const insertOldSurgeArresterInfo = async (info) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            SurgeArresterInfoFunc.insertSurgeArresterInfoTransaction(info, db)
                .then(arresterInfoResult => {
                    if (!arresterInfoResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Insert surgeArresterInfo failed', err: arresterInfoResult.err })
                    }
                    db.run(
                        `INSERT INTO old_surge_arrester_info(
                            mrid, maximum_system_voltage, short_time_with_stand_current,
                            rated_duration_of_short_circuit, pf_with_stand_voltage_earth_between_pole,
                            pf_with_stand_voltage_isolated_distance, voltage_ll, voltage_ln, transformer_end_info
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(mrid) DO UPDATE SET
                            maximum_system_voltage = excluded.maximum_system_voltage,
                            short_time_with_stand_current = excluded.short_time_with_stand_current,
                            rated_duration_of_short_circuit = excluded.rated_duration_of_short_circuit,
                            pf_with_stand_voltage_earth_between_pole = excluded.pf_with_stand_voltage_earth_between_pole,
                            pf_with_stand_voltage_isolated_distance = excluded.pf_with_stand_voltage_isolated_distance,
                            voltage_ll = excluded.voltage_ll,
                            voltage_ln = excluded.voltage_ln,
                            transformer_end_info = excluded.transformer_end_info
                        `,
                        [
                            info.mrid,
                            info.maximum_system_voltage,
                            info.short_time_with_stand_current,
                            info.rated_duration_of_short_circuit,
                            info.pf_with_stand_voltage_earth_between_pole,
                            info.pf_with_stand_voltage_isolated_distance,
                            info.voltage_ll,
                            info.voltage_ln,
                            info.transformer_end_info
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err: err, message: 'Insert old surge arrester info failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: info, message: 'Insert old surge arrester info completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err: err, message: 'Insert old surge arrester info transaction failed' })
                })
        })
    })
}

// Transaction: Thêm mới old surge arrester info
export const insertOldSurgeArresterInfoTransaction = (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const arresterInfoResult = await SurgeArresterInfoFunc.insertSurgeArresterInfoTransaction(info, dbsql)
            if (!arresterInfoResult.success) {
                return reject({ success: false, message: 'Insert surgeArresterInfo failed', err: arresterInfoResult.err })
            }
            dbsql.run(
                `INSERT INTO old_surge_arrester_info(
                    mrid, maximum_system_voltage, short_time_with_stand_current,
                    rated_duration_of_short_circuit, pf_with_stand_voltage_earth_between_pole,
                    pf_with_stand_voltage_isolated_distance, voltage_ll, voltage_ln, phase, transformer_end_info
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    maximum_system_voltage = excluded.maximum_system_voltage,
                    short_time_with_stand_current = excluded.short_time_with_stand_current,
                    rated_duration_of_short_circuit = excluded.rated_duration_of_short_circuit,
                    pf_with_stand_voltage_earth_between_pole = excluded.pf_with_stand_voltage_earth_between_pole,
                    pf_with_stand_voltage_isolated_distance = excluded.pf_with_stand_voltage_isolated_distance,
                    voltage_ll = excluded.voltage_ll,
                    voltage_ln = excluded.voltage_ln,
                    phase = excluded.phase,
                    transformer_end_info = excluded.transformer_end_info
                `,
                [
                    info.mrid,
                    info.maximum_system_voltage,
                    info.short_time_with_stand_current,
                    info.rated_duration_of_short_circuit,
                    info.pf_with_stand_voltage_earth_between_pole,
                    info.pf_with_stand_voltage_isolated_distance,
                    info.voltage_ll,
                    info.voltage_ln,
                    info.phase,
                    info.transformer_end_info
                ],
                function (err) {
                    if (err) {
                        console.log(err)
                        return reject({ success: false, err: err, message: 'Insert old surge arrester info transaction failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert old surge arrester info transaction completed' })
                }
            )
        } catch (err) {
            console.log(err)
            return reject({ success: false, err: err, message: 'Insert old surge arrester info transaction failed' })
        }
    })
}

// Cập nhật old surge arrester info
export const updateOldSurgeArresterInfo = async (mrid, info) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            SurgeArresterInfoFunc.updateSurgeArresterInfoTransaction(mrid, info, db)
                .then(arresterInfoResult => {
                    if (!arresterInfoResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Update surgeArresterInfo failed', err: arresterInfoResult.err })
                    }
                    db.run(
                        `UPDATE old_surge_arrester_info SET
                            maximum_system_voltage = ?,
                            short_time_with_stand_current = ?,
                            rated_duration_of_short_circuit = ?,
                            pf_with_stand_voltage_earth_between_pole = ?,
                            pf_with_stand_voltage_isolated_distance = ?,
                            voltage_ll = ?,
                            voltage_ln = ?,
                            phase = ?,
                            transformer_end_info = ?
                        WHERE mrid = ?`,
                        [
                            info.maximum_system_voltage,
                            info.short_time_with_stand_current,
                            info.rated_duration_of_short_circuit,
                            info.pf_with_stand_voltage_earth_between_pole,
                            info.pf_with_stand_voltage_isolated_distance,
                            info.voltage_ll,
                            info.voltage_ln,
                            info.phase,
                            info.transformer_end_info,
                            mrid
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err: err, message: 'Update old surge arrester info failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: info, message: 'Update old surge arrester info completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err: err, message: 'Update old surge arrester info transaction failed' })
                })
        })
    })
}

// Transaction: Cập nhật old surge arrester info
export const updateOldSurgeArresterInfoTransaction = (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const arresterInfoResult = await SurgeArresterInfoFunc.updateSurgeArresterInfoTransaction(mrid, info, dbsql)
            if (!arresterInfoResult.success) {
                return reject({ success: false, message: 'Update surgeArresterInfo failed', err: arresterInfoResult.err })
            }
            dbsql.run(
                `UPDATE old_surge_arrester_info SET
                    maximum_system_voltage = ?,
                    short_time_with_stand_current = ?,
                    rated_duration_of_short_circuit = ?,
                    pf_with_stand_voltage_earth_between_pole = ?,
                    pf_with_stand_voltage_isolated_distance = ?,
                    voltage_ll = ?,
                    voltage_ln = ?,
                    phase = ?,
                    transformer_end_info = ?
                WHERE mrid = ?`,
                [
                    info.maximum_system_voltage,
                    info.short_time_with_stand_current,
                    info.rated_duration_of_short_circuit,
                    info.pf_with_stand_voltage_earth_between_pole,
                    info.pf_with_stand_voltage_isolated_distance,
                    info.voltage_ll,
                    info.voltage_ln,
                    info.phase,
                    info.transformer_end_info,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err: err, message: 'Update old surge arrester info transaction failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Update old surge arrester info transaction completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err: err, message: 'Update old surge arrester info transaction failed' })
        }
    })
}

// Xóa old surge arrester info theo mrid
export const deleteOldSurgeArresterInfoById = async (mrid) => {
    return new Promise((resolve, reject) => {
        SurgeArresterInfoFunc.deleteSurgeArresterInfoById(mrid)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete surgeArresterInfo failed', err: result.err })
                }
                db.run("DELETE FROM old_surge_arrester_info WHERE mrid=?", [mrid], function (err) {
                    if (err) {
                        return reject({ success: false, err: err, message: 'Delete old surge arrester info failed' })
                    }
                    return resolve({ success: true, data: mrid, message: 'Delete old surge arrester info completed' })
                })
            })
            .catch(err => {
                return reject({ success: false, err: err, message: 'Delete old surge arrester info transaction failed' })
            })
    })
}

// Transaction: Xóa old surge arrester info theo mrid
export const deleteOldSurgeArresterInfoByIdTransaction = (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        SurgeArresterInfoFunc.deleteSurgeArresterInfoByIdTransaction(mrid, dbsql)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete surgeArresterInfo failed', err: result.err })
                }
                dbsql.run("DELETE FROM old_surge_arrester_info WHERE mrid=?", [mrid], function (err) {
                    if (err) {
                        return reject({ success: false, err: err, message: 'Delete old surge arrester info transaction failed' })
                    }
                    return resolve({ success: true, data: mrid, message: 'Delete old surge arrester info transaction completed' })
                })
            })
            .catch(err => {
                return reject({ success: false, err: err, message: 'Delete old surge arrester info transaction failed' })
            })
    })
}