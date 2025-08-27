import db from '../../datacontext/index'
import * as iopointFunc from '../iopoint/index'

// Lấy measurementValue theo mrid
export const getMeasurementValueById = async (mrid) => {
    try {
        const iopoint = await iopointFunc.getIOPointById(mrid)
        if (!iopoint.success) {
            return { success: false, data: null, message: 'IOPoint not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM measurement_value WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get measurementValue by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'MeasurementValue not found' })
                    return resolve({ success: true, data: { ...iopoint.data, ...row }, message: 'Get measurementValue by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get measurementValue by id failed' }
    }
}

// Thêm mới measurementValue
export const insertMeasurementValueTransaction = async (measurementValue, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thêm iopoint trước
            const ioResult = await iopointFunc.insertIOPointTransaction(measurementValue, dbsql)
            if (!ioResult.success) {
                return reject({ success: false, message: 'Insert iopoint failed', err: ioResult.err })
            }
            dbsql.run(
                `INSERT INTO measurement_value(
                    mrid, sensor_accuracy, time_stamp, measurement_value_source, calculation_method_hierarchy, erp_person
                ) VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    sensor_accuracy = excluded.sensor_accuracy,
                    time_stamp = excluded.time_stamp,
                    measurement_value_source = excluded.measurement_value_source,
                    calculation_method_hierarchy = excluded.calculation_method_hierarchy,
                    erp_person = excluded.erp_person
                `,
                [
                    measurementValue.mrid,
                    measurementValue.sensor_accuracy,
                    measurementValue.time_stamp,
                    measurementValue.measurement_value_source,
                    measurementValue.calculation_method_hierarchy,
                    measurementValue.erp_person
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert measurementValue failed' })
                    return resolve({ success: true, data: measurementValue, message: 'Insert measurementValue completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert measurementValue failed' })
        }
    })
}

// Cập nhật measurementValue
export const updateMeasurementValueByIdTransaction = async (mrid, measurementValue, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Cập nhật iopoint trước
            const ioResult = await iopointFunc.updateIOPointByIdTransaction(mrid, measurementValue, dbsql)
            if (!ioResult.success) {
                return reject({ success: false, message: 'Update iopoint failed', err: ioResult.err })
            }
            dbsql.run(
                `UPDATE measurement_value SET
                    sensor_accuracy = ?,
                    time_stamp = ?,
                    measurement_value_source = ?,
                    calculation_method_hierarchy = ?,
                    erp_person = ?
                WHERE mrid = ?`,
                [
                    measurementValue.sensor_accuracy,
                    measurementValue.time_stamp,
                    measurementValue.measurement_value_source,
                    measurementValue.calculation_method_hierarchy,
                    measurementValue.erp_person,
                    mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update measurementValue failed' })
                    return resolve({ success: true, data: measurementValue, message: 'Update measurementValue completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update measurementValue failed' })
        }
    })
}

// Xóa measurementValue
export const deleteMeasurementValueByIdTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM measurement_value WHERE mrid=?", [mrid], function (err) {
                if (err) return reject({ success: false, err, message: 'Delete measurementValue failed' })
                if (this.changes === 0) return resolve({ success: false, data: null, message: 'MeasurementValue not found' })
                // Xóa iopoint sau khi xóa measurementValue
                iopointFunc.deleteIOPointByIdTransaction(mrid, dbsql)
                return resolve({ success: true, data: null, message: 'Delete measurementValue completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete measurementValue failed' })
        }
    })
}