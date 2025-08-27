import db from '../../datacontext/index'
import * as IdentifiedObjectFunc from '../identifiedObject/index.js'

export const getLocationById = async (mrid) => {
    try {
        // Lấy thông tin identified_object
        const identifiedResult = await IdentifiedObjectFunc.getIdentifiedObjectById(mrid)
        if (!identifiedResult.success) {
            return { success: false, data: null, message: 'Identified object not found' }
        }

        // Lấy thông tin location
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM location WHERE mrid=?", [mrid], (err, row) => {
                if (err) return reject({ success: false, err: err, message: 'Get location by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'Location not found' })
                // Gộp dữ liệu
                const data = { ...identifiedResult.data, ...row }
                return resolve({ success: true, data: data, message: 'Get location by id completed' })
            })
        })
    } catch (err) {
        return { success: false, err: err, message: 'Get location by id failed' }
    }
}

export const getLocationByOrganisationId = async (organisationId) => {
    try {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    l.*, 
                    io.name AS name,
                    io.description AS description,
                    io.alias_name AS alias_name
                FROM location l
                JOIN identified_object io ON l.mrid = io.mrid
                JOIN organisation_location lo ON l.mrid = lo.location_id
                WHERE lo.organisation_id = ?
            `;
            
            db.all(query, [organisationId], (err, rows) => {
                if (err) {
                    return reject({ success: false, err: err, message: 'Query failed' });
                }

                if (!rows || rows.length === 0) {
                    return resolve({ success: false, data: [], message: 'No locations found for this organisation' });
                }
                return resolve({ success: true, data: rows, message: 'Get locations by organisationId completed' });
            });
        });
    } catch (err) {
        return { success: false, err: err, message: 'Unexpected error' };
    }
};


export const insertLocation = async (location) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            IdentifiedObjectFunc.insertIdentifiedObjectTransaction(location, db)
                .then(identifiedResult => {
                    if (!identifiedResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
                    }
                    db.run(
                        `INSERT INTO location(mrid, direction, electronic_address, geo_info_reference, main_address,
                         phone, secondary_address, status, type)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                         ON CONFLICT(mrid) DO UPDATE SET
                            direction = excluded.direction,
                            electronic_address = excluded.electronic_address,
                            geo_info_reference = excluded.geo_info_reference,
                            main_address = excluded.main_address,
                            phone = excluded.phone,
                            secondary_address = excluded.secondary_address,
                            status = excluded.status,
                            type = excluded.type
                        `,
                        [
                            location.mrid,
                            location.direction,
                            location.electronic_address,
                            location.geo_info_reference,
                            location.main_address,
                            location.phone,
                            location.secondary_address,
                            location.status,
                            location.type
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err : err, message: 'Insert location failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: location, message: 'Insert location completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err : err, message: 'Insert location transaction failed' })
                })
        })
    })
}

export const insertLocationTransaction = async (location, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Insert vào identified_object trước
            const identifiedResult = await IdentifiedObjectFunc.insertIdentifiedObjectTransaction(location, dbsql)
            if (!identifiedResult.success) {
                return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
            }

            // Insert vào location
            dbsql.run(
                `INSERT INTO location(mrid, direction, electronic_address, geo_info_reference, main_address,
                 phone, secondary_address, status, type)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON CONFLICT(mrid) DO UPDATE SET
                    direction = excluded.direction,
                    electronic_address = excluded.electronic_address,
                    geo_info_reference = excluded.geo_info_reference,
                    main_address = excluded.main_address,
                    phone = excluded.phone,
                    secondary_address = excluded.secondary_address,
                    status = excluded.status,
                    type = excluded.type
                `,
                [
                    location.mrid,
                    location.direction,
                    location.electronic_address,
                    location.geo_info_reference,
                    location.main_address,
                    location.phone,
                    location.secondary_address,
                    location.status,
                    location.type
                ],
                function (err) {
                    if (err) return reject({ success: false, err : err, message: 'Insert location failed' })
                    return resolve({ success: true, data: location, message: 'Insert location completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err : err, message: 'Insert location transaction failed' })
        }
    })
}

export const updateLocation = async (mrid, location) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            IdentifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, location, db)
                .then(identifiedResult => {
                    if (!identifiedResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
                    }
                    db.run(
                        `UPDATE location
                         SET direction = ?,
                             electronic_address = ?,
                             geo_info_reference = ?,
                             main_address = ?,
                             phone = ?,
                             secondary_address = ?,
                             status = ?,
                             type = ?
                         WHERE mrid = ?`,
                        [
                            location.direction,
                            location.electronic_address,
                            location.geo_info_reference,
                            location.main_address,
                            location.phone,
                            location.secondary_address,
                            location.status,
                            location.type,
                            mrid
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err: err, message: 'Update location failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: location, message: 'Update location completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err: err, message: 'Update location transaction failed' })
                })
        })
    })
}

export const updateLocationTransaction = async (mrid, location, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Update identified_object trước
            const identifiedResult = await IdentifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, location, dbsql)
            if (!identifiedResult.success) {
                return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
            }

            // Update location
            dbsql.run(
                `UPDATE location
                 SET direction = ?,
                     electronic_address = ?,
                     geo_info_reference = ?,
                     main_address = ?,
                     phone = ?,
                     secondary_address = ?,
                     status = ?,
                     type = ?
                 WHERE mrid = ?`,
                [
                    location.direction,
                    location.electronic_address,
                    location.geo_info_reference,
                    location.main_address,
                    location.phone,
                    location.secondary_address,
                    location.status,
                    location.type,
                    mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err : err , message: 'Update location failed' })
                    return resolve({ success: true, data: location, message: 'Update location completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err : err, message: 'Update location transaction failed' })
        }
    })
}

export const deleteLocationById = async (mrid) => {
    return new Promise((resolve, reject) => {
        IdentifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, db)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete identified object failed', err: result.err })
                }
                // Thành công, trả về resolve
                return resolve({ success: true, data: mrid, message: 'Delete identified object (and cascade location) completed' })
            })
            .catch(err => {
                return reject({ success: false, err : err, message: 'Delete location transaction failed' })
            })
    })
}

export const deleteLocationByIdTransaction = async (mrid, dbsql) => {
    // Tái sử dụng hàm deleteIdentifiedObjectById đã có sẵn
    return IdentifiedObjectFunc.deleteIdentifiedObjectById(mrid, dbsql)
}

export const getLocationDetailByMrid = async (mrid) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                l.mrid AS location_mrid,
                l.*,
                sa.mrid AS street_address_mrid,
                sa.*,
                sd.mrid AS street_detail_mrid,
                sd.*,
                td.mrid AS town_detail_mrid,
                td.*,
                io.mrid AS identified_object_mrid,
                io.* 
            FROM location l
            Left JOIN identified_object io ON l.mrid = io.mrid
            LEFT JOIN street_address sa ON l.main_address = sa.mrid
            LEFT JOIN street_detail sd ON sa.street_detail = sd.mrid
            LEFT JOIN town_detail td ON sa.town_detail = td.mrid
            WHERE l.mrid = ?
        `;
        db.get(query, [mrid], (err, row) => {
            if (err) {
                return reject({ success: false, err, message: 'Get location detail failed' });
            }
            if (!row) {
                return resolve({ success: false, data: null, message: 'Location not found' });
            }
            return resolve({ success: true, data: row, message: 'Get location detail completed' });
        });
    });
};