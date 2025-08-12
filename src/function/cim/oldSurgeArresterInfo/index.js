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

export const getOldSurgeArresterInfoBySurgeArresterId = async (surgeArresterId) => {
    try {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    oi.*,          -- IdentifiedObject
                    ai.*,          -- AssetInfo
                    sai.*,         -- SurgeArresterInfo
                    oai.*          -- OldSurgeArresterInfo
                FROM old_surge_arrester_info oai
                INNER JOIN surge_arrester_info sai ON oai.mrid = sai.mrid
                INNER JOIN asset_info ai ON sai.mrid = ai.mrid
                INNER JOIN identified_object oi ON ai.mrid = oi.mrid
                WHERE oai.surge_arrester_id = ?
            `;

            db.all(query, [surgeArresterId], (err, rows) => {
                if (err) {
                    return reject({
                        success: false,
                        err: err,
                        message: 'Get old surge arrester info with inheritance failed'
                    });
                }
                if (!rows || rows.length === 0) {
                    return resolve({
                        success: false,
                        data: [],
                        message: 'No old surge arrester info found for this surge arrester ID'
                    });
                }
                return resolve({
                    success: true,
                    data: rows,
                    message: 'Get old surge arrester info with inheritance completed'
                });
            });
        });
    } catch (err) {
        return { 
            success: false, 
            err: err,
            message: 'Get old surge arrester info with inheritance failed'
        };
    }
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
                            mrid, serial_number, maximum_system_voltage, short_time_with_stand_current,
                            rated_duration_of_short_circuit, pf_with_stand_voltage_earth_between_pole,
                            pf_with_stand_voltage_isolated_distance, surge_arrester_id
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(mrid) DO UPDATE SET
                            serial_number = excluded.serial_number,
                            maximum_system_voltage = excluded.maximum_system_voltage,
                            short_time_with_stand_current = excluded.short_time_with_stand_current,
                            rated_duration_of_short_circuit = excluded.rated_duration_of_short_circuit,
                            pf_with_stand_voltage_earth_between_pole = excluded.pf_with_stand_voltage_earth_between_pole,
                            pf_with_stand_voltage_isolated_distance = excluded.pf_with_stand_voltage_isolated_distance,
                            surge_arrester_id = excluded.surge_arrester_id
                        `,
                        [
                            info.mrid,
                            info.serial_number,
                            info.maximum_system_voltage,
                            info.short_time_with_stand_current,
                            info.rated_duration_of_short_circuit,
                            info.pf_with_stand_voltage_earth_between_pole,
                            info.pf_with_stand_voltage_isolated_distance,
                            info.surge_arrester_id
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
                    mrid, serial_number, maximum_system_voltage, short_time_with_stand_current,
                    rated_duration_of_short_circuit, pf_with_stand_voltage_earth_between_pole,
                    pf_with_stand_voltage_isolated_distance, surge_arrester_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    serial_number = excluded.serial_number,
                    maximum_system_voltage = excluded.maximum_system_voltage,
                    short_time_with_stand_current = excluded.short_time_with_stand_current,
                    rated_duration_of_short_circuit = excluded.rated_duration_of_short_circuit,
                    pf_with_stand_voltage_earth_between_pole = excluded.pf_with_stand_voltage_earth_between_pole,
                    pf_with_stand_voltage_isolated_distance = excluded.pf_with_stand_voltage_isolated_distance,
                    surge_arrester_id = excluded.surge_arrester_id
                `,
                [
                    info.mrid,
                    info.serial_number,
                    info.maximum_system_voltage,
                    info.short_time_with_stand_current,
                    info.rated_duration_of_short_circuit,
                    info.pf_with_stand_voltage_earth_between_pole,
                    info.pf_with_stand_voltage_isolated_distance,
                    info.surge_arrester_id
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
                            serial_number = ?,
                            maximum_system_voltage = ?,
                            short_time_with_stand_current = ?,
                            rated_duration_of_short_circuit = ?,
                            pf_with_stand_voltage_earth_between_pole = ?,
                            pf_with_stand_voltage_isolated_distance = ?,
                            surge_arrester_id = ?
                        WHERE mrid = ?`,
                        [
                            info.serial_number,
                            info.maximum_system_voltage,
                            info.short_time_with_stand_current,
                            info.rated_duration_of_short_circuit,
                            info.pf_with_stand_voltage_earth_between_pole,
                            info.pf_with_stand_voltage_isolated_distance,
                            info.surge_arrester_id,
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
                    serial_number = ?,
                    maximum_system_voltage = ?,
                    short_time_with_stand_current = ?,
                    rated_duration_of_short_circuit = ?,
                    pf_with_stand_voltage_earth_between_pole = ?,
                    pf_with_stand_voltage_isolated_distance = ?,
                    surge_arrester_id = ?
                WHERE mrid = ?`,
                [
                    info.serial_number,
                    info.maximum_system_voltage,
                    info.short_time_with_stand_current,
                    info.rated_duration_of_short_circuit,
                    info.pf_with_stand_voltage_earth_between_pole,
                    info.pf_with_stand_voltage_isolated_distance,
                    info.surge_arrester_id,
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