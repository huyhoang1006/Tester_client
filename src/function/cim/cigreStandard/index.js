import db from '../../datacontext/index'

// Lấy cigreStandard theo mrid
export const getCigreStandardById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM cigre_standard WHERE mrid=?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get cigreStandard by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'CigreStandard not found' })
                return resolve({ success: true, data: row, message: 'Get cigreStandard by id completed' })
            }
        )
    })
}

// Thêm mới cigreStandard
export const insertCigreStandardTransaction = async (cigreStandard, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO cigre_standard(
                mrid, standard_edition, standard_number
            ) VALUES (?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                standard_edition = excluded.standard_edition,
                standard_number = excluded.standard_number
            `,
            [
                cigreStandard.mrid,
                cigreStandard.standard_edition,
                cigreStandard.standard_number
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert cigreStandard failed' })
                return resolve({ success: true, data: cigreStandard, message: 'Insert cigreStandard completed' })
            }
        )
    })
}

// Cập nhật cigreStandard
export const updateCigreStandardByIdTransaction = async (mrid, cigreStandard, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE cigre_standard SET
                standard_edition = ?,
                standard_number = ?
            WHERE mrid = ?`,
            [
                cigreStandard.standard_edition,
                cigreStandard.standard_number,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update cigreStandard failed' })
                return resolve({ success: true, data: cigreStandard, message: 'Update cigreStandard completed' })
            }
        )
    })
}

// Xóa cigreStandard
export const deleteCigreStandardByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM cigre_standard WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete cigreStandard failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'CigreStandard not found' })
            return resolve({ success: true, data: null, message: 'Delete cigreStandard completed' })
        })
    })
}