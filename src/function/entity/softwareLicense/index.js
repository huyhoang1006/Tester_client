import db from '../../datacontext/index'

// Lấy softwareLicense theo mrid
export const getSoftwareLicenseById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM software_license WHERE mrid=?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get softwareLicense by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'SoftwareLicense not found' })
                return resolve({ success: true, data: row, message: 'Get softwareLicense by id completed' })
            }
        )
    })
}

// Lấy tất cả softwareLicense
export const getAllSoftwareLicense = async () => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM software_license`,
            [],
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get all softwareLicense failed' })
                if (!rows || rows.length === 0) return resolve({ success: false, data: null, message: 'SoftwareLicense not found' })
                return resolve({ success: true, data: rows, message: 'Get all softwareLicense completed' })
            }
        )
    })
}

// Thêm mới softwareLicense
export const insertSoftwareLicenseTransaction = async (softwareLicense, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO software_license(
                mrid,
                option_name,
                license_key,
                enabled,
                description,
                activation_date,
                expiry_date,
                seat_count
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                option_name = excluded.option_name,
                license_key = excluded.license_key,
                enabled = excluded.enabled,
                description = excluded.description,
                activation_date = excluded.activation_date,
                expiry_date = excluded.expiry_date,
                seat_count = excluded.seat_count
            `,
            [
                softwareLicense.mrid,
                softwareLicense.option_name,
                softwareLicense.license_key,
                softwareLicense.enabled,
                softwareLicense.description,
                softwareLicense.activation_date,
                softwareLicense.expiry_date,
                softwareLicense.seat_count
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert softwareLicense failed' })
                return resolve({ success: true, data: softwareLicense, message: 'Insert softwareLicense completed' })
            }
        )
    })
}

// Cập nhật softwareLicense
export const updateSoftwareLicenseByIdTransaction = async (mrid, softwareLicense, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE software_license SET
                option_name = ?,
                license_key = ?,
                enabled = ?,
                description = ?,
                activation_date = ?,
                expiry_date = ?,
                seat_count = ?
            WHERE mrid = ?`,
            [
                softwareLicense.option_name,
                softwareLicense.license_key,
                softwareLicense.enabled,
                softwareLicense.description,
                softwareLicense.activation_date,
                softwareLicense.expiry_date,
                softwareLicense.seat_count,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update softwareLicense failed' })
                return resolve({ success: true, data: softwareLicense, message: 'Update softwareLicense completed' })
            }
        )
    })
}

// Xóa softwareLicense
export const deleteSoftwareLicenseByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `DELETE FROM software_license WHERE mrid=?`,
            [mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Delete softwareLicense failed' })
                if (this.changes === 0) return resolve({ success: false, data: null, message: 'SoftwareLicense not found' })
                return resolve({ success: true, data: null, message: 'Delete softwareLicense completed' })
            }
        )
    })
}