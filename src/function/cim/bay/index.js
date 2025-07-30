import db from '../../datacontext/index'
import * as equipmentContainerFunc from '../equipmentContainer/index.js'


// Thêm mới Bay (gồm cả insert EquipmentContainer)
export const insertBay = async (bay) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            equipmentContainerFunc.insertEquipmentContainerTransaction(bay, db)
                .then(result => {
                    if (!result.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Insert EquipmentContainer failed', err: result.err })
                    }
                    db.run(
                        `INSERT INTO bay(mrid, bay_energy_meas_flag, bay_power_meas_flag, breaker_configuration, bus_bar_configuration, substation, voltage_level)
                         VALUES (?, ?, ?, ?, ?, ?, ?)
                         ON CONFLICT(mrid) DO UPDATE SET
                            bay_energy_meas_flag = excluded.bay_energy_meas_flag,
                            bay_power_meas_flag = excluded.bay_power_meas_flag,
                            breaker_configuration = excluded.breaker_configuration,
                            bus_bar_configuration = excluded.bus_bar_configuration,
                            substation = excluded.substation,
                            voltage_level = excluded.voltage_level`,
                        [bay.mrid, bay.bay_energy_meas_flag, bay.bay_power_meas_flag, bay.breaker_configuration, bay.bus_bar_configuration, bay.substation, bay.voltage_level],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Insert Bay failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: bay, message: 'Insert Bay completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Insert Bay transaction failed' })
                })
        })
    })
}

// Thêm mới Substation trong transaction (cho lớp cha gọi)
export const insertBayTransaction = async (bay, dbsql) => {
    return new Promise((resolve, reject) => {
        equipmentContainerFunc.insertEquipmentContainerTransaction(bay, dbsql)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Insert EquipmentContainer failed', err: result.err })
                }
                dbsql.run(
                    `INSERT INTO bay(mrid, bay_energy_meas_flag, bay_power_meas_flag, breaker_configuration, bus_bar_configuration, substation, voltage_level)
                     VALUES (?, ?, ?, ?, ?, ?, ?)
                     ON CONFLICT(mrid) DO UPDATE SET
                        bay_energy_meas_flag = excluded.bay_energy_meas_flag,
                        bay_power_meas_flag = excluded.bay_power_meas_flag,
                        breaker_configuration = excluded.breaker_configuration,
                        bus_bar_configuration = excluded.bus_bar_configuration,
                        substation = excluded.substation,
                        voltage_level = excluded.voltage_level`,
                    [bay.mrid, bay.bay_energy_meas_flag, bay.bay_power_meas_flag, bay.breaker_configuration, bay.bus_bar_configuration, bay.substation, bay.voltage_level],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Insert Bay failed' })
                        }
                        return resolve({ success: true, data: bay, message: 'Insert Bay completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Insert Bay transaction failed' })
            })
    })
}


// Lấy Bay theo mrid (gộp cả cha, trả về data: data)
export const getBayById = async (mrid) => {
    try {
        const ecResult = await equipmentContainerFunc.getEquipmentContainerById(mrid)
        if (!ecResult.success) {
            return { success: false, data: null, message: 'EquipmentContainer not found' }
        }
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM bay WHERE mrid = ?", [mrid], (err, row) => {
                if (err) return reject({ success: false, data: null, message: 'Get Bay failed', err })
                if (!row) return resolve({ success: false, data: null, message: 'Bay not found' })
                const data = { ...ecResult.data, ...row }
                return resolve({ success: true, data: data, message: 'Get Bay completed' })
            })
        })
    } catch (err) {
        return { success: false, data: null, message: 'Get Bay failed', err }
    }
}

