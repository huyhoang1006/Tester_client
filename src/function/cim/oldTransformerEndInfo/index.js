import db from '../../datacontext/index'
import * as TransformerEndInfoFunc from '../transformerEndInfo/index.js'

// Lấy oldTransformerEndInfo theo mrid
export const getOldTransformerEndInfoById = async (mrid) => {
    try {
        const baseResult = await TransformerEndInfoFunc.getTransformerEndInfoById(mrid)
        if (!baseResult.success) {
            return { success: false, data: null, message: 'TransformerEndInfo not found' }
        }

        const row = await new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM old_transformer_end_info WHERE mrid=?`,
                [mrid],
                (err, row) => (err ? reject(err) : resolve(row))
            )
        })

        if (!row) {
            return { success: false, data: null, message: 'OldTransformerEndInfo not found' }
        }

        return {
            success: true,
            data: { ...baseResult.data, ...row },
            message: 'Get oldTransformerEndInfo by id completed'
        }

    } catch (err) {
        return { success: false, err, message: 'Get oldTransformerEndInfo by id failed' }
    }
}

// Lấy danh sách oldTransformerEndInfo theo power_transformer_info_id, gồm toàn bộ thông tin kế thừa
export const getOldTransformerEndInfoByPowerTransformerInfoId = async (powerTransformerInfoId) => {
    try {
        const rows = await new Promise((resolve, reject) => {
            db.all(
                `
                SELECT 
                    *
                FROM old_transformer_end_info otei
                LEFT JOIN transformer_end_info tei ON otei.mrid = tei.mrid
                LEFT JOIN asset_info ai ON tei.mrid = ai.mrid
                LEFT JOIN identified_object i ON ai.mrid = i.mrid

                WHERE otei.power_transformer_info_id = ?
                `,
                [powerTransformerInfoId],
                (err, rows) => (err ? reject(err) : resolve(rows))
            )
        })

        if (!rows || rows.length === 0) {
            return { success: false, data: [], message: 'No OldTransformerEndInfo found for this powerTransformerInfoId' }
        }
        return {
            success: true,
            data: rows,
            message: 'Get oldTransformerEndInfo by powerTransformerInfoId completed'
        }

    } catch (err) {
        console.error('Error in getOldTransformerEndInfoByPowerTransformerInfoId:', err)
        return { success: false, err, message: 'Get oldTransformerEndInfo by powerTransformerInfoId failed' }
    }
}


// Thêm mới oldTransformerEndInfo (transaction)
export const insertOldTransformerEndInfoTransaction = async (info, dbsql) => {
    try {
        const baseResult = await TransformerEndInfoFunc.insertTransformerEndInfoTransaction(info, dbsql)
        if (!baseResult.success) {
            throw baseResult.err || new Error('Insert transformerEndInfo failed')
        }

        await new Promise((resolve, reject) => {
            dbsql.run(
                `INSERT INTO old_transformer_end_info(
                    mrid, material, spare, accessibility, power_transformer_info_id,
                    phase
                ) VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    material = excluded.material,
                    spare = excluded.spare,
                    accessibility = excluded.accessibility,
                    power_transformer_info_id = excluded.power_transformer_info_id,
                    phase = excluded.phase
                `,
                [
                    info.mrid,
                    info.material,
                    info.spare,
                    info.accessibility,
                    info.power_transformer_info_id,
                    info.phase
                ],
                (err) => (err ? reject(err) : resolve())
            )
        })

        return { success: true, data: info, message: 'Insert oldTransformerEndInfo completed' }

    } catch (err) {
        return { success: false, err, message: 'Insert oldTransformerEndInfo transaction failed' }
    }
}

// Cập nhật oldTransformerEndInfo (transaction)
export const updateOldTransformerEndInfoTransaction = async (mrid, info, dbsql) => {
    try {
        const baseResult = await TransformerEndInfoFunc.updateTransformerEndInfoTransaction(mrid, info, dbsql)
        if (!baseResult.success) {
            throw baseResult.err || new Error('Update transformerEndInfo failed')
        }

        await new Promise((resolve, reject) => {
            dbsql.run(
                `UPDATE old_transformer_end_info SET
                    material = ?,
                    spare = ?,
                    accessibility = ?,
                    power_transformer_info_id = ?,
                    phase = ?
                WHERE mrid = ?`,
                [
                    info.material,
                    info.spare,
                    info.accessibility,
                    info.power_transformer_info_id,
                    info.phase,
                    mrid
                ],
                (err) => (err ? reject(err) : resolve())
            )
        })

        return { success: true, data: info, message: 'Update oldTransformerEndInfo completed' }

    } catch (err) {
        return { success: false, err, message: 'Update oldTransformerEndInfo transaction failed' }
    }
}

// Xóa oldTransformerEndInfo (transaction)
export const deleteOldTransformerEndInfoTransaction = async (mrid, dbsql) => {
    // 1. Xóa old_transformer_end_info
    const deleteOld = await new Promise((resolve, reject) => {
        dbsql.run(
            "DELETE FROM old_transformer_end_info WHERE mrid=?",
            [mrid],
            function (err) {
                if (err) return reject(err);
                resolve(this.changes); // số row bị xóa
            }
        );
    });

    if (deleteOld === 0) {
        return {
            success: false,
            data: null,
            message: "Old transformer end info not found"
        };
    }

    // 2. Xóa transformer_end_info
    const baseResult = await TransformerEndInfoFunc.deleteTransformerEndInfoTransaction(mrid, dbsql);
    if (!baseResult.success) {
        throw baseResult.err || new Error("Delete transformerEndInfo failed");
    }

    return {
        success: true,
        data: mrid,
        message: "Delete oldTransformerEndInfo completed"
    };
}