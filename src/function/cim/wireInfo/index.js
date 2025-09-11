import db from '../../datacontext/index'
import * as AssetInfoFunc from '../assetInfo/index.js'

// Lấy wireInfo theo mrid
export const getWireInfoById = async (mrid) => {
    try {
        const assetInfoResult = await AssetInfoFunc.getAssetInfoById(mrid)
        if (!assetInfoResult.success) {
            return { success: false, data: null, message: 'AssetInfo not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM wire_info WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get wireInfo by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'WireInfo not found' })
                    return resolve({ success: true, data: { ...assetInfoResult.data, ...row }, message: 'Get wireInfo by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get wireInfo by id failed' }
    }
}

// Thêm mới wireInfo (transaction)
export const insertWireInfoTransaction = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetInfoResult = await AssetInfoFunc.insertAssetInfoTransaction(info, dbsql)
            if (!assetInfoResult.success) {
                return reject({ success: false, message: 'Insert assetInfo failed', err: assetInfoResult.err })
            }
            dbsql.run(
                `INSERT INTO wire_info(
                    mrid, core_radius, core_strand_count, gmr, insulated, insulation_material, insulation_thickness, material, r_ac, radius, rated_current, r_dc, size_description, strand_count
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    core_radius = excluded.core_radius,
                    core_strand_count = excluded.core_strand_count,
                    gmr = excluded.gmr,
                    insulated = excluded.insulated,
                    insulation_material = excluded.insulation_material,
                    insulation_thickness = excluded.insulation_thickness,
                    material = excluded.material,
                    r_ac = excluded.r_ac,
                    radius = excluded.radius,
                    rated_current = excluded.rated_current,
                    r_dc = excluded.r_dc,
                    size_description = excluded.size_description,
                    strand_count = excluded.strand_count
                `,
                [
                    info.mrid,
                    info.core_radius,
                    info.core_strand_count,
                    info.gmr,
                    info.insulated,
                    info.insulation_material,
                    info.insulation_thickness,
                    info.material,
                    info.r_ac,
                    info.radius,
                    info.rated_current,
                    info.r_dc,
                    info.size_description,
                    info.strand_count
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Insert wireInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert wireInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert wireInfo transaction failed' })
        }
    })
}

// Cập nhật wireInfo (transaction)
export const updateWireInfoTransaction = async (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetInfoResult = await AssetInfoFunc.updateAssetInfoTransaction(mrid, info, dbsql)
            if (!assetInfoResult.success) {
                return reject({ success: false, message: 'Update assetInfo failed', err: assetInfoResult.err })
            }
            dbsql.run(
                `UPDATE wire_info SET
                    core_radius = ?,
                    core_strand_count = ?,
                    gmr = ?,
                    insulated = ?,
                    insulation_material = ?,
                    insulation_thickness = ?,
                    material = ?,
                    r_ac = ?,
                    radius = ?,
                    rated_current = ?,
                    r_dc = ?,
                    size_description = ?,
                    strand_count = ?
                WHERE mrid = ?`,
                [
                    info.core_radius,
                    info.core_strand_count,
                    info.gmr,
                    info.insulated,
                    info.insulation_material,
                    info.insulation_thickness,
                    info.material,
                    info.r_ac,
                    info.radius,
                    info.rated_current,
                    info.r_dc,
                    info.size_description,
                    info.strand_count,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Update wireInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Update wireInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update wireInfo transaction failed' })
        }
    })
}

// Xóa wireInfo (transaction)
export const deleteWireInfoTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetInfoResult = await AssetInfoFunc.deleteAssetInfoByIdTransaction(mrid, dbsql)
            if (!assetInfoResult.success) {
                return reject({ success: false, message: 'Delete assetInfo failed', err: assetInfoResult.err })
            }
            dbsql.run("DELETE FROM wire_info WHERE mrid=?", [mrid], function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Delete wireInfo failed' })
                }
                return resolve({ success: true, data: mrid, message: 'Delete wireInfo completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete wireInfo transaction failed'})
        }
    })
}