import db from '../../datacontext/index'

export const getStandardById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM standard WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get standard by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Standard not found' })
            return resolve({ success: true, data: row, message: 'Get standard by id completed' })
        })
    })
}

export const insertStandard = async (standard) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO standard(mrid)
             VALUES (?)
             ON CONFLICT(mrid) DO NOTHING`,
            [
                standard.mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert standard failed' })
                return resolve({ success: true, data: standard, message: 'Insert standard completed' })
            }
        )
    })
}

export const insertStandardTransaction = async (standard, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO standard(mrid)
             VALUES (?)
             ON CONFLICT(mrid) DO NOTHING`,
            [
                standard.mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert standard failed' })
                return resolve({ success: true, data: standard, message: 'Insert standard completed' })
            }
        )
    })
}

export const deleteStandardById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM standard WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete standard failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Standard not found' })
            return resolve({ success: true, data: null, message: 'Delete standard completed' })
        })
    })
}

export const deleteStandardByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM standard WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete standard failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Standard not found' })
            return resolve({ success: true, data: null, message: 'Delete standard completed' })
        })
    })
}