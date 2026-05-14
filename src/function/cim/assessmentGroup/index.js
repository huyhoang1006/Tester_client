import db from '../../datacontext/index'
import { runPromise } from '../common/index.js'

// Lấy AssessmentGroup theo mrid
export const getAssessmentGroupById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM assessment_group WHERE mrid=?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get assessment group by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'Assessment group not found' })
                return resolve({ success: true, data: row, message: 'Get assessment group by id completed' })
            }
        )
    })
}

export const getAssessmentGroupByRuleId = async (ruleId) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM assessment_group WHERE rule_id=?`,
            [ruleId],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get assessment group by rule id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'Assessment group not found' })
                return resolve({ success: true, data: row, message: 'Get assessment group by rule id completed' })
            }
        )
    })
}

export const getAssessmentGroupByParentId = async (parentId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM assessment_group WHERE parent_id=?`,
            [parentId],
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get assessment group by parent id failed' })
                if (!rows || rows.length === 0) return resolve({ success: false, data: null, message: 'Assessment group not found' })
                return resolve({ success: true, data: rows, message: 'Get assessment group by parent id completed' })
            }
        )
    })
}

// Thêm mới assessment group
export const insertAssessmentGroupTransaction = async (data, dbsql) => {

    // 2. upsert astm_standard
    await runPromise(
        dbsql,
        `INSERT INTO assessment_group (mrid, rule_id, parent_id, logic, is_default)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(mrid) DO UPDATE SET
       rule_id = excluded.rule_id,
       parent_id = excluded.parent_id,
       logic = excluded.logic,
       is_default = excluded.is_default`,
        [data.mrid, data.rule_id, data.parent_id, data.logic, data.is_default]
    )

    return { success: true }
}
// Xóa assessment group
export const deleteAssessmentGroupByIdTransaction = async (mrid, dbsql) => {

    // optional → không cần check
    await runPromise(
        dbsql,
        "DELETE FROM assessment_group WHERE mrid=?",
        [mrid]
    )

    return { success: true }
}