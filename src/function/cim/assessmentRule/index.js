import db from '../../datacontext/index'
import { runPromise } from '../common/index.js'

// Lấy Assessment theo mrid
export const getAssessmentRuleById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM assessment_rule WHERE mrid=?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get assessment rule by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'Assessment rule not found' })
                return resolve({ success: true, data: row, message: 'Get assessment rule by id completed' })
            }
        )
    })
}

export const getAssessmentRuleByStandardId = async (standardId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM assessment_rule WHERE standard_id=?`,
            [standardId],
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get assessment rule by standard id failed' })
                if (!rows || rows.length === 0) return resolve({ success: false, data: null, message: 'Assessment rule not found' })
                return resolve({ success: true, data: rows, message: 'Get assessment rule by standard id completed' })
            }
        )
    })
}

// Thêm mới assessment rule
export const insertAssessmentRuleTransaction = async (data, dbsql) => {

    // 2. upsert astm_standard
    await runPromise(
        dbsql,
        `INSERT INTO assessment_rule (mrid, standard_id, result, priority)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(mrid) DO UPDATE SET
       standard_id = excluded.standard_id,
       result = excluded.result,
       priority = excluded.priority`,
        [data.mrid, data.standard_id, data.result, data.priority]
    )

    return { success: true }
}
// Xóa assessment rule
export const deleteAssessmentRuleByIdTransaction = async (mrid, dbsql) => {

    // optional → không cần check
    await runPromise(
        dbsql,
        "DELETE FROM assessment_rule WHERE mrid=?",
        [mrid]
    )

    return { success: true }
}