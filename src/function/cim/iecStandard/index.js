import db from '../../datacontext/index'

// Lấy iecStandard theo mrid
export const getIecStandardById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM iec_standard WHERE mrid=?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get cigreStandard by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'CigreStandard not found' })
                return resolve({ success: true, data: row, message: 'Get cigreStandard by id completed' })
            }
        )
    })
}

// Thêm mới iecStandard
export const insertIecStandardTransaction = async (iecStandard, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO iec_standard(
                mrid, standard_edition, standard_number
            ) VALUES (?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                standard_edition = excluded.standard_edition,
                standard_number = excluded.standard_number
            `,
            [
                iecStandard.mrid,
                iecStandard.standard_edition,
                iecStandard.standard_number
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert iecStandard failed' })
                return resolve({ success: true, data: iecStandard, message: 'Insert iecStandard completed' })
            }
        )
    })
}

// Cập nhật iecStandard
export const updateIecStandardByIdTransaction = async (mrid, iecStandard, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE iec_standard SET
                standard_edition = ?,
                standard_number = ?
            WHERE mrid = ?`,
            [
                iecStandard.standard_edition,
                iecStandard.standard_number,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update iecStandard failed' })
                return resolve({ success: true, data: iecStandard, message: 'Update iecStandard completed' })
            }
        )
    })
}

// Xóa iecStandard
export const deleteIecStandardByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM iec_standard WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete cigreStandard failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'CigreStandard not found' })
            return resolve({ success: true, data: null, message: 'Delete cigreStandard completed' })
        })
    })
}