import db from '../../datacontext/index'
import { runPromise } from '../common/index.js'


// Lấy assessment theo mrid
export const getAssessmentById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM assessment WHERE mrid=?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get assessment by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'Assessment not found' })
                return resolve({ success: true, data: row, message: 'Get assessment by id completed' })
            }
        )
    })
}

// Lấy assessment theo mrid
export const getAssessmentInGroupIds = async (groupIds) => {
    if (!groupIds || groupIds.length === 0) {
        return {
            success: true,
            data: [],
            message: 'Empty input'
        }
    }

    return new Promise((resolve, reject) => {
        const placeholders = groupIds.map(() => '?').join(',')

        db.all(
            `SELECT * FROM assessment WHERE group_id IN (${placeholders})`,
            groupIds,
            (err, rows) => {
                if (err) {
                    return reject({
                        success: false,
                        err,
                        message: 'Get assessments failed'
                    })
                }

                resolve({
                    success: true,
                    data: rows || [],
                    message: 'Get assessments completed'
                })
            }
        )
    })
}

// Thêm mới assessment
export const insertAssessmentTransaction = async (data, dbsql) => {

    // 2. upsert assessment
    await runPromise(
        dbsql,
        `INSERT INTO assessment (mrid, group_id, measurement_id, operator, threshold)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(mrid) DO UPDATE SET
       group_id = excluded.group_id,
       measurement_id = excluded.measurement_id,
       operator = excluded.operator,
       threshold = excluded.threshold`,
        [data.mrid, data.group_id, data.measurement_id, data.operator, data.threshold]
    )

    return { success: true }
}
// Xóa assessment
export const deleteAssessmentByIdTransaction = async (mrid, dbsql) => {

    // optional → không cần check
    await runPromise(
        dbsql,
        "DELETE FROM assessment WHERE mrid=?",
        [mrid]
    )

    return { success: true }
}