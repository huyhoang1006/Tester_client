import db from '../../datacontext/index'
import * as measurementFunc from '../measurement/index'

// Lấy stringMeasurement theo mrid
export const getStringMeasurementById = async (mrid) => {
    try {
        const measurement = await measurementFunc.getMeasurementById(mrid)
        if (!measurement.success) {
            return { success: false, data: null, message: 'Measurement not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM string_measurement WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get stringMeasurement by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'StringMeasurement not found' })
                    return resolve({ success: true, data: { ...measurement.data, ...row }, message: 'Get stringMeasurement by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get stringMeasurement by id failed' }
    }
}

// Thêm mới stringMeasurement
export const insertStringMeasurementTransaction = async (stringMeasurement, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thêm measurement trước
            const measResult = await measurementFunc.insertMeasurementTransaction(stringMeasurement, dbsql)
            if (!measResult.success) {
                return reject({ success: false, message: 'Insert measurement failed', err: measResult.err })
            }
            dbsql.run(
                `INSERT INTO string_measurement(
                    mrid
                ) VALUES (?)
                ON CONFLICT(mrid) DO UPDATE SET
                    mrid = excluded.mrid
                `,
                [
                    stringMeasurement.mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert stringMeasurement failed' })
                    return resolve({ success: true, data: stringMeasurement, message: 'Insert stringMeasurement completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert stringMeasurement failed' })
        }
    })
}

// Cập nhật stringMeasurement
export const updateStringMeasurementByIdTransaction = async (mrid, stringMeasurement, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Cập nhật measurement trước
            const measResult = await measurementFunc.updateMeasurementByIdTransaction(mrid, stringMeasurement, dbsql)
            if (!measResult.success) {
                return reject({ success: false, message: 'Update measurement failed', err: measResult.err })
            }
            dbsql.run(
                `UPDATE string_measurement SET
                    mrid = ?
                WHERE mrid = ?`,
                [
                    stringMeasurement.mrid,
                    mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update stringMeasurement failed' })
                    return resolve({ success: true, data: stringMeasurement, message: 'Update stringMeasurement completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update stringMeasurement failed' })
        }
    })
}

// Xóa stringMeasurement
export const deleteStringMeasurementByIdTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM string_measurement WHERE mrid=?", [mrid], function (err) {
                if (err) return reject({ success: false, err, message: 'Delete stringMeasurement failed' })
                if (this.changes === 0) return resolve({ success: false, data: null, message: 'StringMeasurement not found' })
                // Xóa measurement sau khi xóa stringMeasurement
                measurementFunc.deleteMeasurementByIdTransaction(mrid, dbsql)
                return resolve({ success: true, data: null, message: 'Delete stringMeasurement completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete stringMeasurement failed' })
        }
    })
}