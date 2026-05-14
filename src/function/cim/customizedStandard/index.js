import * as standardFunc from '../standard/index.js';
import db from '../../datacontext/index'
import { runPromise } from '../common/index.js'

// Lấy customizedStandard theo mrid
export const getCustomizedStandardById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM customized_standard WHERE mrid=?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get customizedStandard by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'CustomizedStandard not found' })
                return resolve({ success: true, data: row, message: 'Get customizedStandard by id completed' })
            }
        )
    })
}

// Thêm mới customizedStandard
export const insertCustomizedStandardTransaction = async (data, dbsql) => {

    // 1. insert standard
    const result = await standardFunc.insertStandardTransaction(data, dbsql)

    if (!result.success) {
        throw new Error('Insert standard failed')
    }

    // 2. upsert customized_standard
    await runPromise(
        dbsql,
        `INSERT INTO customized_standard (mrid)
     VALUES (?)
     ON CONFLICT(mrid) DO NOTHING
    `,
        [data.mrid]
    )

    return { success: true }
}
// Xóa customizedStandard
export const deleteCustomizedStandardByIdTransaction = async (mrid, dbsql) => {

    // optional → không cần check
    await runPromise(
        dbsql,
        "DELETE FROM customized_standard WHERE mrid=?",
        [mrid]
    )

    // core → phải check
    const result = await standardFunc.deleteStandardByIdTransaction(mrid, dbsql)

    if (!result.success) {
        throw new Error('Delete related standard failed')
    }

    return { success: true }
}