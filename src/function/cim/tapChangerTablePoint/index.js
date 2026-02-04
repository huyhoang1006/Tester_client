import db from '../../datacontext/index'

// Lấy TapChangerTablePoint theo mrid
export const getTapChangerTablePointById = async (mrid) => {
    try {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM tap_changer_table_point WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get tapChangerTablePoint by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'TapChangerTablePoint not found' })
                    return resolve({ success: true, data: row, message: 'Get tapChangerTablePoint by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get tapChangerTablePoint by id failed' }
    }
}

// Thêm mới TapChangerTablePoint (transaction)
export const insertTapChangerTablePointTransaction = async (info, dbsql) => {
    return new Promise((resolve, reject) => {
        try {
            dbsql.run(
                `INSERT INTO tap_changer_table_point(
                    mrid, b, g, r, ratio, step, x
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    b = excluded.b,
                    g = excluded.g,
                    r = excluded.r,
                    ratio = excluded.ratio,
                    step = excluded.step,
                    x = excluded.x
                `,
                [
                    info.mrid,
                    info.b,
                    info.g,
                    info.r,
                    info.ratio,
                    info.step,
                    info.x
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Insert tapChangerTablePoint failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert tapChangerTablePoint completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert tapChangerTablePoint transaction failed' })
        }
    })
}

// Cập nhật TapChangerTablePoint (transaction)
export const updateTapChangerTablePointTransaction = async (mrid, info, dbsql) => {
    return new Promise((resolve, reject) => {
        try {
            dbsql.run(
                `UPDATE tap_changer_table_point SET
                    b = ?,
                    g = ?,
                    r = ?,
                    ratio = ?,
                    step = ?,
                    x = ?
                WHERE mrid = ?`,
                [
                    info.b,
                    info.g,
                    info.r,
                    info.ratio,
                    info.step,
                    info.x,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Update tapChangerTablePoint failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Update tapChangerTablePoint completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update tapChangerTablePoint transaction failed' })
        }
    })
}

// Xóa TapChangerTablePoint (transaction)
export const deleteTapChangerTablePointTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        try {
            dbsql.run("DELETE FROM tap_changer_table_point WHERE mrid=?", [mrid], function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Delete tapChangerTablePoint failed' })
                }
                return resolve({ success: true, data: mrid, message: 'Delete tapChangerTablePoint completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete tapChangerTablePoint transaction failed' })
        }
    })
}