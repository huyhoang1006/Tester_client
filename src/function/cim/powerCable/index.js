import db from '../../datacontext/index'
import * as AssetFunc from '../asset/index.js'

// Lấy thông tin power cable theo mrid
export const getPowerCableById = async (mrid) => {
    try {
        const assetResult = await AssetFunc.getAssetById(mrid)
        if (!assetResult.success) {
            return { success: false, data: null, message: 'Asset not found' }
        }
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM power_cable WHERE mrid=?", [mrid], (err, row) => {
                if (err) return reject({ success: false, err: err, message: 'Get power cable by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'Power cable not found' })
                const data = { ...assetResult.data, ...row }
                return resolve({ success: true, data: data, message: 'Get power cable by id completed' })
            })
        })
    } catch (err) {
        return { success: false, err: err, message: 'Get power cable by id failed' }
    }
}

// Thêm mới power cable
export const insertPowerCable = async (cable) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            AssetFunc.insertAssetTransaction(cable, db)
                .then(assetResult => {
                    if (!assetResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Insert asset failed', err: assetResult.err })
                    }
                    db.run(
                        `INSERT INTO power_cable(
                            mrid, unit_count, manufacturer_type, asset_system_code, phases, transformer_end_info_id
                        ) VALUES (?, ?, ?, ?, ?, ?)
                        ON CONFLICT(mrid) DO UPDATE SET
                            unit_count = excluded.unit_count,
                            manufacturer_type = excluded.manufacturer_type,
                            asset_system_code = excluded.asset_system_code,
                            phases = excluded.phases,
                            transformer_end_info_id = excluded.transformer_end_info_id
                        `,
                        [
                            cable.mrid,
                            cable.unit_count,
                            cable.manufacturer_type,
                            cable.asset_system_code,
                            cable.phases,
                            cable.transformer_end_info_id
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err: err, message: 'Insert power cable failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: cable, message: 'Insert power cable completed' })
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

export const insertPowerCableTransaction = async (cable, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetResult = await AssetFunc.insertAssetTransaction(cable, db)
            if (!assetResult.success) {
                return reject({ success: false, message: 'Insert asset failed', err: assetResult.err })
            }
            dbsql.run(
                `INSERT INTO power_cable(
                    mrid, unit_count, manufacturer_type, asset_system_code, phases, transformer_end_info_id
                ) VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    unit_count = excluded.unit_count,
                    manufacturer_type = excluded.manufacturer_type,
                    asset_system_code = excluded.asset_system_code,
                    phases = excluded.phases,
                    transformer_end_info_id = excluded.transformer_end_info_id
                `,
                [
                    cable.mrid,
                    cable.unit_count,
                    cable.manufacturer_type,
                    cable.asset_system_code,
                    cable.phases,
                    cable.transformer_end_info_id
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err: err, message: 'Insert power cable failed' })
                    }
                    return resolve({ success: true, data: cable, message: 'Insert power cable completed' })
                }
            )
        } catch (error) {
            return reject({ success: false, err: error, message: 'Insert power cable transaction failed' })
        }
    })
}

// Cập nhật power cable
export const updatePowerCable = async (mrid, cable) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            AssetFunc.updateAssetTransaction(mrid, cable, db)
                .then(assetResult => {
                    if (!assetResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Update asset failed', err: assetResult.err })
                    }
                    db.run(
                        `UPDATE power_cable SET
                            unit_count = ?,
                            manufacturer_type = ?,
                            asset_system_code = ?,
                            phases = ?,
                            transformer_end_info_id = ?
                        WHERE mrid = ?`,
                        [
                            cable.unit_count,
                            cable.manufacturer_type,
                            cable.asset_system_code,
                            cable.phases,
                            cable.transformer_end_info_id,
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

export const updatePowerCableTransaction = async (mrid, cable, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetResult = await AssetFunc.updateAssetTransaction(mrid, cable, dbsql)
            if (!assetResult.success) {
                db.run('ROLLBACK')
                return reject({ success: false, message: 'Update asset failed', err: assetResult.err })
            }
            db.run(
                `UPDATE power_cable SET
                    unit_count = ?,
                    manufacturer_type = ?,
                    asset_system_code = ?,
                    phases = ?,
                    transformer_end_info_id = ?
                WHERE mrid = ?`,
                [
                    cable.unit_count,
                    cable.manufacturer_type,
                    cable.asset_system_code,
                    cable.phases,
                    cable.transformer_end_info_id,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err: err, message: 'Update power cable failed' })
                    }
                    return resolve({ success: true, data: cable, message: 'Update power cable completed' })
                }
            )
        } catch (error) {
            return reject({ success: false, err: error, message: 'Update power cable transaction failed' })
        }
    })
}

// Xóa power cable theo mrid
export const deletePowerCableById = async (mrid) => {
    return new Promise((resolve, reject) => {
        AssetFunc.deleteAssetById(mrid)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete asset failed', err: result.err })
                }
                db.run("DELETE FROM power_cable WHERE mrid=?", [mrid], function (err) {
                    if (err) {
                        return reject({ success: false, err: err, message: 'Delete power cable failed' })
                    }
                    return resolve({ success: true, data: mrid, message: 'Delete power cable completed' })
                })
            })
            .catch(err => {
                return reject({ success: false, err: err, message: 'Delete power cable transaction failed' })
            })
    })
}

export const deletePowerCableTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM power_cable WHERE mrid=?", [mrid], function (err) {
                if (err) {
                    return reject({ success: false, err: err, message: 'Delete power cable failed' })
                }
                AssetFunc.deleteAssetByIdTransaction(mrid, dbsql)
                    .then(assetResult => {
                        if (!assetResult.success) {
                            return reject({ success: false, message: 'Delete asset failed', err: assetResult.err })
                        }
                        return resolve({ success: true, data: mrid, message: 'Delete power cable completed' })
                    })
                    .catch(error => {
                        return reject({ success: false, err: error, message: 'Delete asset transaction failed' })
                    });
            })
        } catch (error) {
            return reject({ success: false, err: error, message: 'Delete power cable transaction failed' })
        }
    })
}

export const getPowerCableByPsrId = (psrId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                pc.*, 
                a.* 
            FROM power_cable pc
            INNER JOIN asset a ON pc.mrid = a.mrid
            INNER JOIN asset_psr ap ON a.mrid = ap.asset_id
            WHERE ap.psr_id = ?
        `;

        db.all(query, [psrId], (err, rows) => {
            if (err) {
                reject({
                    success: false,
                    error: err.message,
                    message: 'Database query failed when getting power cable by PSR ID'
                });
                return;
            }

            if (!rows || rows.length === 0) {
                resolve({
                    success: false,
                    data: [],
                    message: `No power cable found for PSR ID: ${psrId}`
                });
                return;
            }

            resolve({
                success: true,
                data: rows,
                message: 'Power cable with asset data retrieved successfully'
            });
        });
    });
};
