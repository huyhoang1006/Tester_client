import * as standardFunc from '../standard/index.js';
import db from '../../datacontext/index'
import { runPromise } from '../common/index.js'

// Lấy tappiStandard theo mrid
export const getTappiStandardById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM tappi_standard WHERE mrid=?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get tappiStandard by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'TappiStandard not found' })
                return resolve({ success: true, data: row, message: 'Get tappiStandard by id completed' })
            }
        )
    })
}

// Thêm mới tappiStandard
export const insertTappiStandardTransaction = async (data, dbsql) => {

    // 1. insert standard
    const result = await standardFunc.insertStandardTransaction(data, dbsql)

    if (!result.success) {
        throw new Error('Insert standard failed')
    }

    // 2. upsert tappi_standard
    await runPromise(
        dbsql,
        `INSERT INTO tappi_standard (mrid, standard_edition, standard_number)
     VALUES (?, ?, ?)
     ON CONFLICT(mrid) DO UPDATE SET
       standard_edition = excluded.standard_edition,
       standard_number = excluded.standard_number`,
        [data.mrid, data.standard_edition, data.standard_number]
    )

    return { success: true }
}
// Xóa tappiStandard
export const deleteTappiStandardByIdTransaction = async (mrid, dbsql) => {

    // optional → không cần check
    await runPromise(
        dbsql,
        "DELETE FROM tappi_standard WHERE mrid=?",
        [mrid]
    )

    // core → phải check
    const result = await standardFunc.deleteStandardByIdTransaction(mrid, dbsql)

    if (!result.success) {
        throw new Error('Delete related standard failed')
    }

    return { success: true }
}