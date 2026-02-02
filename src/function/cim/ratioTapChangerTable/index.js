import db from '../../datacontext/index'
// Import các hàm của lớp cha (IdentifiedObject)
import * as IdentifiedObjectFunc from '../identifiedObject/index.js'

// Lấy RatioTapChangerTable theo mrid
export const getRatioTapChangerTableById = async (mrid) => {
    try {
        // 1. Lấy thông tin từ lớp cha (IdentifiedObject)
        const parentResult = await IdentifiedObjectFunc.getIdentifiedObjectById(mrid)
        if (!parentResult.success) {
            return { success: false, data: null, message: 'IdentifiedObject not found' }
        }

        // 2. Kiểm tra sự tồn tại trong bảng ratio_tap_changer_table
        // Mặc dù không có field riêng, nhưng bước này xác nhận object đúng là loại RatioTapChangerTable
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM ratio_tap_changer_table WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get ratioTapChangerTable by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'RatioTapChangerTable specific type not found' })
                    
                    // Merge dữ liệu cha và con (con hiện tại rỗng ngoài mrid)
                    return resolve({ success: true, data: { ...parentResult.data, ...row }, message: 'Get ratioTapChangerTable by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get ratioTapChangerTable by id failed' }
    }
}

// Thêm mới RatioTapChangerTable (transaction)
export const insertRatioTapChangerTableTransaction = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 1. Gọi transaction của lớp cha (IdentifiedObject)
            const parentResult = await IdentifiedObjectFunc.insertIdentifiedObjectTransaction(info, dbsql)
            if (!parentResult.success) {
                return reject({ success: false, message: 'Insert IdentifiedObject failed', err: parentResult.err })
            }

            // 2. Lưu vào bảng ratio_tap_changer_table (Chỉ lưu mrid vì không có thuộc tính khác)
            dbsql.run(
                `INSERT INTO ratio_tap_changer_table(mrid) VALUES (?)
                ON CONFLICT(mrid) DO NOTHING`, // Không có trường nào để update nếu conflict
                [info.mrid],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Insert ratioTapChangerTable failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert ratioTapChangerTable completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert ratioTapChangerTable transaction failed' })
        }
    })
}

// Cập nhật RatioTapChangerTable (transaction)
export const updateRatioTapChangerTableTransaction = async (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 1. Gọi transaction update của lớp cha
            // Vì lớp con không có thuộc tính nào để update, việc update hoàn toàn nằm ở lớp cha (tên, mrid, aliasName...)
            const parentResult = await IdentifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, info, dbsql)
            if (!parentResult.success) {
                return reject({ success: false, message: 'Update IdentifiedObject failed', err: parentResult.err })
            }

            // 2. Không cần update bảng ratio_tap_changer_table vì không có cột nào ngoài mrid (primary key)
            return resolve({ success: true, data: info, message: 'Update ratioTapChangerTable completed' })

        } catch (err) {
            return reject({ success: false, err, message: 'Update ratioTapChangerTable transaction failed' })
        }
    })
}

// Xóa RatioTapChangerTable (transaction)
export const deleteRatioTapChangerTableTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 1. Gọi transaction delete của lớp cha
            const parentResult = await IdentifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, dbsql)
            if (!parentResult.success) {
                return reject({ success: false, message: 'Delete IdentifiedObject failed', err: parentResult.err })
            }

            // 2. Xoá ở bảng ratio_tap_changer_table
            dbsql.run("DELETE FROM ratio_tap_changer_table WHERE mrid=?", [mrid], function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Delete ratioTapChangerTable failed' })
                }
                return resolve({ success: true, data: mrid, message: 'Delete ratioTapChangerTable completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete ratioTapChangerTable transaction failed' })
        }
    })
}