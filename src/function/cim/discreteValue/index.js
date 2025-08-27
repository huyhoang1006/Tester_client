import db from '../../datacontext/index'
import * as measurementValueFunc from '../measurementValue/index'

// Lấy discreteValue theo mrid
export const getDiscreteValueById = async (mrid) => {
    try {
        const measurementValue = await measurementValueFunc.getMeasurementValueById(mrid)
        if (!measurementValue.success) {
            return { success: false, data: null, message: 'MeasurementValue not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM discrete_value WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get discreteValue by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'DiscreteValue not found' })
                    return resolve({ success: true, data: { ...measurementValue.data, ...row }, message: 'Get discreteValue by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get discreteValue by id failed' }
    }
}

// Thêm mới discreteValue
export const insertDiscreteValueTransaction = async (discreteValue, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thêm measurementValue trước
            const mvResult = await measurementValueFunc.insertMeasurementValueTransaction(discreteValue, dbsql)
            if (!mvResult.success) {
                return reject({ success: false, message: 'Insert measurementValue failed', err: mvResult.err })
            }
            dbsql.run(
                `INSERT INTO discrete_value(
                    mrid, value, discrete
                ) VALUES (?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    value = excluded.value,
                    discrete = excluded.discrete
                `,
                [
                    discreteValue.mrid,
                    discreteValue.value,
                    discreteValue.discrete
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert discreteValue failed' })
                    return resolve({ success: true, data: discreteValue, message: 'Insert discreteValue completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert discreteValue failed' })
        }
    })
}

// Cập nhật discreteValue
export const updateDiscreteValueByIdTransaction = async (mrid, discreteValue, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Cập nhật measurementValue trước
            const mvResult = await measurementValueFunc.updateMeasurementValueByIdTransaction(mrid, discreteValue, dbsql)
            if (!mvResult.success) {
                return reject({ success: false, message: 'Update measurementValue failed', err: mvResult.err })
            }
            dbsql.run(
                `UPDATE discrete_value SET
                    value = ?,
                    discrete = ?
                WHERE mrid = ?`,
                [
                    discreteValue.value,
                    discreteValue.discrete,
                    mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update discreteValue failed' })
                    return resolve({ success: true, data: discreteValue, message: 'Update discreteValue completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update discreteValue failed' })
        }
    })
}

// Xóa discreteValue
export const deleteDiscreteValueByIdTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM discrete_value WHERE mrid=?", [mrid], function (err) {
                if (err) return reject({ success: false, err, message: 'Delete discreteValue failed' })
                if (this.changes === 0) return resolve({ success: false, data: null, message: 'DiscreteValue not found' })
                // Xóa measurementValue sau khi xóa discreteValue
                measurementValueFunc.deleteMeasurementValueByIdTransaction(mrid, dbsql)
                return resolve({ success: true, data: null, message: 'Delete discreteValue completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete discreteValue failed' })
        }
    })
}