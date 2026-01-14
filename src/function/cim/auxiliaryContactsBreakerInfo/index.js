import db from '../../datacontext/index'

// Lấy auxiliaryContactsBreakerInfo theo mrid
export const getAuxiliaryContactsBreakerInfoById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM auxiliary_contacts_breaker_info WHERE mrid = ?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get auxiliaryContactsBreakerInfo by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'AuxiliaryContactsBreakerInfo not found' })
                return resolve({ success: true, data: row, message: 'Get auxiliaryContactsBreakerInfo by id completed' })
            }
        )
    })
}

// Lấy danh sách theo assessment_limit_breaker_info_id
export const getAuxiliaryContactsBreakerInfoByAssessmentLimitId = async (assessmentLimitId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM auxiliary_contacts_breaker_info WHERE assessment_limit_breaker_info_id = ?`,
            [assessmentLimitId],
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get auxiliaryContactsBreakerInfo by assessment_limit_breaker_info_id failed' })
                return resolve({ success: true, data: rows, message: 'Get auxiliaryContactsBreakerInfo by assessment_limit_breaker_info_id completed' })
            }
        )
    })
}

// Thêm mới auxiliaryContactsBreakerInfo (transaction)
export const insertAuxiliaryContactsBreakerInfoTransaction = async (info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO auxiliary_contacts_breaker_info(
                mrid, assessment_limit_breaker_info_id
            ) VALUES (?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                assessment_limit_breaker_info_id = excluded.assessment_limit_breaker_info_id
            `,
            [
                info.mrid,
                info.assessment_limit_breaker_info_id
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert auxiliaryContactsBreakerInfo failed' })
                return resolve({ success: true, data: info, message: 'Insert auxiliaryContactsBreakerInfo completed' })
            }
        )
    })
}

// Cập nhật auxiliaryContactsBreakerInfo (transaction)
export const updateAuxiliaryContactsBreakerInfoTransaction = async (mrid, info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE auxiliary_contacts_breaker_info SET
                assessment_limit_breaker_info_id = ?
            WHERE mrid = ?`,
            [
                info.assessment_limit_breaker_info_id,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update auxiliaryContactsBreakerInfo failed' })
                return resolve({ success: true, data: info, message: 'Update auxiliaryContactsBreakerInfo completed' })
            }
        )
    })
}

// Xóa auxiliaryContactsBreakerInfo (transaction)
export const deleteAuxiliaryContactsBreakerInfoTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM auxiliary_contacts_breaker_info WHERE mrid = ?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete auxiliaryContactsBreakerInfo failed' })
            return resolve({ success: true, data: mrid, message: 'Delete auxiliaryContactsBreakerInfo completed' })
        })
    })
}