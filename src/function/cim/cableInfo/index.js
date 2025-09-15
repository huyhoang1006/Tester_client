import db from '../../datacontext/index'
import * as AssetFunc from '../asset/index.js'

// Lấy thông tin surge arrester theo mrid
export const getCableInfoById = async (mrid) => {
    try {
        const assetResult = await AssetFunc.getAssetById(mrid)
        if (!assetResult.success) {
            return { success: false, data: null, message: 'Asset not found' }
        }
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM cable_info WHERE mrid=?", [mrid], (err, row) => {
                if (err) return reject({ success: false, err: err, message: 'Get cable info by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'Cable info not found' })
                const data = { ...assetResult.data, ...row }
                return resolve({ success: true, data: data, message: 'Get cable info by id completed' })
            })
        })
    } catch (err) {
        return { success: false, err: err, message: 'Get cable info by id failed' }
    }
}


export const insertCableInfo = async (cableInfo) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            AssetFunc.insertAssetTransaction(cableInfo, db)
                .then(assetResult => {
                    if (!assetResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Insert asset failed', err: assetResult.err })
                    }
                    db.run(
                        `INSERT INTO cable_info(
                            mrid, construction_kind, diameter_over_core, diameter_over_insulation, diameter_over_jacket, diameter_over_screen,is_strand_fill,nominal_temperature,outer_jacket_kind,sheath_as_neutral,shield_material
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(mrid) DO UPDATE SET
                            construction_kind = excluded.construction_kind,
                            diameter_over_core = excluded.diameter_over_core,
                            diameter_over_insulation = excluded.diameter_over_insulation,
                            diameter_over_jacket = excluded.diameter_over_jacket,
                            diameter_over_screen = excluded.diameter_over_screen,
                            is_strand_fill = excluded.is_strand_fill,
                            nominal_temperature = excluded.nominal_temperature,
                            outer_jacket_kind = excluded.outer_jacket_kind,
                            sheath_as_neutral = excluded.sheath_as_neutral,
                            shield_material = excluded.shield_material
                        `,
                        [
                            cableInfo.mrid,
                            cableInfo.construction_kind,
                            cableInfo.diameter_over_core,
                            cableInfo.diameter_over_insulation,
                            cableInfo.diameter_over_jacket,
                            cableInfo.diameter_over_screen,
                            cableInfo.is_strand_fill,
                            cableInfo.nominal_temperature,
                            cableInfo.outer_jacket_kind,
                            cableInfo.sheath_as_neutral,
                            cableInfo.shield_material
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err: err, message: 'Insert surge cableInfo failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: cableInfo, message: 'Insert surge cableInfo completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err: err, message: 'Insert surge cableInfo transaction failed' })
                })
        })
    })
}

export const insertCableInfoTransaction = async (cableInfo, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetResult = await AssetFunc.insertAssetTransaction(cableInfo, db)
            if (!assetResult.success) {
                return reject({ success: false, message: 'Insert cable failed', err: assetResult.err })
            }
            dbsql.run(
                `INSERT INTO cable_info(
                    mrid, construction_kind, diameter_over_core, diameter_over_insulation, diameter_over_jacket, diameter_over_screen, is_strand_fill, nominal_temperature, outer_jacket_kind, sheath_as_neutral, shield_material
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    construction_kind = excluded.construction_kind,
                    diameter_over_core = excluded.diameter_over_core,
                    diameter_over_insulation = excluded.diameter_over_insulation,
                    diameter_over_jacket = excluded.diameter_over_jacket,
                    diameter_over_screen = excluded.diameter_over_screen,
                    is_strand_fill = excluded.is_strand_fill,
                    nominal_temperature = excluded.nominal_temperature,
                    outer_jacket_kind = excluded.outer_jacket_kind,
                    sheath_as_neutral = excluded.sheath_as_neutral,
                    shield_material = excluded.shield_material
                `,
                [
                    cableInfo.mrid,
                    cableInfo.construction_kind,
                    cableInfo.diameter_over_core,
                    cableInfo.diameter_over_insulation,
                    cableInfo.diameter_over_jacket,
                    cableInfo.diameter_over_screen,
                    cableInfo.is_strand_fill,
                    cableInfo.nominal_temperature,
                    cableInfo.outer_jacket_kind,
                    cableInfo.sheath_as_neutral,
                    cableInfo.shield_material
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err: err, message: 'Insert surge cableInfo failed' })
                    }
                    return resolve({ success: true, data: cableInfo, message: 'Insert surge cableInfo completed' })
                }
            )
        } catch (error) {
            return reject({ success: false, err: error, message: 'Insert surge cableInfo transaction failed' })
        }
    })
}



export const updateCableInfo = async (mrid, cableInfo) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            AssetFunc.updateAssetTransaction(mrid, cableInfo, db)
                .then(assetResult => {
                    if (!assetResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Update cable failed', err: assetResult.err })
                    }
                    db.run(
                        `UPDATE cable_info SET
                            construction_kind = ?,
                            diameter_over_core = ?,
                            diameter_over_insulation = ?,
                            diameter_over_jacket = ?,
                            diameter_over_screen = ?,
                            is_strand_fill = ?,
                            nominal_temperature = ?,
                            outer_jacket_kind = ?,
                            sheath_as_neutral = ?,
                            shield_material = ?
                        WHERE mrid = ?`,
                        [
                            cableInfo.construction_kind,
                            cableInfo.diameter_over_core,
                            cableInfo.diameter_over_insulation,
                            cableInfo.diameter_over_jacket,
                            cableInfo.diameter_over_screen,
                            cableInfo.is_strand_fill,
                            cableInfo.nominal_temperature,
                            cableInfo.outer_jacket_kind,
                            cableInfo.sheath_as_neutral,
                            cableInfo.shield_material,
                            mrid
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err: err, message: 'Update surge cableInfo failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: cableInfo, message: 'Update surge cableInfo completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err: err, message: 'Update surge cableInfo transaction failed' })
                })
        })
    })
}