// Lấy Bay theo mrid (gộp cả cha, trả về data: data)
export const getBayByVoltageLevelOrSubstation = (voltageLevel, substation) => {
    return new Promise((resolve, reject) => {
        let sql = `
            SELECT 
                b.*, 
                io.*
            FROM bay b
            JOIN identified_object io ON b.mrid = io.mrid
        `;

        const params = [];
        const conditions = [];

        if (substation) {
            conditions.push('b.substation = ?');
            params.push(substation);
        }

        if (voltageLevel) {
            conditions.push('b.voltage_level = ?');
            params.push(voltageLevel);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' OR ');
        }

        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Get Bay by VoltageLevel or Substation failed:', err);
                return reject({
                    success: false,
                    data: null,
                    message: 'Get Bay by VoltageLevel or Substation failed',
                    err
                });
            }

            if (!rows || rows.length === 0) {
                return resolve({
                    success: false,
                    data: [],
                    message: 'No bays found'
                });
            }

            return resolve({
                success: true,
                data: rows,
                message: 'Get Bays completed'
            });
        });
    });
};


// Cập nhật Bay (gồm cả EquipmentContainer)
export const updateBayById = async (mrid, bay) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            equipmentContainerFunc.updateEquipmentContainerByIdTransaction(mrid, bay, db)
                .then(result => {
                    if (!result.success) {
                        db.run('ROLLBACK');
                        return reject({ success: false, message: 'Update EquipmentContainer failed', err: result.err });
                    }

                    db.run(
                        `UPDATE bay SET
                            bay_energy_meas_flag = ?,
                            bay_power_meas_flag = ?,
                            breaker_configuration = ?,
                            bus_bar_configuration = ?,
                            voltage_level = ?,
                            substation = ?
                         WHERE mrid = ?`,
                        [
                            bay.bay_energy_meas_flag,
                            bay.bay_power_meas_flag,
                            bay.breaker_configuration,
                            bay.bus_bar_configuration,
                            bay.voltage_level,
                            bay.substation, // ✅ Thêm dòng này
                            mrid             // ✅ Giữ đúng vị trí cuối
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK');
                                return reject({ success: false, err, message: 'Update Bay failed' });
                            }
                            db.run('COMMIT');
                            return resolve({ success: true, data: bay, message: 'Update Bay completed' });
                        }
                    );
                })
                .catch(err => {
                    db.run('ROLLBACK');
                    return reject({ success: false, err, message: 'Update Bay transaction failed' });
                });
        });
    });
};


// Cập nhật Bay trong transaction (cho lớp cha gọi)
export const updateBayByIdTransaction = async (mrid, bay, dbsql) => {
    return new Promise((resolve, reject) => {
        equipmentContainerFunc.updateEquipmentContainerByIdTransaction(mrid, bay, dbsql)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Update EquipmentContainer failed', err: result.err })
                }
                dbsql.run(
                    `UPDATE bay SET
                        bay_energy_meas_flag = ?,
                        bay_power_meas_flag = ?,
                        breaker_configuration = ?,
                        bus_bar_configuration = ?,
                        voltage_level = ?,
                        substation = ?
                     WHERE mrid = ?`,
                    [bay.bay_energy_meas_flag, bay.bay_power_meas_flag, bay.breaker_configuration, bay.bus_bar_configuration, bay.voltage_level, bay.substation, mrid],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Update Bay failed' })
                        }
                        return resolve({ success: true, data: bay, message: 'Update Bay completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Update Bay transaction failed' })
            })
    })
}

// Xóa Bay (gồm cả EquipmentContainer, dùng cascade)
export const deleteBayById = async (mrid) => {
    return new Promise((resolve, reject) => {
        equipmentContainerFunc.deleteEquipmentContainerByIdTransaction(mrid, db)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete EquipmentContainer failed', err: result.err })
                }
                return resolve({ success: true, message: 'Delete Bay (and EquipmentContainer) completed' })
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Delete Bay transaction failed' })
            })
    })
}

// Xóa Bay trong transaction (cho lớp cha gọi)
export const deleteBayByIdTransaction = async (mrid, dbsql) => {
    return equipmentContainerFunc.deleteEquipmentContainerByIdTransaction(mrid, dbsql)
}