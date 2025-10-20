import db from '../../../datacontext/index'

export const getTestTypeDisconnectorByMrid = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM disconnector_test_type WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get disconnector test type by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Disconnector test type not found' })
            return resolve({ success: true, data: row, message: 'Get disconnector test type by id completed' })
        })
    })
}

export const getAllTestTypeDisconnector = async () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM disconnector_test_type", [], (err, rows) => {
            if (err) return reject({ success: false, err: err, message: 'Get all disconnector test types failed' })
            return resolve({ success: true, data: rows, message: 'Get all disconnector test types completed' })
        })
    })
}

export const insertTestTypeDisconnector = async (testType) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO disconnector_test_type(mrid, code, name)
             VALUES (?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                code = excluded.code,
                name = excluded.name`,            [
                testType.mrid,
                testType.code,
                testType.name
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert disconnector test type failed' })
                return resolve({ success: true, data: testType, message: 'Insert disconnector test type completed' })
            }
        )
    })
}

export const insertTestTypeDisconnectorTransaction = async (testType, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO disconnector_test_type(mrid, code, name)
             VALUES (?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                code = excluded.code,
                name = excluded.name`,
            [
                testType.mrid,
                testType.code,
                testType.name
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert disconnector test type failed' })
                return resolve({ success: true, data: testType, message: 'Insert disconnector test type completed' })
            }
        )
    })
}

export const updateTestTypeDisconnectorById = async (mrid, testType) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE disconnector_test_type
             SET code = ?, name = ?
             WHERE mrid = ?`,
            [testType.code, testType.name, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update disconnector test type failed' })
                return resolve({ success: true, data: testType, message: 'Update disconnector test type completed' })
            }
        )
    })
}

export const updateTestTypeDisconnectorByIdTransaction = async (mrid, testType, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE disconnector_test_type
             SET code = ?, name = ?
             WHERE mrid = ?`,
            [testType.code, testType.name, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update disconnector test type failed' })
                return resolve({ success: true, data: testType, message: 'Update disconnector test type completed' })
            }
        )
    })
}

export const deleteTestTypeDisconnectorById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM disconnector_test_type WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete disconnector test type failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Disconnector test type not found' })
            return resolve({ success: true, data: null, message: 'Delete disconnector test type completed' })
        })
    })
}

export const deleteTestTypeDisconnectorByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM disconnector_test_type WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete disconnector test type failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Disconnector test type not found' })
            return resolve({ success: true, data: null, message: 'Delete disconnector test type completed' })
        })
    })
}