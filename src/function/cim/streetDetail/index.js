import db from '../../datacontext/index'

export const getStreetDetailById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM street_detail WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get street detail by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Street detail not found' })
            return resolve({ success: true, data: row, message: 'Get street detail by id completed' })
        })
    })
}

export const insertStreetDetail = async (streetDetail) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO street_detail(mrid, address_general, building_name, code, floor_identification
            number, prefix, suffix, suite_number, type, within_town_limits)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                address_general = excluded.address_general,
                building_name = excluded.building_name,
                code = excluded.code,
                floor_identification_number = excluded.floor_identification_number,
                prefix = excluded.prefix,
                suffix = excluded.suffix,
                suite_number = excluded.suite_number,
                type = excluded.type,
                within_town_limits = excluded.within_town_limits`,
            [
                streetDetail.mrid,
                streetDetail.address_general,
                streetDetail.building_name,
                streetDetail.code,
                streetDetail.floor_identification_number,
                streetDetail.prefix,
                streetDetail.suffix,
                streetDetail.suite_number,
                streetDetail.type,
                streetDetail.within_town_limits
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert street detail failed' })
                return resolve({ success: true, data: streetDetail, message: 'Insert street detail completed' })
            }
        )
    })
}

export const insertStreetDetailTransaction = async (streetDetail, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO street_detail(mrid, address_general, building_name, code, floor_identification
            number, prefix, suffix, suite_number, type, within_town_limits)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                address_general = excluded.address_general,
                building_name = excluded.building_name,
                code = excluded.code,
                floor_identification_number = excluded.floor_identification_number,
                prefix = excluded.prefix,
                suffix = excluded.suffix,
                suite_number = excluded.suite_number,
                type = excluded.type,
                within_town_limits = excluded.within_town_limits`,
            [
                streetDetail.mrid,
                streetDetail.address_general,
                streetDetail.building_name,
                streetDetail.code,
                streetDetail.floor_identification_number,
                streetDetail.prefix,
                streetDetail.suffix,
                streetDetail.suite_number,
                streetDetail.type,
                streetDetail.within_town_limits
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert street detail failed' })
                return resolve({ success: true, data: streetDetail, message: 'Insert street detail completed' })
            }
        )
    })
}

export const updateStreetDetailById = async (mrid, streetDetail) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE street_detail
             SET address_general = ?, building_name = ?, code = ?, floor_identification_number = ?,
                 prefix = ?, suffix = ?, suite_number = ?, type = ?, within_town_limits = ?
             WHERE mrid = ?`,
            [streetDetail.address_general, streetDetail.building_name, streetDetail.code, streetDetail.floor_identification_number,
                streetDetail.prefix, streetDetail.suffix, streetDetail.suite_number, streetDetail.type, streetDetail.within_town_limits, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update street detail failed' })
                return resolve({ success: true, data: streetDetail, message: 'Update street detail completed' })
            }
        )
    })
}

export const updateStreetDetailByIdTransaction = async (mrid, streetDetail, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE street_detail
             SET address_general = ?, building_name = ?, code = ?, floor_identification_number = ?,
                 prefix = ?, suffix = ?, suite_number = ?, type = ?, within_town_limits = ?
             WHERE mrid = ?`,
            [streetDetail.address_general, streetDetail.building_name, streetDetail.code, streetDetail.floor_identification_number,
                streetDetail.prefix, streetDetail.suffix, streetDetail.suite_number, streetDetail.type, streetDetail.within_town_limits, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update street detail failed' })
                return resolve({ success: true, data: streetDetail, message: 'Update street detail completed' })
            }
        )
    })
}

export const deleteStreetDetailById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM street_detail WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete street detail failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Street detail not found' })
            return resolve({ success: true, data: null, message: 'Delete street detail completed' })
        })
    })
}

export const deleteStreetDetailByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM street_detail WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete street detail failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Street detail not found' })
            return resolve({ success: true, data: null, message: 'Delete street detail completed' })
        })
    })
}