import db from '../../datacontext/index'

export const getIdentifiedObjectById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM identified_object WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get identified object by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Identified object not found' })
            return resolve({ success: true, data: row, message: 'Get identified object by id completed' })
        })
    })
}

export const insertIdentifiedObject = async (identifiedObject) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO identified_object(mrid, name, alias_name, description)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                name = excluded.name,
                alias_name = excluded.alias_name,
                description = excluded.description`,
            [
                identifiedObject.mrid,
                identifiedObject.name,
                identifiedObject.alias_name,
                identifiedObject.description
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert identified object failed' })
                return resolve({ success: true, data: identifiedObject, message: 'Insert identified object completed' })
            }
        )
    })
}

export const insertIdentifiedObjectTransaction = async (identifiedObject, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO identified_object(mrid, name, alias_name, description)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                name = excluded.name,
                alias_name = excluded.alias_name,
                description = excluded.description`,
            [
                identifiedObject.mrid,
                identifiedObject.name || null,
                identifiedObject.alias_name || null,
                identifiedObject.description || null
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert identified object failed' })
                return resolve({ success: true, data: identifiedObject, message: 'Insert identified object completed' })
            }
        )
    })
}

export const updateIdentifiedObjectById = async (mrid, identifiedObject) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE identified_object
             SET name = ?, description = ?, alias_name = ?
             WHERE mrid = ?`,
            [identifiedObject.name, identifiedObject.description, identifiedObject.alias_name, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update identified object failed' })
                return resolve({ success: true, data: identifiedObject, message: 'Update identified object completed' })
            }
        )
    })
}

export const updateIdentifiedObjectByIdTransaction = async (mrid, identifiedObject, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE identified_object
             SET name = ?, description = ?, alias_name = ?
             WHERE mrid = ?`,
            [identifiedObject.name, identifiedObject.description, identifiedObject.alias_name, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update identified object failed' })
                return resolve({ success: true, data: identifiedObject, message: 'Update identified object completed' })
            }
        )
    })
}

export const deleteIdentifiedObjectById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM identified_object WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete identified object failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Identified object not found' })
            return resolve({ success: true, data: null, message: 'Delete identified object completed' })
        })
    })
}

export const deleteIdentifiedObjectByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM identified_object WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete identified object failed' })
            if (this.changes === 0) {
                return resolve({ success: false, data: null, message: 'Identified object not found' })
            }
            return resolve({ success: true, data: null, message: 'Delete identified object completed' })
        })
    })
}