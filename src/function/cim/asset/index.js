import db from '../../datacontext/index'
import * as IdentifiedObjectFunc from '../identifiedObject/index.js'

// Lấy thông tin asset theo mrid
export const getAssetById = async (mrid) => {
    try {
        const identifiedResult = await IdentifiedObjectFunc.getIdentifiedObjectById(mrid)
        if (!identifiedResult.success) {
            return { success: false, data: null, message: 'Identified object not found' }
        }
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM asset WHERE mrid=?", [mrid], (err, row) => {
                if (err) return reject({ success: false, err: err, message: 'Get asset by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'Asset not found' })
                const data = { ...identifiedResult.data, ...row }
                return resolve({ success: true, data: data, message: 'Get asset by id completed' })
            })
        })
    } catch (err) {
        return { success: false, err: err, message: 'Get asset by id failed' }
    }
}

// Lấy danh sách asset theo locationId
export const getAssetByLocationId = async (locationId) => {
    try {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    a.*, 
                    io.name AS name,
                    io.description AS description,
                    io.alias_name AS alias_name
                FROM asset a
                JOIN identified_object io ON a.mrid = io.mrid
                WHERE a.location = ?
            `;
            db.all(query, [locationId], (err, rows) => {
                if (err) {
                    return reject({ success: false, err: err, message: 'Query failed' });
                }
                if (!rows || rows.length === 0) {
                    return resolve({ success: false, data: [], message: 'No assets found for this location' });
                }
                return resolve({ success: true, data: rows, message: 'Get assets by locationId completed' });
            });
        });
    } catch (err) {
        return { success: false, err: err, message: 'Unexpected error' };
    }
};

// Thêm mới asset
export const insertAsset = async (asset) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            IdentifiedObjectFunc.insertIdentifiedObjectTransaction(asset, db)
                .then(identifiedResult => {
                    if (!identifiedResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
                    }
                    db.run(
                        `INSERT INTO asset(
                            mrid, acceptance_test, critical, electronic_address, initial_condition, initial_loss_of_life,
                            in_use_date, in_use_state, kind, lifecycle_date, lifecycle_state, lot_number, position,
                            retired_reason, serial_number, status, type, utc_number, asset_info, product_asset_model,
                            location, country_of_origin
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(mrid) DO UPDATE SET
                            acceptance_test = excluded.acceptance_test,
                            critical = excluded.critical,
                            electronic_address = excluded.electronic_address,
                            initial_condition = excluded.initial_condition,
                            initial_loss_of_life = excluded.initial_loss_of_life,
                            in_use_date = excluded.in_use_date,
                            in_use_state = excluded.in_use_state,
                            kind = excluded.kind,
                            lifecycle_date = excluded.lifecycle_date,
                            lifecycle_state = excluded.lifecycle_state,
                            lot_number = excluded.lot_number,
                            position = excluded.position,
                            retired_reason = excluded.retired_reason,
                            serial_number = excluded.serial_number,
                            status = excluded.status,
                            type = excluded.type,
                            utc_number = excluded.utc_number,
                            asset_info = excluded.asset_info,
                            product_asset_model = excluded.product_asset_model,
                            location = excluded.location,
                            country_of_origin = excluded.country_of_origin
                        `,
                        [
                            asset.mrid,
                            asset.acceptance_test,
                            asset.critical,
                            asset.electronic_address,
                            asset.initial_condition,
                            asset.initial_loss_of_life,
                            asset.in_use_date,
                            asset.in_use_state,
                            asset.kind,
                            asset.lifecycle_date,
                            asset.lifecycle_state,
                            asset.lot_number,
                            asset.position,
                            asset.retired_reason,
                            asset.serial_number,
                            asset.status,
                            asset.type,
                            asset.utc_number,
                            asset.asset_info,
                            asset.product_asset_model,
                            asset.location,
                            asset.country_of_origin
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err : err, message: 'Insert asset failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: asset, message: 'Insert asset completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err : err, message: 'Insert asset transaction failed' })
                })
        })
    })
}

// Cập nhật asset
export const updateAsset = async (mrid, asset) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            IdentifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, asset, db)
                .then(identifiedResult => {
                    if (!identifiedResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
                    }
                    db.run(
                        `UPDATE asset SET
                            acceptance_test = ?,
                            critical = ?,
                            electronic_address = ?,
                            initial_condition = ?,
                            initial_loss_of_life = ?,
                            in_use_date = ?,
                            in_use_state = ?,
                            kind = ?,
                            lifecycle_date = ?,
                            lifecycle_state = ?,
                            lot_number = ?,
                            position = ?,
                            retired_reason = ?,
                            serial_number = ?,
                            status = ?,
                            type = ?,
                            utc_number = ?,
                            asset_info = ?,
                            product_asset_model = ?,
                            location = ?,
                            country_of_origin = ?
                        WHERE mrid = ?`,
                        [
                            asset.acceptance_test,
                            asset.critical,
                            asset.electronic_address,
                            asset.initial_condition,
                            asset.initial_loss_of_life,
                            asset.in_use_date,
                            asset.in_use_state,
                            asset.kind,
                            asset.lifecycle_date,
                            asset.lifecycle_state,
                            asset.lot_number,
                            asset.position,
                            asset.retired_reason,
                            asset.serial_number,
                            asset.status,
                            asset.type,
                            asset.utc_number,
                            asset.asset_info,
                            asset.product_asset_model,
                            asset.location,
                            asset.country_of_origin,
                            mrid
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err: err, message: 'Update asset failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: asset, message: 'Update asset completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err: err, message: 'Update asset transaction failed' })
                })
        })
    })
}

// Xóa asset theo mrid
export const deleteAssetById = async (mrid) => {
    return new Promise((resolve, reject) => {
        IdentifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, db)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete identified object failed', err: result.err })
                }
                return resolve({ success: true, data: mrid, message: 'Delete asset (and cascade identified object) completed' })
            })
            .catch(err => {
                return reject({ success: false, err : err, message: 'Delete asset transaction failed' })
            })
    })
}

export const insertAssetTransaction = (asset, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const identifiedResult = await IdentifiedObjectFunc.insertIdentifiedObjectTransaction(asset, dbsql)
            if (!identifiedResult.success) {
                return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
            }
            dbsql.run(
                `INSERT INTO asset(
                    mrid, acceptance_test, critical, electronic_address, initial_condition, initial_loss_of_life,
                    in_use_date, in_use_state, kind, lifecycle_date, lifecycle_state, lot_number, position,
                    retired_reason, serial_number, status, type, utc_number, asset_info, product_asset_model,
                    location, country_of_origin
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    acceptance_test = excluded.acceptance_test,
                    critical = excluded.critical,
                    electronic_address = excluded.electronic_address,
                    initial_condition = excluded.initial_condition,
                    initial_loss_of_life = excluded.initial_loss_of_life,
                    in_use_date = excluded.in_use_date,
                    in_use_state = excluded.in_use_state,
                    kind = excluded.kind,
                    lifecycle_date = excluded.lifecycle_date,
                    lifecycle_state = excluded.lifecycle_state,
                    lot_number = excluded.lot_number,
                    position = excluded.position,
                    retired_reason = excluded.retired_reason,
                    serial_number = excluded.serial_number,
                    status = excluded.status,
                    type = excluded.type,
                    utc_number = excluded.utc_number,
                    asset_info = excluded.asset_info,
                    product_asset_model = excluded.product_asset_model,
                    location = excluded.location,
                    country_of_origin = excluded.country_of_origin
                `,
                [
                    asset.mrid,
                    asset.acceptance_test,
                    asset.critical,
                    asset.electronic_address,
                    asset.initial_condition,
                    asset.initial_loss_of_life,
                    asset.in_use_date,
                    asset.in_use_state,
                    asset.kind,
                    asset.lifecycle_date,
                    asset.lifecycle_state,
                    asset.lot_number,
                    asset.position,
                    asset.retired_reason,
                    asset.serial_number,
                    asset.status,
                    asset.type,
                    asset.utc_number,
                    asset.asset_info,
                    asset.product_asset_model,
                    asset.location,
                    asset.country_of_origin
                ],
                function (err) {
                    if (err) {
                        return resolve({ success: false, err: err, message: 'Insert asset transaction failed' })
                    }
                    return resolve({ success: true, data: asset, message: 'Insert asset transaction completed' })
                }
            )
        } catch (err) {
            return resolve({ success: false, err: err, message: 'Insert asset transaction failed' })
        }
    })
}

export const updateAssetTransaction = (mrid, asset, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const identifiedResult = await IdentifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, asset, dbsql)
            if (!identifiedResult.success) {
                return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
            }
            dbsql.run(
                `UPDATE asset SET
                    acceptance_test = ?,
                    critical = ?,
                    electronic_address = ?,
                    initial_condition = ?,
                    initial_loss_of_life = ?,
                    in_use_date = ?,
                    in_use_state = ?,
                    kind = ?,
                    lifecycle_date = ?,
                    lifecycle_state = ?,
                    lot_number = ?,
                    position = ?,
                    retired_reason = ?,
                    serial_number = ?,
                    status = ?,
                    type = ?,
                    utc_number = ?,
                    asset_info = ?,
                    product_asset_model = ?,
                    location = ?,
                    country_of_origin = ?
                WHERE mrid = ?`,
                [
                    asset.acceptance_test,
                    asset.critical,
                    asset.electronic_address,
                    asset.initial_condition,
                    asset.initial_loss_of_life,
                    asset.in_use_date,
                    asset.in_use_state,
                    asset.kind,
                    asset.lifecycle_date,
                    asset.lifecycle_state,
                    asset.lot_number,
                    asset.position,
                    asset.retired_reason,
                    asset.serial_number,
                    asset.status,
                    asset.type,
                    asset.utc_number,
                    asset.asset_info,
                    asset.product_asset_model,
                    asset.location,
                    asset.country_of_origin,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return resolve({ success: false, err: err, message: 'Update asset transaction failed' })
                    }
                    return resolve({ success: true, data: asset, message: 'Update asset transaction completed' })
                }
            )
        } catch (err) {
            return resolve({ success: false, err: err, message: 'Update asset transaction failed' })
        }
    })
}

export const deleteAssetByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        IdentifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, dbsql)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete identified object failed', err: result.err })
                }
                return resolve({ success: true, data: mrid, message: 'Delete asset (and cascade identified object) completed' })
            })
            .catch(err => {
                return reject({ success: false, err : err, message: 'Delete asset transaction failed' })
            })
    })
}