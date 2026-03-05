import db from '../../datacontext/index'
// Import các hàm của lớp cha (TapChangerInfo) đã viết ở bước trước
import * as TapChangerInfoFunc from '../tapChangerInfo/index.js'

// Lấy OldTapChangerInfo theo mrid
export const getOldTapChangerInfoById = async (mrid) => {
    try {
        // 1. Lấy thông tin từ lớp cha (TapChangerInfo bao gồm cả AssetInfo)
        const parentResult = await TapChangerInfoFunc.getTapChangerInfoById(mrid)
        if (!parentResult.success) {
            return { success: false, data: null, message: 'TapChangerInfo not found' }
        }

        // 2. Lấy thông tin riêng của OldTapChangerInfo
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM old_tap_changer_info WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get oldTapChangerInfo by id failed' })
                    // Nếu không có row con thì vẫn trả về data cha (tuỳ logic, ở đây giả sử là phải có)
                    if (!row) return resolve({ success: false, data: null, message: 'OldTapChangerInfo specific data not found' })

                    // Merge dữ liệu cha và con
                    return resolve({ success: true, data: { ...parentResult.data, ...row }, message: 'Get oldTapChangerInfo by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get oldTapChangerInfo by id failed' }
    }
}

// ... (Các import và hàm getOldTapChangerInfoById, insert... cũ giữ nguyên)

// Lấy OldTapChangerInfo theo power_transformer_info_id
export const getOldTapChangerInfoByPowerTransformerInfoId = async (powerTransformerInfoId) => {
    try {
        return new Promise((resolve, reject) => {
            // 1. Tìm mrid của OldTapChangerInfo dựa trên power_transformer_info_id
            db.get(
                `SELECT mrid FROM old_tap_changer_info WHERE power_transformer_info_id=?`,
                [powerTransformerInfoId],
                async (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Find OldTapChangerInfo mrid failed' })

                    // Nếu không tìm thấy
                    if (!row) return resolve({ success: false, data: null, message: 'OldTapChangerInfo not found for this transformer' })

                    // 2. Gọi hàm getOldTapChangerInfoById để lấy đầy đủ thông tin (bao gồm cả lớp cha AssetInfo/TapChangerInfo)
                    try {
                        const result = await getOldTapChangerInfoById(row.mrid);
                        return resolve(result);
                    } catch (error) {
                        return reject(error);
                    }
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get OldTapChangerInfo by PowerTransformerInfoId failed' }
    }
}

// Thêm mới OldTapChangerInfo (transaction)
export const insertOldTapChangerInfoTransaction = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 1. Gọi transaction của lớp cha (TapChangerInfo)
            // Việc này sẽ lưu data vào bảng asset_info và tap_changer_info trước
            const parentResult = await TapChangerInfoFunc.insertTapChangerInfoTransaction(info, dbsql)
            if (!parentResult.success) {
                return reject({ success: false, message: 'Insert TapChangerInfo failed', err: parentResult.err })
            }

            // 2. Lưu vào bảng old_tap_changer_info
            dbsql.run(
                `INSERT INTO old_tap_changer_info(
                    mrid, tap_scheme, number_of_tap, power_transformer_info_id, transformer_end_info
                ) VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    tap_scheme = excluded.tap_scheme,
                    number_of_tap = excluded.number_of_tap,
                    power_transformer_info_id = excluded.power_transformer_info_id,
                    transformer_end_info = excluded.transformer_end_info
                `,
                [
                    info.mrid,
                    info.tap_scheme,
                    info.number_of_tap,
                    info.power_transformer_info_id,
                    info.transformer_end_info
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Insert oldTapChangerInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert oldTapChangerInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert oldTapChangerInfo transaction failed' })
        }
    })
}

// Cập nhật OldTapChangerInfo (transaction)
export const updateOldTapChangerInfoTransaction = async (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 1. Gọi transaction update của lớp cha
            const parentResult = await TapChangerInfoFunc.updateTapChangerInfoTransaction(mrid, info, dbsql)
            if (!parentResult.success) {
                return reject({ success: false, message: 'Update TapChangerInfo failed', err: parentResult.err })
            }

            // 2. Update bảng old_tap_changer_info
            dbsql.run(
                `UPDATE old_tap_changer_info SET
                    tap_scheme = ?,
                    number_of_tap = ?,
                    power_transformer_info_id = ?,
                    transformer_end_info = ?
                WHERE mrid = ?`,
                [
                    info.tap_scheme,
                    info.number_of_tap,
                    info.power_transformer_info_id,
                    info.transformer_end_info,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Update oldTapChangerInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Update oldTapChangerInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update oldTapChangerInfo transaction failed' })
        }
    })
}

// Xóa OldTapChangerInfo (transaction)
export const deleteOldTapChangerInfoTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 1. Xoá ở bảng old_tap_changer_info TRƯỚC (Bảng con)
            await new Promise((res, rej) => {
                dbsql.run("DELETE FROM old_tap_changer_info WHERE mrid=?", [mrid], function (err) {
                    if (err) return rej({ success: false, err, message: 'Delete oldTapChangerInfo table failed' });
                    res();
                });
            });

            // 2. Sau đó mới gọi transaction delete của lớp cha (TapChangerInfo -> AssetInfo)
            const parentResult = await TapChangerInfoFunc.deleteTapChangerInfoTransaction(mrid, dbsql);

            if (!parentResult.success) {
                return reject({ success: false, message: 'Delete TapChangerInfo parent failed', err: parentResult.err });
            }

            return resolve({ success: true, data: mrid, message: 'Delete oldTapChangerInfo completed' });
        } catch (err) {
            return reject({ success: false, err, message: 'Delete oldTapChangerInfo transaction failed' });
        }
    })
}