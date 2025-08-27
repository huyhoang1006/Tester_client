import db from '../../datacontext/index'
import * as identifiedObjectFunc from '../identifiedObject/index'

// Lấy measurement theo mrid
export const getMeasurementById = async (mrid) => {
    try {
        const identifiedObject = await identifiedObjectFunc.getIdentifiedObjectById(mrid)
        if (!identifiedObject.success) {
            return { success: false, data: null, message: 'IdentifiedObject not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM measurement WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get measurement by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'Measurement not found' })
                    return resolve({ success: true, data: { ...identifiedObject.data, ...row }, message: 'Get measurement by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get measurement by id failed' }
    }
}

// Thêm mới measurement
export const insertMeasurementTransaction = async (measurement, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thêm identifiedObject trước
            const idObjResult = await identifiedObjectFunc.insertIdentifiedObjectTransaction(measurement, dbsql)
            if (!idObjResult.success) {
                return reject({ success: false, message: 'Insert identifiedObject failed', err: idObjResult.err })
            }
            dbsql.run(
                `INSERT INTO measurement(
                    mrid, measurement_type, phases, unit_multiplier, unit_symbol, terminal,
                    calculation_method_hierarchy, power_system_resource, asset, measurement_action
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    measurement_type = excluded.measurement_type,
                    phases = excluded.phases,
                    unit_multiplier = excluded.unit_multiplier,
                    unit_symbol = excluded.unit_symbol,
                    terminal = excluded.terminal,
                    calculation_method_hierarchy = excluded.calculation_method_hierarchy,
                    power_system_resource = excluded.power_system_resource,
                    asset = excluded.asset,
                    measurement_action = excluded.measurement_action
                `,
                [
                    measurement.mrid,
                    measurement.measurement_type,
                    measurement.phases,
                    measurement.unit_multiplier,
                    measurement.unit_symbol,
                    measurement.terminal,
                    measurement.calculation_method_hierarchy,
                    measurement.power_system_resource,
                    measurement.asset,
                    measurement.measurement_action
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert measurement failed' })
                    return resolve({ success: true, data: measurement, message: 'Insert measurement completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert measurement failed' })
        }
    })
}

// Cập nhật measurement
export const updateMeasurementByIdTransaction = async (mrid, measurement, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Cập nhật identifiedObject trước
            const idObjResult = await identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, measurement, dbsql)
            if (!idObjResult.success) {
                return reject({ success: false, message: 'Update identifiedObject failed', err: idObjResult.err })
            }
            dbsql.run(
                `UPDATE measurement SET
                    measurement_type = ?,
                    phases = ?,
                    unit_multiplier = ?,
                    unit_symbol = ?,
                    terminal = ?,
                    calculation_method_hierarchy = ?,
                    power_system_resource = ?,
                    asset = ?,
                    measurement_action = ?
                WHERE mrid = ?`,
                [
                    measurement.measurement_type,
                    measurement.phases,
                    measurement.unit_multiplier,
                    measurement.unit_symbol,
                    measurement.terminal,
                    measurement.calculation_method_hierarchy,
                    measurement.power_system_resource,
                    measurement.asset,
                    measurement.measurement_action,
                    mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update measurement failed' })
                    return resolve({ success: true, data: measurement, message: 'Update measurement completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update measurement failed' })
        }
    })
}

// Xóa measurement
export const deleteMeasurementByIdTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM measurement WHERE mrid=?", [mrid], function (err) {
                if (err) return reject({ success: false, err, message: 'Delete measurement failed' })
                if (this.changes === 0) return resolve({ success: false, data: null, message: 'Measurement not found' })
                // Xóa identifiedObject sau khi xóa measurement
                identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, dbsql)
                return resolve({ success: true, data: null, message: 'Delete measurement completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete measurement failed'})
        }
    })
}