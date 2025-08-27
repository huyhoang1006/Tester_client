import db from '../../datacontext/index'
import * as identifiedObjectFunc from '../identifiedObject/index'

// Lấy measurementValueSource theo mrid
export const getMeasurementValueSourceById = async (mrid) => {
    try {
        const identifiedObject = await identifiedObjectFunc.getIdentifiedObjectById(mrid)
        if (!identifiedObject.success) {
            return { success: false, data: null, message: 'IdentifiedObject not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM measurement_value_source WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get measurementValueSource by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'MeasurementValueSource not found' })
                    return resolve({ success: true, data: { ...identifiedObject.data, ...row }, message: 'Get measurementValueSource by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get measurementValueSource by id failed' }
    }
}

// Thêm mới measurementValueSource
export const insertMeasurementValueSourceTransaction = async (measurementValueSource, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thêm identifiedObject trước
            const idObjResult = await identifiedObjectFunc.insertIdentifiedObjectTransaction(measurementValueSource, dbsql)
            if (!idObjResult.success) {
                return reject({ success: false, message: 'Insert identifiedObject failed', err: idObjResult.err })
            }
            dbsql.run(
                `INSERT INTO measurement_value_source(
                    mrid
                ) VALUES (?)
                ON CONFLICT(mrid) DO UPDATE SET
                    mrid = excluded.mrid
                `,
                [
                    measurementValueSource.mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert measurementValueSource failed' })
                    return resolve({ success: true, data: measurementValueSource, message: 'Insert measurementValueSource completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert measurementValueSource failed' })
        }
    })
}

// Cập nhật measurementValueSource
export const updateMeasurementValueSourceByIdTransaction = async (mrid, measurementValueSource, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Cập nhật identifiedObject trước
            const idObjResult = await identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, measurementValueSource, dbsql)
            if (!idObjResult.success) {
                return reject({ success: false, message: 'Update identifiedObject failed', err: idObjResult.err })
            }
            dbsql.run(
                `UPDATE measurement_value_source SET
                    mrid = ?
                WHERE mrid = ?`,
                [
                    measurementValueSource.mrid,
                    mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update measurementValueSource failed' })
                    return resolve({ success: true, data: measurementValueSource, message: 'Update measurementValueSource completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update measurementValueSource failed' })
        }
    })
}

// Xóa measurementValueSource
export const deleteMeasurementValueSourceByIdTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM measurement_value_source WHERE mrid=?", [mrid], function (err) {
                if (err) return reject({ success: false, err, message: 'Delete measurementValueSource failed' })
                if (this.changes === 0) return resolve({ success: false, data: null, message: 'MeasurementValueSource not found' })
                // Xóa identifiedObject sau khi xóa measurementValueSource
                identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, dbsql)
                return resolve({ success: true, data: null, message: 'Delete measurementValueSource completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete measurementValueSource failed' })
        }
    })
}