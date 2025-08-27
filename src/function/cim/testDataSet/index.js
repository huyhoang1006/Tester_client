import db from '../../datacontext/index'
import * as procedureDataSetFunc from '../procedureDataSet/index'

// Lấy testDataSet theo mrid
export const getTestDataSetById = async (mrid) => {
    try {
        const procedureDataSet = await procedureDataSetFunc.getProcedureDataSetById(mrid)
        if (!procedureDataSet.success) {
            return { success: false, data: null, message: 'ProcedureDataSet not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM test_dataset WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get testDataSet by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'TestDataSet not found' })
                    return resolve({ success: true, data: { ...procedureDataSet.data, ...row }, message: 'Get testDataSet by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get testDataSet by id failed' }
    }
}

// Thêm mới testDataSet
export const insertTestDataSetTransaction = async (testDataSet, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thêm procedureDataSet trước
            const procResult = await procedureDataSetFunc.insertProcedureDataSetTransaction(testDataSet, dbsql)
            if (!procResult.success) {
                return reject({ success: false, message: 'Insert procedureDataSet failed', err: procResult.err })
            }
            dbsql.run(
                `INSERT INTO test_dataset(
                    mrid, conclusion, specimen_id, specimen_to_lab_date_time
                ) VALUES (?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    conclusion = excluded.conclusion,
                    specimen_id = excluded.specimen_id,
                    specimen_to_lab_date_time = excluded.specimen_to_lab_date_time
                `,
                [
                    testDataSet.mrid,
                    testDataSet.conclusion,
                    testDataSet.specimen_id,
                    testDataSet.specimen_to_lab_date_time
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert testDataSet failed' })
                    return resolve({ success: true, data: testDataSet, message: 'Insert testDataSet completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert testDataSet failed' })
        }
    })
}

// Cập nhật testDataSet
export const updateTestDataSetByIdTransaction = async (mrid, testDataSet, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Cập nhật procedureDataSet trước
            const procResult = await procedureDataSetFunc.updateProcedureDataSetByIdTransaction(mrid, testDataSet, dbsql)
            if (!procResult.success) {
                return reject({ success: false, message: 'Update procedureDataSet failed', err: procResult.err })
            }
            dbsql.run(
                `UPDATE test_dataset SET
                    conclusion = ?,
                    specimen_id = ?,
                    specimen_to_lab_date_time = ?
                WHERE mrid = ?`,
                [
                    testDataSet.conclusion,
                    testDataSet.specimen_id,
                    testDataSet.specimen_to_lab_date_time,
                    mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update testDataSet failed' })
                    return resolve({ success: true, data: testDataSet, message: 'Update testDataSet completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update testDataSet failed' })
        }
    })
}

// Xóa testDataSet
export const deleteTestDataSetByIdTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM test_dataset WHERE mrid=?", [mrid], function (err) {
                if (err) return reject({ success: false, err, message: 'Delete testDataSet failed' })
                if (this.changes === 0) return resolve({ success: false, data: null, message: 'TestDataSet not found' })
                // Xóa procedureDataSet sau khi xóa testDataSet
                procedureDataSetFunc.deleteProcedureDataSetByIdTransaction(mrid, dbsql)
                return resolve({ success: true, data: null, message: 'Delete testDataSet completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete testDataSet failed' })
        }
    })
}