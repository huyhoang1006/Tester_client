import db from '../../datacontext/index'
import * as measurementValueFunc from '../measurementValue/index'

// Lấy analogValue theo mrid
export const getAnalogValueById = async (mrid) => {
    try {
        const measurementValue = await measurementValueFunc.getMeasurementValueById(mrid)
        if (!measurementValue.success) {
            return { success: false, data: null, message: 'MeasurementValue not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM analog_value WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get analogValue by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'AnalogValue not found' })
                    return resolve({ success: true, data: { ...measurementValue.data, ...row }, message: 'Get analogValue by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get analogValue by id failed' }
    }
}

// Thêm mới analogValue
export const insertAnalogValueTransaction = async (analogValue, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thêm measurementValue trước
            const mvResult = await measurementValueFunc.insertMeasurementValueTransaction(analogValue, dbsql)
            if (!mvResult.success) {
                return reject({ success: false, message: 'Insert measurementValue failed', err: mvResult.err })
            }
            dbsql.run(
                `INSERT INTO analog_value(
                    mrid, value, analog
                ) VALUES (?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    value = excluded.value,
                    analog = excluded.analog
                `,
                [
                    analogValue.mrid,
                    analogValue.value,
                    analogValue.analog
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert analogValue failed' })
                    return resolve({ success: true, data: analogValue, message: 'Insert analogValue completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert analogValue failed' })
        }
    })
}

// Cập nhật analogValue
export const updateAnalogValueByIdTransaction = async (mrid, analogValue, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Cập nhật measurementValue trước
            const mvResult = await measurementValueFunc.updateMeasurementValueByIdTransaction(mrid, analogValue, dbsql)
            if (!mvResult.success) {
                return reject({ success: false, message: 'Update measurementValue failed', err: mvResult.err })
            }
            dbsql.run(
                `UPDATE analog_value SET
                    value = ?,
                    analog = ?
                WHERE mrid = ?`,
                [
                    analogValue.value,
                    analogValue.analog,
                    mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update analogValue failed' })
                    return resolve({ success: true, data: analogValue, message: 'Update analogValue completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update analogValue failed' })
        }
    })
}

// Xóa analogValue
export const deleteAnalogValueByIdTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM analog_value WHERE mrid=?", [mrid], function (err) {
                if (err) return reject({ success: false, err, message: 'Delete analogValue failed' })
                if (this.changes === 0) return resolve({ success: false, data: null, message: 'AnalogValue not found' })
                // Xóa measurementValue sau khi xóa analogValue
                measurementValueFunc.deleteMeasurementValueByIdTransaction(mrid, dbsql)
                return resolve({ success: true, data: null, message: 'Delete analogValue completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete analogValue failed' })
        }
    })
}