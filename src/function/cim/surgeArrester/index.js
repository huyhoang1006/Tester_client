import db from '../../datacontext/index'
import * as AssetFunc from '../asset/index.js'

// Lấy thông tin surge arrester theo mrid
export const getSurgeArresterById = async (mrid) => {
    try {
        const assetResult = await AssetFunc.getAssetById(mrid)
        if (!assetResult.success) {
            return { success: false, data: null, message: 'Asset not found' }
        }
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM surge_arrester WHERE mrid=?", [mrid], (err, row) => {
                if (err) return reject({ success: false, err: err, message: 'Get surge arrester by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'Surge arrester not found' })
                const data = { ...assetResult.data, ...row }
                return resolve({ success: true, data: data, message: 'Get surge arrester by id completed' })
            })
        })
    } catch (err) {
        return { success: false, err: err, message: 'Get surge arrester by id failed' }
    }
}

export const getSurgeArresterByAssetId = (assetId) => {
    return new Promise((resolve, reject) => {

        const query = `
            SELECT 
                io.*, 
                a.*, 
                sa.*
            FROM surge_arrester sa
            INNER JOIN asset a ON sa.mrid = a.mrid
            INNER JOIN identified_object io ON a.mrid = io.mrid
            WHERE sa.asset_id = ?
        `;

        db.all(query, [assetId], (err, rows) => {
            if (err) {
                return reject({
                    success: false,
                    error: err.message,
                    message: 'Database query failed when getting surge arrester by Asset ID'
                });
            }

            if (!rows || rows.length === 0) {
                return resolve({
                    success: false,
                    data: [],
                    message: `No surge arrester found for Asset ID: ${assetId}`
                });
            }

            return resolve({
                success: true,
                data: rows,
                message: 'Surge arrester retrieved successfully with full inheritance data'
            });
        });
    });
};

// Thêm mới surge arrester
export const insertSurgeArrester = async (arrester) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            AssetFunc.insertAssetTransaction(arrester, db)
                .then(assetResult => {
                    if (!assetResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Insert asset failed', err: assetResult.err })
                    }
                    db.run(
                        `INSERT INTO surge_arrester(
                            mrid, unit_count, manufacturer_type, asset_system_code, asset_id
                        ) VALUES (?, ?, ?, ?, ?)
                        ON CONFLICT(mrid) DO UPDATE SET
                            unit_count = excluded.unit_count,
                            manufacturer_type = excluded.manufacturer_type,
                            asset_system_code = excluded.asset_system_code,
                            asset_id = excluded.asset_id
                        `,
                        [
                            arrester.mrid,
                            arrester.unit_count,
                            arrester.manufacturer_type,
                            arrester.asset_system_code,
                            arrester.asset_id
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err: err, message: 'Insert surge arrester failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: arrester, message: 'Insert surge arrester completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err: err, message: 'Insert surge arrester transaction failed' })
                })
        })
    })
}

export const insertSurgeArresterTransaction = async (arrester, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetResult = await AssetFunc.insertAssetTransaction(arrester, db)
            if (!assetResult.success) {
                return reject({ success: false, message: 'Insert asset failed', err: assetResult.err })
            }
            dbsql.run(
                `INSERT INTO surge_arrester(
                    mrid, unit_count, manufacturer_type, asset_system_code, asset_id
                ) VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    unit_count = excluded.unit_count,
                    manufacturer_type = excluded.manufacturer_type,
                    asset_system_code = excluded.asset_system_code,
                    asset_id = excluded.asset_id
                `,
                [
                    arrester.mrid,
                    arrester.unit_count,
                    arrester.manufacturer_type,
                    arrester.asset_system_code,
                    arrester.asset_id
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err: err, message: 'Insert surge arrester failed' })
                    }
                    return resolve({ success: true, data: arrester, message: 'Insert surge arrester completed' })
                }
            )
        } catch (error) {
            return reject({ success: false, err: error, message: 'Insert surge arrester transaction failed' })
        }
    })
}

