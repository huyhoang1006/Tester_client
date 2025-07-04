import db from '../../datacontext/index'

export const getTelephoneNumberById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM telephone_number WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get telephone number by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Telephone number not found' })
            return resolve({ success: true, data: row, message: 'Get telephone number by id completed' })
        })
    })
}

export const insertTelephoneNumber = async (telephoneNumber) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO telephone_number(
                area_code,
                city_code,
                country_code,
                dial_out,
                extension,
                international_prefix,
                itu_phone,
                local_number
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(itu_phone) DO UPDATE SET
                area_code = excluded.area_code,
                city_code = excluded.city_code,
                country_code = excluded.country_code,
                dial_out = excluded.dial_out,
                extension = excluded.extension,
                international_prefix = excluded.international_prefix,
                local_number = excluded.local_number`,
            [
                telephoneNumber.area_code,
                telephoneNumber.city_code,
                telephoneNumber.country_code,
                telephoneNumber.dial_out,
                telephoneNumber.extension,
                telephoneNumber.international_prefix,
                telephoneNumber.itu_phone,
                telephoneNumber.local_number
            ],
            function (err) {
                if (err) return reject({ success: false, err : err, message: 'Insert telephone number failed' })
                return resolve({ success: true, data: telephoneNumber, message: 'Insert telephone number completed' })
            }
        )
    })
}

export const insertTelephoneNumberTransaction = async (telephoneNumber, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO telephone_number(
                area_code,
                city_code,
                country_code,
                dial_out,
                extension,
                international_prefix,
                itu_phone,
                local_number
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(itu_phone) DO UPDATE SET
                area_code = excluded.area_code,
                city_code = excluded.city_code,
                country_code = excluded.country_code,
                dial_out = excluded.dial_out,
                extension = excluded.extension,
                international_prefix = excluded.international_prefix,
                itu_phone,
                local_number
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(itu_phone) DO UPDATE SET
                area_code = excluded.area_code,
                city_code = excluded.city_code,
                country_code = excluded.country_code,
                dial_out = excluded.dial_out,
                extension = excluded.extension,
                international_prefix = excluded.international_prefix,
                local_number = excluded.local_number`,
            [
                telephoneNumber.area_code,
                telephoneNumber.city_code,
                telephoneNumber.country_code,
                telephoneNumber.dial_out,
                telephoneNumber.extension,
                telephoneNumber.international_prefix,
                telephoneNumber.itu_phone,
                telephoneNumber.local_number
            ],
            function (err) {
                if (err) return reject({ success: false, err : err, message: 'Insert telephone number failed' })
                return resolve({ success: true, data: telephoneNumber, message: 'Insert telephone number completed' })
            }
        )
    })
}

export const updateTelephoneNumberById = async (mrid, telephoneNumber) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE telephone_number
             SET area_code = ?, city_code = ?, country_code = ?, dial_out = ?, extension = ?, international_prefix = ?, itu_phone = ?, local_number = ?
             WHERE mrid = ?`,
            [
                telephoneNumber.area_code,
                telephoneNumber.city_code,
                telephoneNumber.country_code,
                telephoneNumber.dial_out,
                telephoneNumber.extension,
                telephoneNumber.international_prefix,
                telephoneNumber.itu_phone,
                telephoneNumber.local_number,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update telephone number failed' })
                return resolve({ success: true, data: telephoneNumber, message: 'Update telephone number completed' })
            }
        )
    })
}

export const updateTelephoneNumberByIdTransaction = async (mrid, telephoneNumber, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE telephone_number
             SET area_code = ?, city_code = ?, country_code = ?, dial_out = ?, extension = ?, international_prefix = ?, itu_phone = ?, local_number = ?
             WHERE mrid = ?`,
            [
                telephoneNumber.area_code,
                telephoneNumber.city_code,
                telephoneNumber.country_code,
                telephoneNumber.dial_out,
                telephoneNumber.extension,
                telephoneNumber.international_prefix,
                telephoneNumber.itu_phone,
                telephoneNumber.local_number,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update telephone number failed' })
                return resolve({ success: true, data: telephoneNumber, message: 'Update telephone number completed' })
            }
        )
    })
}

export const deleteTelephoneNumberById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM telephone_number WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete telephone number failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Telephone number not found' })
            return resolve({ success: true, data: null, message: 'Delete telephone number completed' })
        })
    })
}

export const deleteTelephoneNumberByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM telephone_number WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete telephone number failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Telephone number not found' })
            return resolve({ success: true, data: null, message: 'Delete telephone number completed' })
        })
    })
}