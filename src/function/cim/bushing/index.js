import db from '../../datacontext/index'
import * as AssetFunc from '../asset/index.js'

// Lấy bushing theo mrid
export const getBushingById = async (mrid) => {
    try {
        const assetResult = await AssetFunc.getAssetById(mrid)
        if (!assetResult.success) {
            return { success: false, data: null, message: 'Asset not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM bushing WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get bushing by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'Bushing not found' })
                    return resolve({ success: true, data: { ...assetResult.data, ...row }, message: 'Get bushing by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get bushing by id failed' }
    }
}

// Thêm mới bushing (transaction)
export const insertBushingTransaction = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetResult = await AssetFunc.insertAssetTransaction(info, dbsql)
            if (!assetResult.success) {
                return reject({ success: false, message: 'Insert asset failed', err: assetResult.err })
            }
            dbsql.run(
                `INSERT INTO bushing(
                    mrid, terminal, moving_contact, fixed_contact
                ) VALUES (?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    terminal = excluded.terminal,
                    moving_contact = excluded.moving_contact,
                    fixed_contact = excluded.fixed_contact
                `,
                [
                    info.mrid,
                    info.terminal,
                    info.moving_contact,
                    info.fixed_contact
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Insert bushing failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert bushing completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert bushing transaction failed' })
        }
    })
}

// Cập nhật bushing (transaction)
export const updateBushingTransaction = async (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetResult = await AssetFunc.updateAssetTransaction(mrid, info, dbsql)
            if (!assetResult.success) {
                return reject({ success: false, message: 'Update asset failed', err: assetResult.err })
            }
            dbsql.run(
                `UPDATE bushing SET
                    terminal = ?,
                    moving_contact = ?,
                    fixed_contact = ?
                WHERE mrid = ?`,
                [
                    info.terminal,
                    info.moving_contact,
                    info.fixed_contact,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Update bushing failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Update bushing completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update bushing transaction failed' })
        }
    })
}

// Xóa bushing (transaction)
export const deleteBushingTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetResult = await AssetFunc.deleteAssetByIdTransaction(mrid, dbsql)
            if (!assetResult.success) {
                return reject({ success: false, message: 'Delete asset failed', err: assetResult.err })
            }
            dbsql.run("DELETE FROM bushing WHERE mrid=?", [mrid], function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Delete bushing failed' })
                }
                return resolve({ success: true, data: mrid, message: 'Delete bushing completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete bushing transaction failed' })
        }
    })
}

export const getBushingByPsrId = (psrId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                sa.*, 
                a.* 
            FROM bushing sa
            INNER JOIN asset a ON sa.mrid = a.mrid
            INNER JOIN asset_psr ap ON a.mrid = ap.asset_id
            WHERE ap.psr_id = ?
        `;

        db.all(query, [psrId], (err, rows) => {
            if (err) {
                reject({
                    success: false,
                    error: err.message,
                    message: 'Database query failed when getting Bushing by PSR ID'
                });
                return;
            }

            if (!rows || rows.length === 0) {
                resolve({
                    success: false,
                    data: [],
                    message: `No Bushing found for PSR ID: ${psrId}`
                });
                return;
            }

            resolve({
                success: true,
                data: rows,
                message: 'Bushing with asset data retrieved successfully'
            });
        });
    });
};