// Cập nhật surge arrester
export const updateSurgeArrester = async (mrid, arrester) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            AssetFunc.updateAssetTransaction(mrid, arrester, db)
                .then(assetResult => {
                    if (!assetResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Update asset failed', err: assetResult.err })
                    }
                    db.run(
                        `UPDATE surge_arrester SET
                            unit_count = ?,
                            manufacturer_type = ?,
                            asset_system_code = ?,
                            asset_id = ?
                        WHERE mrid = ?`,
                        [
                            arrester.unit_count,
                            arrester.manufacturer_type,
                            arrester.asset_system_code,
                            arrester.asset_id,
                            mrid
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err: err, message: 'Update surge arrester failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: arrester, message: 'Update surge arrester completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err: err, message: 'Update surge arrester transaction failed' })
                })
        })
    })
}

export const updateSurgeArresterTransaction = async (mrid, arrester, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetResult = await AssetFunc.updateAssetTransaction(mrid, arrester, dbsql)
            if (!assetResult.success) {
                db.run('ROLLBACK')
                return reject({ success: false, message: 'Update asset failed', err: assetResult.err })
            }
            db.run(
                `UPDATE surge_arrester SET
                    unit_count = ?,
                    manufacturer_type = ?,
                    asset_system_code = ?,
                    asset_id = ?
                WHERE mrid = ?`,
                [
                    arrester.unit_count,
                    arrester.manufacturer_type,
                    arrester.asset_system_code,
                    arrester.asset_id,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err: err, message: 'Update surge arrester failed' })
                    }
                    return resolve({ success: true, data: arrester, message: 'Update surge arrester completed' })
                }
            )
        } catch (error) {
            return reject({ success: false, err: error, message: 'Update surge arrester transaction failed' })
        }
    })
}

// Xóa surge arrester theo mrid
export const deleteSurgeArresterById = async (mrid) => {
    return new Promise((resolve, reject) => {
        AssetFunc.deleteAssetById(mrid)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete asset failed', err: result.err })
                }
                db.run("DELETE FROM surge_arrester WHERE mrid=?", [mrid], function (err) {
                    if (err) {
                        return reject({ success: false, err: err, message: 'Delete surge arrester failed' })
                    }
                    return resolve({ success: true, data: mrid, message: 'Delete surge arrester completed' })
                })
            })
            .catch(err => {
                return reject({ success: false, err: err, message: 'Delete surge arrester transaction failed' })
            })
    })
}

export const deleteSurgeArresterTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM surge_arrester WHERE mrid=?", [mrid], function (err) {
                if (err) {
                    return reject({ success: false, err: err, message: 'Delete surge arrester failed' })
                }
                AssetFunc.deleteAssetByIdTransaction(mrid, dbsql)
                    .then(assetResult => {
                        if (!assetResult.success) {
                            return reject({ success: false, message: 'Delete asset failed', err: assetResult.err })
                        }
                        return resolve({ success: true, data: mrid, message: 'Delete surge arrester completed' })
                    })
                    .catch(error => {
                        return reject({ success: false, err: error, message: 'Delete asset transaction failed' })
                    });
            })
        } catch (error) {
            return reject({ success: false, err: error, message: 'Delete surge arrester transaction failed' })
        }
    })
}

export const getSurgeArresterByPsrId = (psrId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                sa.*, 
                a.*,
                io.name AS apparatus_id,
                io.alias_name,
                io.description,
                pam.manufacturer,
                ai.manufacturer_type AS asset_info_manufacturer_type,
                ld.manufactured_date AS manufacturing_year
            FROM surge_arrester sa
            INNER JOIN asset a ON sa.mrid = a.mrid
            INNER JOIN asset_psr ap ON a.mrid = ap.asset_id
            LEFT JOIN identified_object io ON a.mrid = io.mrid
            LEFT JOIN product_asset_model pam ON a.product_asset_model = pam.mrid
            LEFT JOIN asset_info ai ON a.asset_info = ai.mrid
            LEFT JOIN lifecycle_date ld ON a.lifecycle_date = ld.mrid
            WHERE ap.psr_id = ?
        `;

        db.all(query, [psrId], (err, rows) => {
            if (err) {
                reject({
                    success: false,
                    error: err.message,
                    message: 'Database query failed when getting surge arrester by PSR ID'
                });
                return;
            }

            if (!rows || rows.length === 0) {
                resolve({
                    success: false,
                    data: [],
                    message: `No surge arrester found for PSR ID: ${psrId}`
                });
                return;
            }

            resolve({
                success: true,
                data: rows,
                message: 'Surge arrester with asset data retrieved successfully'
            });
        });
    });
};
