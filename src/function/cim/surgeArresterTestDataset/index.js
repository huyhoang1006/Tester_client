import db from '../../datacontext/index'
import * as testDataSetFunc from '../testDataSet/index'

// Lấy surgeArresterTestDataSet theo mrid
export const getSurgeArresterTestDataSetById = async (mrid) => {
    try {
        const testDataSet = await testDataSetFunc.getTestDataSetById(mrid)
        if (!testDataSet.success) {
            return { success: false, data: null, message: 'TestDataSet not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM surge_arrester_test_dataset WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get surgeArresterTestDataSet by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'SurgeArresterTestDataSet not found' })
                    return resolve({ success: true, data: { ...testDataSet.data, ...row }, message: 'Get surgeArresterTestDataSet by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get surgeArresterTestDataSet by id failed' }
    }
}

// Thêm mới surgeArresterTestDataSet
export const insertSurgeArresterTestDataSetTransaction = async (surgeArresterTestDataSet, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thêm testDataSet trước
            const testResult = await testDataSetFunc.insertTestDataSetTransaction(surgeArresterTestDataSet, dbsql)
            if (!testResult.success) {
                return reject({ success: false, message: 'Insert testDataSet failed', err: testResult.err })
            }
            dbsql.run(
                `INSERT INTO surge_arrester_test_dataset(
                    mrid, assessment, condition_indicator
                ) VALUES (?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    assessment = excluded.assessment,
                    condition_indicator = excluded.condition_indicator
                `,
                [
                    surgeArresterTestDataSet.mrid,
                    surgeArresterTestDataSet.assessment,
                    surgeArresterTestDataSet.condition_indicator
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert surgeArresterTestDataSet failed' })
                    return resolve({ success: true, data: surgeArresterTestDataSet, message: 'Insert surgeArresterTestDataSet completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert surgeArresterTestDataSet failed' })
        }
    })
}

// Cập nhật surgeArresterTestDataSet
export const updateSurgeArresterTestDataSetByIdTransaction = async (mrid, surgeArresterTestDataSet, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Cập nhật testDataSet trước
            const testResult = await testDataSetFunc.updateTestDataSetByIdTransaction(mrid, surgeArresterTestDataSet, dbsql)
            if (!testResult.success) {
                return reject({ success: false, message: 'Update testDataSet failed', err: testResult.err })
            }
            dbsql.run(
                `UPDATE surge_arrester_test_dataset SET
                    assessment = ?,
                    condition_indicator = ?
                WHERE mrid = ?`,
                [
                    surgeArresterTestDataSet.assessment,
                    surgeArresterTestDataSet.condition_indicator,
                    mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update surgeArresterTestDataSet failed' })
                    return resolve({ success: true, data: surgeArresterTestDataSet, message: 'Update surgeArresterTestDataSet completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update surgeArresterTestDataSet failed' })
        }
    })
}

// Xóa surgeArresterTestDataSet
export const deleteSurgeArresterTestDataSetByIdTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM surge_arrester_test_dataset WHERE mrid=?", [mrid], function (err) {
                if (err) return reject({ success: false, err, message: 'Delete surgeArresterTestDataSet failed' })
                if (this.changes === 0) return resolve({ success: false, data: null, message: 'SurgeArresterTestDataSet not found' })
                // Xóa testDataSet sau khi xóa surgeArresterTestDataSet
                testDataSetFunc.deleteTestDataSetByIdTransaction(mrid, dbsql)
                return resolve({ success: true, data: null, message: 'Delete surgeArresterTestDataSet completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete surgeArresterTestDataSet failed' })
        }
    })
}