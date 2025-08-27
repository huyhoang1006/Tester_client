import db from '../../datacontext/index'
import * as measurementValueSourceFunc from '../measurementValueSource/index'

// Lấy iopointSource theo mrid
export const getIOPointSourceById = async (mrid) => {
    try {
        const measurementValueSource = await measurementValueSourceFunc.getMeasurementValueSourceById(mrid)
        if (!measurementValueSource.success) {
            return { success: false, data: null, message: 'MeasurementValueSource not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM iopoint_source WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get iopointSource by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'IOPointSource not found' })
                    return resolve({ success: true, data: { ...measurementValueSource.data, ...row }, message: 'Get iopointSource by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get iopointSource by id failed' }
    }
}

// Thêm mới iopointSource
export const insertIOPointSourceTransaction = async (iopointSource, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thêm measurementValueSource trước
            const mvsResult = await measurementValueSourceFunc.insertMeasurementValueSourceTransaction(iopointSource, dbsql)
            if (!mvsResult.success) {
                return reject({ success: false, message: 'Insert measurementValueSource failed', err: mvsResult.err })
            }
            dbsql.run(
                `INSERT INTO iopoint_source(
                    mrid
                ) VALUES (?)
                ON CONFLICT(mrid) DO UPDATE SET
                    mrid = excluded.mrid
                `,
                [
                    iopointSource.mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert iopointSource failed' })
                    return resolve({ success: true, data: iopointSource, message: 'Insert iopointSource completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert iopointSource failed' })
        }
    })
}

// Cập nhật iopointSource
export const updateIOPointSourceByIdTransaction = async (mrid, iopointSource, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Cập nhật measurementValueSource trước
            const mvsResult = await measurementValueSourceFunc.updateMeasurementValueSourceByIdTransaction(mrid, iopointSource, dbsql)
            if (!mvsResult.success) {
                return reject({ success: false, message: 'Update measurementValueSource failed', err: mvsResult.err })
            }
            dbsql.run(
                `UPDATE iopoint_source SET
                    mrid = ?
                WHERE mrid = ?`,
                [
                    iopointSource.mrid,
                    mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update iopointSource failed' })
                    return resolve({ success: true, data: iopointSource, message: 'Update iopointSource completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update iopointSource failed' })
        }
    })
}

// Xóa iopointSource
export const deleteIOPointSourceByIdTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM iopoint_source WHERE mrid=?", [mrid], function (err) {
                if (err) return reject({ success: false, err, message: 'Delete iopointSource failed' })
                if (this.changes === 0) return resolve({ success: false, data: null, message: 'IOPointSource not found' })
                // Xóa measurementValueSource sau khi xóa iopointSource
                measurementValueSourceFunc.deleteMeasurementValueSourceByIdTransaction(mrid, dbsql)
                return resolve({ success: true, data: null, message: 'Delete iopointSource completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete iopointSource failed' })
        }
    })
}