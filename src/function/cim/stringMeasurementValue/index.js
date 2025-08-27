import db from '../../datacontext/index'
import * as measurementValueFunc from '../measurementValue/index'

// Lấy stringMeasurementValue theo mrid
export const getStringMeasurementValueById = async (mrid) => {
    try {
        const measurementValue = await measurementValueFunc.getMeasurementValueById(mrid)
        if (!measurementValue.success) {
            return { success: false, data: null, message: 'MeasurementValue not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM string_measurement_value WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get stringMeasurementValue by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'StringMeasurementValue not found' })
                    return resolve({ success: true, data: { ...measurementValue.data, ...row }, message: 'Get stringMeasurementValue by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get stringMeasurementValue by id failed' }
    }
}

// Thêm mới stringMeasurementValue
export const insertStringMeasurementValueTransaction = async (stringMeasurementValue, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thêm measurementValue trước
            const mvResult = await measurementValueFunc.insertMeasurementValueTransaction(stringMeasurementValue, dbsql)
            if (!mvResult.success) {
                return reject({ success: false, message: 'Insert measurementValue failed', err: mvResult.err })
            }
            dbsql.run(
                `INSERT INTO string_measurement_value(
                    mrid, value, string_measurement
                ) VALUES (?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    value = excluded.value,
                    string_measurement = excluded.string_measurement
                `,
                [
                    stringMeasurementValue.mrid,
                    stringMeasurementValue.value,
                    stringMeasurementValue.string_measurement
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert stringMeasurementValue failed' })
                    return resolve({ success: true, data: stringMeasurementValue, message: 'Insert stringMeasurementValue completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert stringMeasurementValue failed' })
        }
    })
}

// Cập nhật stringMeasurementValue
export const updateStringMeasurementValueByIdTransaction = async (mrid, stringMeasurementValue, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Cập nhật measurementValue trước
            const mvResult = await measurementValueFunc.updateMeasurementValueByIdTransaction(mrid, stringMeasurementValue, dbsql)
            if (!mvResult.success) {
                return reject({ success: false, message: 'Update measurementValue failed', err: mvResult.err })
            }
            dbsql.run(
                `UPDATE string_measurement_value SET
                    value = ?,
                    string_measurement = ?
                WHERE mrid = ?`,
                [
                    stringMeasurementValue.value,
                    stringMeasurementValue.string_measurement,
                    mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update stringMeasurementValue failed' })
                    return resolve({ success: true, data: stringMeasurementValue, message: 'Update stringMeasurementValue completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update stringMeasurementValue failed' })
        }
    })
}

// Xóa stringMeasurementValue
export const deleteStringMeasurementValueByIdTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM string_measurement_value WHERE mrid=?", [mrid], function (err) {
                if (err) return reject({ success: false, err, message: 'Delete stringMeasurementValue failed' })
                if (this.changes === 0) return resolve({ success: false, data: null, message: 'StringMeasurementValue not found' })
                // Xóa measurementValue sau khi xóa stringMeasurementValue
                measurementValueFunc.deleteMeasurementValueByIdTransaction(mrid, dbsql)
                return resolve({ success: true, data: null, message: 'Delete stringMeasurementValue completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete stringMeasurementValue failed' })
        }
    })
}