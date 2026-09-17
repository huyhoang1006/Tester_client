import db from '../../datacontext/index'
import * as IdentifiedObjectFunc from '../identifiedObject/index.js'
import * as StatusFunc from '../status/index.js'
import {
    COMMISSIONING_DATE_TYPE,
    deleteInUseDateByAssetAndTypeTransaction,
    ensureInUseDateColumns,
    insertInUseDateTransaction
} from '../inUseDate/index.js'

const persistCurrentStatusTransaction = async (asset, dbsql) => {
    if (!asset.current_status) return { success: true, data: null, message: 'Status persistence skipped' }
    asset.status = asset.current_status.mrid
    return StatusFunc.insertStatusTransaction(asset.current_status, dbsql)
}

const persistCurrentInUseDateTransaction = async (asset, dbsql) => {
    const currentDate = asset.current_in_use_date
    if (!currentDate) return { success: true, data: null, message: 'Operating date persistence skipped' }

    if (currentDate.clear) {
        return deleteInUseDateByAssetAndTypeTransaction(asset.mrid, COMMISSIONING_DATE_TYPE, dbsql)
    }

    return insertInUseDateTransaction({
        ...currentDate,
        asset_id: asset.mrid,
        date_type: COMMISSIONING_DATE_TYPE
    }, dbsql)
}

// Lấy thông tin asset theo mrid
export const getAssetById = async (mrid) => {
    try {
        await ensureInUseDateColumns(db)
        const identifiedResult = await IdentifiedObjectFunc.getIdentifiedObjectById(mrid)
        if (!identifiedResult.success) {
            return { success: false, data: null, message: 'Identified object not found' }
        }
        return new Promise((resolve, reject) => {
            // ĐỪNG đặt bí danh bảng là `current_date`. CURRENT_DATE (cùng CURRENT_TIME,
            // CURRENT_TIMESTAMP) là từ khoá của SQLite và KHÔNG nằm trong nhóm từ khoá
            // được phép dùng lại làm tên, nên `LEFT JOIN in_use_date current_date` là lỗi
            // cú pháp — cả câu hỏng, mọi asset đi qua hàm này đều không đọc được.
            db.get(`
                SELECT
                    a.*,
                    s.value AS status_value,
                    s.date_time AS status_date_time,
                    COALESCE(commissioning_date.date_value, linked_date.date_value) AS operating_date,
                    COALESCE(commissioning_date.mrid, linked_date.mrid) AS operating_date_id
                FROM asset a
                LEFT JOIN status s ON s.mrid = a.status
                LEFT JOIN in_use_date linked_date ON linked_date.mrid = a.in_use_date
                LEFT JOIN in_use_date commissioning_date ON commissioning_date.mrid = (
                    SELECT mrid
                    FROM in_use_date
                    WHERE asset_id = a.mrid AND date_type = 'COMMISSIONING'
                    ORDER BY mrid DESC
                    LIMIT 1
                )
                WHERE a.mrid = ?`, [mrid], (err, row) => {
                if (err) {
                    console.error(`SQLite Error in getAssetById for MRID: ${mrid}`, err);
                    // Kèm nguyên văn câu lỗi của SQLite: chỗ gọi chỉ đọc `message`, nếu để
                    // câu chung chung thì nguyên nhân thật bị mất trên đường lên giao diện.
                    return reject({
                        success: false,
                        err: err,
                        message: `Reading the asset record failed for ${mrid}: ${err.message || err}`,
                    })
                }
                if (!row) {
                    console.warn(`Asset Table row NOT found for MRID: ${mrid} (but IdentifiedObject existed)`);
                    return resolve({ success: false, data: null, message: 'Asset not found' })
                }
                const data = { ...identifiedResult.data, ...row }
                return resolve({ success: true, data: data, message: 'Get asset by id completed' })
            })
        })
    } catch (err) {
        console.error(`Unexpected Exception in getAssetById for MRID: ${mrid}`, err);
        return {
            success: false,
            err: err,
            message: `Preparing the asset record failed for ${mrid}: ${(err && err.message) || err}`,
        }
    }
}

