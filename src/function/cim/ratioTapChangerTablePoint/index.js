import db from '../../datacontext/index'
// Import các hàm của lớp cha (TapChangerTablePoint)
import * as TapChangerTablePointFunc from '../tapChangerTablePoint/index.js'

// Lấy RatioTapChangerTablePoint theo mrid
export const getRatioTapChangerTablePointById = async (mrid) => {
    try {
        // 1. Lấy thông tin từ lớp cha (TapChangerTablePoint)
        const parentResult = await TapChangerTablePointFunc.getTapChangerTablePointById(mrid)
        if (!parentResult.success) {
            return { success: false, data: null, message: 'TapChangerTablePoint not found' }
        }

        // 2. Lấy thông tin riêng của RatioTapChangerTablePoint
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM ratio_tap_changer_table_point WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get ratioTapChangerTablePoint by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'RatioTapChangerTablePoint specific data not found' })
                    
                    // Merge dữ liệu cha và con
                    return resolve({ success: true, data: { ...parentResult.data, ...row }, message: 'Get ratioTapChangerTablePoint by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get ratioTapChangerTablePoint by id failed' }
    }
}

// Thêm mới RatioTapChangerTablePoint (transaction)
export const insertRatioTapChangerTablePointTransaction = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 1. Gọi transaction của lớp cha
            const parentResult = await TapChangerTablePointFunc.insertTapChangerTablePointTransaction(info, dbsql)
            if (!parentResult.success) {
                return reject({ success: false, message: 'Insert TapChangerTablePoint failed', err: parentResult.err })
            }

            // 2. Lưu vào bảng ratio_tap_changer_table_point
            dbsql.run(
                `INSERT INTO ratio_tap_changer_table_point(
                    mrid, ratio_tap_changer_table
                ) VALUES (?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    ratio_tap_changer_table = excluded.ratio_tap_changer_table
                `,
                [
                    info.mrid,
                    info.ratio_tap_changer_table
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Insert ratioTapChangerTablePoint failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert ratioTapChangerTablePoint completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert ratioTapChangerTablePoint transaction failed' })
        }
    })
}

// Cập nhật RatioTapChangerTablePoint (transaction)
export const updateRatioTapChangerTablePointTransaction = async (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 1. Gọi transaction update của lớp cha
            const parentResult = await TapChangerTablePointFunc.updateTapChangerTablePointTransaction(mrid, info, dbsql)
            if (!parentResult.success) {
                return reject({ success: false, message: 'Update TapChangerTablePoint failed', err: parentResult.err })
            }

            // 2. Update bảng ratio_tap_changer_table_point
            dbsql.run(
                `UPDATE ratio_tap_changer_table_point SET
                    ratio_tap_changer_table = ?
                WHERE mrid = ?`,
                [
                    info.ratio_tap_changer_table,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Update ratioTapChangerTablePoint failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Update ratioTapChangerTablePoint completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update ratioTapChangerTablePoint transaction failed' })
        }
    })
}

// Xóa RatioTapChangerTablePoint (transaction)
export const deleteRatioTapChangerTablePointTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 1. Gọi transaction delete của lớp cha
            const parentResult = await TapChangerTablePointFunc.deleteTapChangerTablePointTransaction(mrid, dbsql)
            if (!parentResult.success) {
                return reject({ success: false, message: 'Delete TapChangerTablePoint failed', err: parentResult.err })
            }

            // 2. Xoá ở bảng ratio_tap_changer_table_point
            dbsql.run("DELETE FROM ratio_tap_changer_table_point WHERE mrid=?", [mrid], function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Delete ratioTapChangerTablePoint failed' })
                }
                return resolve({ success: true, data: mrid, message: 'Delete ratioTapChangerTablePoint completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete ratioTapChangerTablePoint transaction failed' })
        }
    })
}

// ============================================================================
// Query lấy danh sách theo ratio_tap_changer_table (Sử dụng JOIN, SELECT *)
// ============================================================================
export const getListByRatioTapChangerTableId = async (tableId) => {
    try {
        return new Promise((resolve, reject) => {
            // Join bảng cha (T1) và bảng con (T2), lấy tất cả cột (*)
            const sql = `
                SELECT *
                FROM tap_changer_table_point T1
                JOIN ratio_tap_changer_table_point T2 ON T1.mrid = T2.mrid
                WHERE T2.ratio_tap_changer_table = ?
            `;
            
            db.all(sql, [tableId], (err, rows) => {
                if (err) {
                    return reject({ success: false, err, message: 'Get list by ratioTapChangerTableId failed' })
                }
                // Trả về mảng rỗng nếu không tìm thấy
                if (!rows) {
                    return resolve({ success: true, data: [], message: 'No items found' })
                }
                return resolve({ success: true, data: rows, message: 'Get list by ratioTapChangerTableId completed' })
            })
        })
    } catch (err) {
        return { success: false, err, message: 'Get list by ratioTapChangerTableId failed' }
    }
}