export const updateCableInfoTransaction = async (mrid, cableInfo, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetResult = await AssetFunc.updateAssetTransaction(mrid, cableInfo, dbsql)
            if (!assetResult.success) {
                db.run('ROLLBACK')
                return reject({ success: false, message: 'Update cableInfo failed', err: assetResult.err })
            }
            db.run(
                `UPDATE surge_cable_info SET
                    construction_kind = ?,
                            diameter_over_core = ?,
                            diameter_over_insulation = ?,
                            diameter_over_jacket = ?,
                            diameter_over_screen = ?,
                            is_strand_fill = ?,
                            nominal_temperature = ?,
                            outer_jacket_kind = ?,
                            sheath_as_neutral = ?,
                            shield_material = ?
                WHERE mrid = ?`,
                [
                    cableInfo.construction_kind,
                    cableInfo.diameter_over_core,
                    cableInfo.diameter_over_insulation,
                    cableInfo.diameter_over_jacket,
                    cableInfo.diameter_over_screen,
                    cableInfo.is_strand_fill,
                    cableInfo.nominal_temperature,
                    cableInfo.outer_jacket_kind,
                    cableInfo.sheath_as_neutral,
                    cableInfo.shield_material,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err: err, message: 'Update surge cableInfo failed' })
                    }
                    return resolve({ success: true, data: cableInfo, message: 'Update surge cableInfo completed' })
                }
            )
        } catch (error) {
            return reject({ success: false, err: error, message: 'Update surge cableInfo transaction failed' })
        }
    })
}

export const updateCableInfoTransactions = async (mrid, cableInfo, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const assetResult = await AssetFunc.updateAssetTransaction(mrid, cableInfo, dbsql)
            if (!assetResult.success) {
                return reject({ success: false, message: 'Update asset failed', err: assetResult.err })
            }
            db.run(
                `UPDATE surge_cable_info SET
                    construction_kind = ?,
                    diameter_over_core = ?,
                    diameter_over_insulation = ?,
                    diameter_over_jacket = ?,
                    diameter_over_screen = ?,
                    is_strand_fill = ?,
                    nominal_temperature = ?,
                    outer_jacket_kind = ?,
                    sheath_as_neutral = ?,
                    shield_material = ?
                WHERE mrid = ?`,
                [
                    cableInfo.construction_kind,
                    cableInfo.diameter_over_core,
                    cableInfo.diameter_over_insulation,
                    cableInfo.diameter_over_jacket,
                    cableInfo.diameter_over_screen,
                    cableInfo.is_strand_fill,
                    cableInfo.nominal_temperature,
                    cableInfo.outer_jacket_kind,
                    cableInfo.sheath_as_neutral,
                    cableInfo.shield_material,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err: err, message: 'Update surge cableInfo failed' })
                    }
                    return resolve({ success: true, data: cableInfo, message: 'Update surge cableInfo completed' })
                }
            )
        } catch (error) {
            return reject({ success: false, err: error, message: 'Update surge cableInfo transaction failed' })
        }
    })
}

// Xóa surge cableInfo theo mrid
export const deleteCableInfoById = async (mrid) => {
    return new Promise((resolve, reject) => {
        AssetFunc.deleteAssetById(mrid)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete asset failed', err: result.err })
                }
                db.run("DELETE FROM surge_cable_info WHERE mrid=?", [mrid], function (err) {
                    if (err) {
                        return reject({ success: false, err: err, message: 'Delete surge cableInfo failed' })
                    }
                    return resolve({ success: true, data: mrid, message: 'Delete surge cableInfo completed' })
                })
            })
            .catch(err => {
                return reject({ success: false, err: err, message: 'Delete surge cableInfo transaction failed' })
            })
    })
}

export const deleteCableInfoTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM surge_cable_info WHERE mrid=?", [mrid], function (err) {
                if (err) {
                    return reject({ success: false, err: err, message: 'Delete surge cableInfo failed' })
                }
                AssetFunc.deleteAssetByIdTransaction(mrid, dbsql)
                    .then(assetResult => {
                        if (!assetResult.success) {
                            return reject({ success: false, message: 'Delete asset failed', err: assetResult.err })
                        }
                        return resolve({ success: true, data: mrid, message: 'Delete surge cableInfo completed' })
                    })
                    .catch(error => {
                        return reject({ success: false, err: error, message: 'Delete asset transaction failed' })
                    });
            })
        } catch (error) {
            return reject({ success: false, err: error, message: 'Delete surge cableInfo transaction failed' })
        }
    })
}

export const getCableInfoByPsrId = (psrId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                sa.*, 
                a.* 
            FROM surge_cable_info sa
            INNER JOIN asset a ON sa.mrid = a.mrid
            INNER JOIN asset_psr ap ON a.mrid = ap.asset_id
            WHERE ap.psr_id = ?
        `;

        db.all(query, [psrId], (err, rows) => {
            if (err) {
                reject({
                    success: false,
                    error: err.message,
                    message: 'Database query failed when getting surge cableInfo by PSR ID'
                });
                return;
            }

            if (!rows || rows.length === 0) {
                resolve({
                    success: false,
                    data: [],
                    message: `No surge cableInfo found for PSR ID: ${psrId}`
                });
                return;
            }

            resolve({
                success: true,
                data: rows,
                message: 'Surge cableInfo with asset data retrieved successfully'
            });
        });
    });
};
