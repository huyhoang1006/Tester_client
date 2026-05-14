import * as standardFunc from '../standard/index.js';
import db from '../../datacontext/index'
import { runPromise } from '../common/index.js'

// Lấy isoStandard theo mrid
export const getIsoStandardById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM iso_standard WHERE mrid=?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get isoStandard by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'IsoStandard not found' })
                return resolve({ success: true, data: row, message: 'Get isoStandard by id completed' })
            }
        )
    })
}

// Thêm mới isoStandard
export const insertIsoStandardTransaction = async (data, dbsql) => {

    // 1. insert standard
    const result = await standardFunc.insertStandardTransaction(data, dbsql)

    if (!result.success) {
        throw new Error('Insert standard failed')
    }

    // 2. upsert iso_standard
    await runPromise(
        dbsql,
        `INSERT INTO iso_standard (mrid, standard_edition, standard_number)
     VALUES (?, ?, ?)
     ON CONFLICT(mrid) DO UPDATE SET
       standard_edition = excluded.standard_edition,
       standard_number = excluded.standard_number`,
        [data.mrid, data.standard_edition, data.standard_number]
    )

    return { success: true }
}
// Xóa isoStandard
export const deleteIsoStandardByIdTransaction = async (mrid, dbsql) => {

    // optional → không cần check
    await runPromise(
        dbsql,
        "DELETE FROM iso_standard WHERE mrid=?",
        [mrid]
    )

    // core → phải check
    const result = await standardFunc.deleteStandardByIdTransaction(mrid, dbsql)

    if (!result.success) {
        throw new Error('Delete related standard failed')
    }

    return { success: true }
}