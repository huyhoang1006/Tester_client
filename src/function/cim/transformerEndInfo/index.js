import db from '../../datacontext/index'
import * as AssetInfoFunc from '../assetInfo/index.js'

// Lấy transformerEndInfo theo mrid
export const getTransformerEndInfoById = async (mrid) => {
    try {
        const assetInfoResult = await AssetInfoFunc.getAssetInfoById(mrid)
        if (!assetInfoResult.success) {
            return { success: false, data: null, message: 'AssetInfo not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM transformer_end_info WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get transformerEndInfo by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'TransformerEndInfo not found' })
                    return resolve({ success: true, data: { ...assetInfoResult.data, ...row }, message: 'Get transformerEndInfo by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get transformerEndInfo by id failed' }
    }
}

// Thêm mới transformerEndInfo (transaction)
export const insertTransformerEndInfoTransaction = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetInfoResult = await AssetInfoFunc.insertAssetInfoTransaction(info, dbsql)
            if (!assetInfoResult.success) {
                return reject({ success: false, message: 'Insert assetInfo failed', err: assetInfoResult.err })
            }
            dbsql.run(
                `INSERT INTO transformer_end_info(
                    mrid, connection_kind, emergency_s, end_number, insulation_u, phase_angle_clock, r, rated_s, rated_u, short_term_s, transformer_tank_info
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    connection_kind = excluded.connection_kind,
                    emergency_s = excluded.emergency_s,
                    end_number = excluded.end_number,
                    insulation_u = excluded.insulation_u,
                    phase_angle_clock = excluded.phase_angle_clock,
                    r = excluded.r,
                    rated_s = excluded.rated_s,
                    rated_u = excluded.rated_u,
                    short_term_s = excluded.short_term_s,
                    transformer_tank_info = excluded.transformer_tank_info
                `,
                [
                    info.mrid,
                    info.connection_kind,
                    info.emergency_s,
                    info.end_number,
                    info.insulation_u,
                    info.phase_angle_clock,
                    info.r,
                    info.rated_s,
                    info.rated_u,
                    info.short_term_s,
                    info.transformer_tank_info
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Insert transformerEndInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert transformerEndInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert transformerEndInfo transaction failed' })
        }
    })
}

// Cập nhật transformerEndInfo (transaction)
export const updateTransformerEndInfoTransaction = async (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetInfoResult = await AssetInfoFunc.updateAssetInfoTransaction(mrid, info, dbsql)
            if (!assetInfoResult.success) {
                return reject({ success: false, message: 'Update assetInfo failed', err: assetInfoResult.err })
            }
            dbsql.run(
                `UPDATE transformer_end_info SET
                    connection_kind = ?,
                    emergency_s = ?,
                    end_number = ?,
                    insulation_u = ?,
                    phase_angle_clock = ?,
                    r = ?,
                    rated_s = ?,
                    rated_u = ?,
                    short_term_s = ?,
                    transformer_tank_info = ?
                WHERE mrid = ?`,
                [
                    info.connection_kind,
                    info.emergency_s,
                    info.end_number,
                    info.insulation_u,
                    info.phase_angle_clock,
                    info.r,
                    info.rated_s,
                    info.rated_u,
                    info.short_term_s,
                    info.transformer_tank_info,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Update transformerEndInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Update transformerEndInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update transformerEndInfo transaction failed' })
        }
    })
}

// Xóa transformerEndInfo (transaction)
export const deleteTransformerEndInfoTransaction = async (mrid, dbsql) => {
    try {
        // 1. Xóa transformer_end_info
        const deleted = await new Promise((resolve, reject) => {
            dbsql.run(
                "DELETE FROM transformer_end_info WHERE mrid=?",
                [mrid],
                function (err) {
                    if (err) return reject(err);
                    resolve(this.changes);
                }
            );
        });

        // Nếu không có dòng nào bị xóa, coi như lỗi logic
        if (deleted === 0) {
            throw new Error("TransformerEndInfo not found");
        }

        // 2. Xóa asset info (phải chạy SAU khi xóa end_info)
        const assetInfoResult = await AssetInfoFunc.deleteAssetInfoByIdTransaction(mrid, dbsql);
        if (!assetInfoResult.success) {
            throw assetInfoResult.err || new Error("Delete assetInfo failed");
        }

        return {
            success: true,
            data: mrid,
            message: "Delete transformerEndInfo completed"
        };

    } catch (err) {
        return {
            success: false,
            err,
            message: "Delete transformerEndInfo transaction failed"
        };
    }
};