import db from '../../datacontext/index'
import * as equipmentContainerFunc from '../equipmentContainer/index.js'

let parentSchemaPromise = null

export const ensureVoltageLevelParentSchema = (dbsql = db) => {
    if (parentSchemaPromise) return parentSchemaPromise
    parentSchemaPromise = new Promise((resolve, reject) => {
        dbsql.all('PRAGMA table_info(voltage_level)', [], (err, rows) => {
            if (err) return reject(err)
            if ((rows || []).some((row) => row.name === 'power_plant')) return resolve()
            dbsql.run('ALTER TABLE voltage_level ADD COLUMN power_plant TEXT REFERENCES power_plant(mrid)', (alterError) => {
                if (alterError) return reject(alterError)
                return resolve()
            })
        })
    }).catch((error) => {
        parentSchemaPromise = null
        throw error
    })
    return parentSchemaPromise
}


// Thêm mới VoltageLevel (gồm cả insert EquipmentContainer)
export const insertVoltageLevel = async (voltageLevel) => {
    await ensureVoltageLevelParentSchema()
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            equipmentContainerFunc.insertEquipmentContainerTransaction(voltageLevel, db)
                .then(result => {
                    if (!result.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Insert EquipmentContainer failed', err: result.err })
                    }
                    db.run(
                        `INSERT INTO voltage_level(mrid, high_voltage_limit, low_voltage_limit, base_voltage, substation, power_plant)
                         VALUES (?, ?, ?, ?, ?, ?)
                         ON CONFLICT(mrid) DO UPDATE SET
                            high_voltage_limit = excluded.high_voltage_limit,
                            low_voltage_limit = excluded.low_voltage_limit,
                            base_voltage = excluded.base_voltage,
                            substation = excluded.substation,
                            power_plant = excluded.power_plant`,
                        [voltageLevel.mrid, voltageLevel.high_voltage_limit, voltageLevel.low_voltage_limit, voltageLevel.base_voltage, voltageLevel.substation, voltageLevel.power_plant],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Insert VoltageLevel failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: voltageLevel, message: 'Insert VoltageLevel completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Insert VoltageLevel transaction failed' })
                })
        })
    })
}

// Thêm mới Substation trong transaction (cho lớp cha gọi)
export const insertVoltageLevelTransaction = async (voltageLevel, dbsql) => {
    await ensureVoltageLevelParentSchema(dbsql)
    return new Promise((resolve, reject) => {
        equipmentContainerFunc.insertEquipmentContainerTransaction(voltageLevel, dbsql)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Insert EquipmentContainer failed', err: result.err })
                }
                dbsql.run(
                    `INSERT INTO voltage_level(mrid, high_voltage_limit, low_voltage_limit, base_voltage, substation, power_plant)
                     VALUES (?, ?, ?, ?, ?, ?)
                     ON CONFLICT(mrid) DO UPDATE SET
                        high_voltage_limit = excluded.high_voltage_limit,
                        low_voltage_limit = excluded.low_voltage_limit,
                        base_voltage = excluded.base_voltage,
                        substation = excluded.substation,
                        power_plant = excluded.power_plant`,
                    [voltageLevel.mrid, voltageLevel.high_voltage_limit, voltageLevel.low_voltage_limit, voltageLevel.base_voltage, voltageLevel.substation, voltageLevel.power_plant],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Insert VoltageLevel failed' })
                        }
                        return resolve({ success: true, data: voltageLevel, message: 'Insert VoltageLevel completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Insert VoltageLevel transaction failed' })
            })
    })
}


// Lấy VoltageLevel theo mrid (gộp cả cha, trả về data: data)
export const getVoltageLevelById = async (mrid) => {
    try {
        await ensureVoltageLevelParentSchema()
        const ecResult = await equipmentContainerFunc.getEquipmentContainerById(mrid)
        if (!ecResult.success) {
            return { success: false, data: null, message: 'EquipmentContainer not found' }
        }
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM voltage_level WHERE mrid = ?", [mrid], (err, row) => {
                if (err) return reject({ success: false, data: null, message: 'Get VoltageLevel failed', err })
                if (!row) return resolve({ success: false, data: null, message: 'VoltageLevel not found' })
                const data = { ...ecResult.data, ...row }
                return resolve({ success: true, data: data, message: 'Get VoltageLevel completed' })
            })
        })
    } catch (err) {
        return { success: false, data: null, message: 'Get VoltageLevel failed', err }
    }
}