// Lấy Asset theo asset_info id
export const getAssetByAssetInfoId = async (assetInfoId) => {
    try {
        return new Promise((resolve, reject) => {
            // 1. Tìm mrid của Asset dựa trên asset_info
            db.get(
                "SELECT mrid FROM asset WHERE asset_info=?",
                [assetInfoId],
                async (err, row) => {
                    if (err) {
                        console.error(`SQLite Error in getAssetByAssetInfoId for AssetInfoId: ${assetInfoId}`, err);
                        return reject({ success: false, err: err, message: 'Find Asset by AssetInfoId failed' });
                    }

                    if (!row) {
                        return resolve({ success: false, data: null, message: 'Asset not found for this AssetInfo' });
                    }

                    // 2. Gọi lại getAssetById để lấy full thông tin (Asset + IdentifiedObject)
                    try {
                        const result = await getAssetById(row.mrid);
                        return resolve(result);
                    } catch (error) {
                        return reject(error);
                    }
                }
            )
        })
    } catch (err) {
        console.error(`Unexpected Exception in getAssetByAssetInfoId`, err);
        return { success: false, err: err, message: 'Get Asset by AssetInfoId failed' };
    }
}

// Lấy danh sách asset theo locationId
export const getAssetByLocationId = async (locationId) => {
    try {
        await ensureInUseDateColumns(db)
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    a.*, 
                    io.name AS name,
                    io.description AS description,
                    io.alias_name AS alias_name,
                    s.value AS status_value,
                    s.date_time AS status_date_time,
                    COALESCE(commissioning_date.date_value, linked_date.date_value) AS operating_date,
                    COALESCE(commissioning_date.mrid, linked_date.mrid) AS operating_date_id
                FROM asset a
                JOIN identified_object io ON a.mrid = io.mrid
                LEFT JOIN status s ON s.mrid = a.status
                LEFT JOIN in_use_date linked_date ON linked_date.mrid = a.in_use_date
                LEFT JOIN in_use_date commissioning_date ON commissioning_date.mrid = (
                    SELECT mrid
                    FROM in_use_date
                    WHERE asset_id = a.mrid AND date_type = 'COMMISSIONING'
                    ORDER BY mrid DESC
                    LIMIT 1
                )
                WHERE a.location = ?
            `;
            db.all(query, [locationId], (err, rows) => {
                if (err) {
                    return reject({
                        success: false,
                        err: err,
                        message: `Reading assets for location ${locationId} failed: ${err.message || err}`,
                    });
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

export const getAssetByPsrIdAndKind = async (psrId, kind) => {
    await ensureInUseDateColumns(db)
    return new Promise((resolve, reject) => {
        const query = `
            SELECT DISTINCT 
                a.*,
                io.name AS apparatus_id,
                io.alias_name,
                io.description,
                pam.manufacturer,
                ai.manufacturer_type AS asset_info_manufacturer_type,
                ld.manufactured_date AS manufacturing_year,
                s.value AS status_value,
                s.date_time AS status_date_time,
                COALESCE(commissioning_date.date_value, linked_date.date_value) AS operating_date,
                COALESCE(commissioning_date.mrid, linked_date.mrid) AS operating_date_id
            FROM asset a
            INNER JOIN asset_psr ap ON a.mrid = ap.asset_id
            LEFT JOIN identified_object io ON a.mrid = io.mrid
            LEFT JOIN product_asset_model pam ON a.product_asset_model = pam.mrid
            LEFT JOIN asset_info ai ON a.asset_info = ai.mrid
            LEFT JOIN lifecycle_date ld ON a.lifecycle_date = ld.mrid
            LEFT JOIN status s ON s.mrid = a.status
            LEFT JOIN in_use_date linked_date ON linked_date.mrid = a.in_use_date
            LEFT JOIN in_use_date commissioning_date ON commissioning_date.mrid = (
                SELECT mrid
                FROM in_use_date
                WHERE asset_id = a.mrid AND date_type = 'COMMISSIONING'
                ORDER BY mrid DESC
                LIMIT 1
            )
            WHERE ap.psr_id = ?
              AND a.kind = ?
        `;

        db.all(query, [psrId, kind], (err, rows) => {
            if (err) {
                reject({
                    success: false,
                    err: err,
                    error: err.message,
                    message: `Reading ${kind} assets under ${psrId} failed: ${err.message || err}`
                });
                return;
            }

            if (!rows || rows.length === 0) {
                resolve({
                    success: false,
                    data: [],
                    message: `No Asset found for PSR ID: ${psrId} with kind: ${kind}`
                });
                return;
            }

            resolve({
                success: true,
                data: rows,
                message: 'Asset retrieved successfully by PSR ID and kind'
            });
        });
    });
};


// Thêm mới asset
export const checkAssetDuplicateByKeys = async ({ serialNumber, manufacturer, assetType, excludeMrid, userId } = {}) => {
    const serial = String(serialNumber || '').trim()
    const maker = String(manufacturer || '').trim()
    const type = String(assetType || '').trim()
    const currentMrid = String(excludeMrid || '').trim()
    const ownerUserId = userId === null || userId === undefined ? '' : String(userId).trim()

    if (!serial) {
        return { success: true, exists: false, data: null, message: 'Duplicate check skipped because serial number is empty' }
    }

    return new Promise((resolve, reject) => {
        const query = `
            SELECT
                a.mrid,
                a.serial_number,
                a.type,
                a.kind,
                io.name AS apparatus_id,
                pam.manufacturer
            FROM asset a
            LEFT JOIN identified_object io ON a.mrid = io.mrid
            LEFT JOIN product_asset_model pam ON a.product_asset_model = pam.mrid
            WHERE LOWER(TRIM(COALESCE(a.serial_number, ''))) = LOWER(TRIM(?))
              AND LOWER(TRIM(COALESCE(pam.manufacturer, ''))) = LOWER(TRIM(?))
              AND LOWER(TRIM(COALESCE(a.type, ''))) = LOWER(TRIM(?))
              AND (? = '' OR a.mrid <> ?)
              AND (
                ? = ''
                OR EXISTS (
                    SELECT 1
                    FROM user_identified_object uio
                    WHERE uio.user_id = ?
                      AND uio.identified_object_id = a.mrid
                )
              )
            LIMIT 1
        `

        db.get(query, [serial, maker, type, currentMrid, currentMrid, ownerUserId, ownerUserId], (err, row) => {
            if (err) {
                return reject({ success: false, err, message: 'Check asset duplicate failed' })
            }

            return resolve({
                success: true,
                exists: !!row,
                data: row || null,
                message: row ? 'Asset already exists' : 'Asset is unique'
            })
        })
    })
}

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
                    return persistCurrentStatusTransaction(asset, db).then(statusResult => {
                        if (!statusResult.success) {
                            db.run('ROLLBACK')
                            return reject({ success: false, message: 'Insert status failed', err: statusResult.err })
                        }
                        db.run(
                        `INSERT INTO asset(
                            mrid, acceptance_test, critical, electronic_address, initial_condition, initial_loss_of_life,
                            in_use_date, in_use_state, kind, lifecycle_date, lifecycle_state, lot_number, position,
                            retired_reason, serial_number, status, type, utc_number, asset_info, product_asset_model,
                            location, country_of_origin, manufacturer_type, number_of_phase, phase, phase
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                            country_of_origin = excluded.country_of_origin,
                            manufacturer_type = excluded.manufacturer_type,
                            number_of_phase = excluded.number_of_phase,
                            phase = excluded.phase
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
                            asset.country_of_origin,
                            asset.manufacturer_type,
                            asset.number_of_phase,
                            asset.phase
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err: err, message: 'Insert asset failed' })
                            }
                            persistCurrentInUseDateTransaction(asset, db)
                                .then(dateResult => {
                                    if (!dateResult.success) {
                                        db.run('ROLLBACK')
                                        return reject({ success: false, message: 'Insert operating date failed', err: dateResult.err })
                                    }
                                    db.run('COMMIT')
                                    return resolve({ success: true, data: asset, message: 'Insert asset completed' })
                                })
                                .catch(err => {
                                    db.run('ROLLBACK')
                                    return reject({ success: false, err, message: 'Insert operating date transaction failed' })
                                })
                        }
                        )
                    })
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err: err, message: 'Insert asset transaction failed' })
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
                    return persistCurrentStatusTransaction(asset, db).then(statusResult => {
                        if (!statusResult.success) {
                            db.run('ROLLBACK')
                            return reject({ success: false, message: 'Update status failed', err: statusResult.err })
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
                            country_of_origin = ?,
                            number_of_phase = ?,
                            phase = ?
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
                            asset.number_of_phase,
                            asset.phase,
                            mrid
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err: err, message: 'Update asset failed' })
                            }
                            persistCurrentInUseDateTransaction(asset, db)
                                .then(dateResult => {
                                    if (!dateResult.success) {
                                        db.run('ROLLBACK')
                                        return reject({ success: false, message: 'Update operating date failed', err: dateResult.err })
                                    }
                                    db.run('COMMIT')
                                    return resolve({ success: true, data: asset, message: 'Update asset completed' })
                                })
                                .catch(err => {
                                    db.run('ROLLBACK')
                                    return reject({ success: false, err, message: 'Update operating date transaction failed' })
                                })
                        }
                        )
                    })
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
                return reject({ success: false, err: err, message: 'Delete asset transaction failed' })
            })
    })
}

