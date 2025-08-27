import db from '../../datacontext/index'

// Lấy ieeeStandard theo mrid
export const getIeeeStandardById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM ieeeStandard WHERE mrid=?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get ieeeStandard by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'IeeeStandard not found' })
                return resolve({ success: true, data: row, message: 'Get ieeeStandard by id completed' })
            }
        )
    })
}

// Thêm mới ieeeStandard
export const insertIeeeStandardTransaction = async (ieeeStandard, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO ieeeStandard(
                mrid, standard_edition, standard_number
            ) VALUES (?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                standard_edition = excluded.standard_edition,
                standard_number = excluded.standard_number
            `,
            [
                ieeeStandard.mrid,
                ieeeStandard.standard_edition,
                ieeeStandard.standard_number
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert ieeeStandard failed' })
                return resolve({ success: true, data: ieeeStandard, message: 'Insert ieeeStandard completed' })
            }
        )
    })
}

// Cập nhật ieeeStandard
export const updateIeeeStandardByIdTransaction = async (mrid, ieeeStandard, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE ieeeStandard SET
                standard_edition = ?,
                standard_number = ?
            WHERE mrid = ?`,
            [
                ieeeStandard.standard_edition,
                ieeeStandard.standard_number,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update ieeeStandard failed' })
                return resolve({ success: true, data: ieeeStandard, message: 'Update ieeeStandard completed' })
            }
        )
    })
}

// Xóa ieeeStandard
export const deleteIeeeStandardByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM ieeeStandard WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete ieeeStandard failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'IeeeStandard not found' })
            return resolve({ success: true, data: null, message: 'Delete ieeeStandard completed' })
        })
    })
}