const getVoltageLevelsByParent = async (column, parentId, parentLabel) => {
    await ensureVoltageLevelParentSchema()
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                vl.*, 
                io.*
            FROM voltage_level vl
            JOIN identified_object io ON vl.mrid = io.mrid
            WHERE vl.${column} = ?
        `;

        db.all(sql, [parentId], (err, rows) => {
            if (err) {
                console.error(`Get VoltageLevels by ${parentLabel} failed:`, err);
                return reject({
                    success: false,
                    data: null,
                    message: `Get VoltageLevels by ${parentLabel} failed`,
                    err
                });
            }

            if (!rows || rows.length === 0) {
                return resolve({
                    success: false,
                    data: [],
                    message: `No voltage levels found for this ${parentLabel}`
                });
            }

            return resolve({
                success: true,
                data: rows,
                message: `Get VoltageLevels by ${parentLabel} completed`
            });
        });
    });
};

export const getVoltageLevelsBySubstationId = (substationId) =>
    getVoltageLevelsByParent('substation', substationId, 'substation')

export const getVoltageLevelsByPowerPlantId = (powerPlantId) =>
    getVoltageLevelsByParent('power_plant', powerPlantId, 'power plant')



// Cập nhật VoltageLevel (gồm cả EquipmentContainer)
export const updateVoltageLevelById = async (mrid, voltageLevel) => {
    await ensureVoltageLevelParentSchema()
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            equipmentContainerFunc.updateEquipmentContainerByIdTransaction(mrid, voltageLevel, db)
                .then(result => {
                    if (!result.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Update EquipmentContainer failed', err: result.err })
                    }
                    db.run(
                        `UPDATE voltage_level SET
                            high_voltage_limit = ?,
                            low_voltage_limit = ?,
                            base_voltage = ?,
                            substation = ?,
                            power_plant = ?
                     WHERE mrid = ?`,
                        [voltageLevel.high_voltage_limit, voltageLevel.low_voltage_limit, voltageLevel.base_voltage, voltageLevel.substation, voltageLevel.power_plant, mrid],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Update VoltageLevel failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: voltageLevel, message: 'Update VoltageLevel completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Update VoltageLevel transaction failed' })
                })
        })
    })
}

// Cập nhật VoltageLevel trong transaction (cho lớp cha gọi)
export const updateVoltageLevelByIdTransaction = async (mrid, voltageLevel, dbsql) => {
    await ensureVoltageLevelParentSchema(dbsql)
    return new Promise((resolve, reject) => {
        equipmentContainerFunc.updateEquipmentContainerByIdTransaction(mrid, voltageLevel, dbsql)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Update EquipmentContainer failed', err: result.err })
                }
                dbsql.run(
                    `UPDATE voltage_level SET
                        high_voltage_limit = ?,
                        low_voltage_limit = ?,
                        base_voltage = ?,
                        substation = ?,
                        power_plant = ?
                     WHERE mrid = ?`,
                    [voltageLevel.high_voltage_limit, voltageLevel.low_voltage_limit, voltageLevel.base_voltage, voltageLevel.substation, voltageLevel.power_plant, mrid],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Update VoltageLevel failed' })
                        }
                        return resolve({ success: true, data: voltageLevel, message: 'Update VoltageLevel completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Update VoltageLevel transaction failed' })
            })
    })
}

// Xóa VoltageLevel (gồm cả EquipmentContainer, dùng cascade)
export const deleteVoltageLevelById = async (mrid) => {
    return new Promise((resolve, reject) => {
        equipmentContainerFunc.deleteEquipmentContainerByIdTransaction(mrid, db)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete EquipmentContainer failed', err: result.err })
                }
                return resolve({ success: true, message: 'Delete Substation (and EquipmentContainer) completed' })
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Delete VoltageLevel transaction failed' })
            })
    })
}

// Xóa VoltageLevel trong transaction (cho lớp cha gọi)
export const deleteVoltageLevelByIdTransaction = async (mrid, dbsql) => {
    return equipmentContainerFunc.deleteEquipmentContainerByIdTransaction(mrid, dbsql)
}
