import db from '../../datacontext/index'

export const getStreetAddressById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM street_address WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get street address by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Street address not found' })
            return resolve({ success: true, data: row, message: 'Get street address by id completed' })
        })
    })
}

export const insertStreetAddress = async (streetAddress) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO street_address(mrid, language, po_box, postal_code, status, street_detail, town_detail)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                language = excluded.language,
                po_box = excluded.po_box,
                postal_code = excluded.postal_code,
                status = excluded.status,
                street_detail = excluded.street_detail,
                town_detail = excluded.town_detail`,
            [
                streetAddress.mrid,
                streetAddress.language,
                streetAddress.po_box,
                streetAddress.postal_code,
                streetAddress.status,
                streetAddress.street_detail,
                streetAddress.town_detail
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert identified object failed' })
                return resolve({ success: true, data: identifiedObject, message: 'Insert identified object completed' })
            }
        )
    })
}

export const insertStreetAddressTransaction = async (streetAddress, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO street_address(mrid, language, po_box, postal_code, status, street_detail, town_detail)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                language = excluded.language,
                po_box = excluded.po_box,
                postal_code = excluded.postal_code,
                status = excluded.status,
                street_detail = excluded.street_detail,
                town_detail = excluded.town_detail`,
            [
                streetAddress.mrid,
                streetAddress.language,
                streetAddress.po_box,
                streetAddress.postal_code,
                streetAddress.status,
                streetAddress.street_detail,
                streetAddress.town_detail
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert street address failed' })
                return resolve({ success: true, data: streetAddress, message: 'Insert street address completed' })
            }
        )
    })
}

export const updateStreetAddressById = async (mrid, streetAddress) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE street_address
             SET language = ?, po_box = ?, postal_code = ?, status = ?,
                 street_detail = ?, town_detail = ?
             WHERE mrid = ?`,
            [streetAddress.language, streetAddress.po_box, streetAddress.postal_code, streetAddress.status,
                streetAddress.street_detail, streetAddress.town_detail, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update street address failed' })
                return resolve({ success: true, data: streetAddress, message: 'Update street address completed' })
            }
        )
    })
}

export const updateStreetAddressByIdTransaction = async (mrid, streetAddress, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE street_address
             SET language = ?, po_box = ?, postal_code = ?, status = ?,
                 street_detail = ?, town_detail = ?
             WHERE mrid = ?`,
            [streetAddress.language, streetAddress.po_box, streetAddress.postal_code, streetAddress.status,
                streetAddress.street_detail, streetAddress.town_detail, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update street address failed' })
                return resolve({ success: true, data: streetAddress, message: 'Update street address completed' })
            }
        )
    })
}

export const deleteStreetAddressById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM street_address WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete street address failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Street address not found' })
            return resolve({ success: true, data: null, message: 'Delete street address completed' })
        })
    })
}

export const deleteStreetAddressByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM street_address WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete street address failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Street address not found' })
            return resolve({ success: true, data: null, message: 'Delete identified object completed' })
        })
    })
}