export const insertAssetTransaction = (asset, dbsql) => {
    return new Promise((resolve, reject) => {
        IdentifiedObjectFunc.insertIdentifiedObjectTransaction(asset, dbsql)
            .then(identifiedResult => {
                if (!identifiedResult.success) {
                    return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
                }
                return persistCurrentStatusTransaction(asset, dbsql).then(statusResult => {
                    if (!statusResult.success) {
                        return resolve({ success: false, err: statusResult.err, message: 'Insert status transaction failed' })
                    }
                    dbsql.run(
                `INSERT INTO asset(
                    mrid, acceptance_test, critical, electronic_address, initial_condition, initial_loss_of_life,
                    in_use_date, in_use_state, kind, lifecycle_date, lifecycle_state, lot_number, position,
                    retired_reason, serial_number, status, type, utc_number, asset_info, product_asset_model,
                    location, country_of_origin, number_of_phase, phase
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                    country_of_origin = excluded.country_of_origin,
                    number_of_phase = excluded.number_of_phase,
                    phase = excluded.phase
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
                    asset.country_of_origin,
                    asset.number_of_phase,
                    asset.phase
                ],
                        function (err) {
                            if (err) {
                                console.error(`insertAssetTransaction FAILED for MRID: ${asset.mrid}`, err);
                                return resolve({ success: false, err: err, message: 'Insert asset transaction failed' })
                            }
                            persistCurrentInUseDateTransaction(asset, dbsql)
                                .then(dateResult => {
                                    if (!dateResult.success) {
                                        return resolve({ success: false, err: dateResult.err, message: 'Insert operating date transaction failed' })
                                    }
                                    return resolve({ success: true, data: asset, message: 'Insert asset transaction completed' })
                                })
                                .catch(err => resolve({ success: false, err, message: 'Insert operating date transaction failed' }))
                        }
                    )
                })
            })
            .catch(err => {
                return resolve({ success: false, err: err, message: 'Insert asset transaction failed' })
            })
    })
}

export const updateAssetTransaction = (mrid, asset, dbsql) => {
    return new Promise((resolve, reject) => {
        IdentifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, asset, dbsql)
            .then(identifiedResult => {
                if (!identifiedResult.success) {
                    return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
                }
                return persistCurrentStatusTransaction(asset, dbsql).then(statusResult => {
                    if (!statusResult.success) {
                        return resolve({ success: false, err: statusResult.err, message: 'Update status transaction failed' })
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
                    country_of_origin = ?,
                    number_of_phase = ?,
                    phase = ?
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
                    asset.number_of_phase,
                    asset.phase,
                    mrid
                ],
                        function (err) {
                            if (err) {
                                return resolve({ success: false, err: err, message: 'Update asset transaction failed' })
                            }
                            persistCurrentInUseDateTransaction(asset, dbsql)
                                .then(dateResult => {
                                    if (!dateResult.success) {
                                        return resolve({ success: false, err: dateResult.err, message: 'Update operating date transaction failed' })
                                    }
                                    return resolve({ success: true, data: asset, message: 'Update asset transaction completed' })
                                })
                                .catch(err => resolve({ success: false, err, message: 'Update operating date transaction failed' }))
                        }
                    )
                })
            })
            .catch(err => {
                return resolve({ success: false, err: err, message: 'Update asset transaction failed' })
            })
    })
}

export const deleteAssetByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        IdentifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, dbsql)
            .then(result => {
                if (!result.success && result.message !== 'Identified object not found') {
                    return reject({ success: false, message: 'Delete identified object failed', err: result.err })
                }
                return resolve({
                    success: true,
                    data: mrid,
                    alreadyDeleted: result.message === 'Identified object not found',
                    message: 'Delete asset (and cascade identified object) completed'
                })
            })
            .catch(err => {
                return reject({ success: false, err: err, message: 'Delete asset transaction failed' })
            })
    })
}
