import db from '../../../datacontext/index'

export const getTestTypeCTByMrid = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM ct_test_type WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get current transformer test type by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Current transformer test type not found' })
            return resolve({ success: true, data: row, message: 'Get current transformer test type by id completed' })
        })
    })
}

export const getAllTestTypeCT = async () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM ct_test_type", [], (err, rows) => {
            if (err) return reject({ success: false, err: err, message: 'Get all current transformer test types failed' })
            return resolve({ success: true, data: rows, message: 'Get all current transformer test types completed' })
        })
    })
}

export const insertTestTypeCT = async (testType) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO ct_test_type(mrid, code, name)
             VALUES (?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                code = excluded.code,
                name = excluded.name`,            [
                testType.mrid,
                testType.code,
                testType.name
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert current transformer test type failed' })
                return resolve({ success: true, data: testType, message: 'Insert current transformer test type completed' })
            }
        )
    })
}

export const insertTestTypeCTTransaction = async (testType, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO ct_test_type(mrid, code, name)
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
                if (err) return reject({ success: false, err, message: 'Insert current transformer test type failed' })
                return resolve({ success: true, data: testType, message: 'Insert current transformer test type completed' })
            }
        )
    })
}

export const updateTestTypeCTById = async (mrid, testType) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE ct_test_type
             SET code = ?, name = ?
             WHERE mrid = ?`,
            [testType.code, testType.name, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update current transformer test type failed' })
                return resolve({ success: true, data: testType, message: 'Update current transformer test type completed' })
            }
        )
    })
}

export const updateTestTypeCTByIdTransaction = async (mrid, testType, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE ct_test_type
             SET code = ?, name = ?
             WHERE mrid = ?`,
            [testType.code, testType.name, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update current transformer test type failed' })
                return resolve({ success: true, data: testType, message: 'Update current transformer test type completed' })
            }
        )
    })
}

export const deleteTestTypeCTById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM ct_test_type WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete current transformer test type failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Current transformer test type not found' })
            return resolve({ success: true, data: null, message: 'Delete current transformer test type completed' })
        })
    })
}

export const deleteTestTypeCTByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM ct_test_type WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete current transformer test type failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Current transformer test type not found' })
            return resolve({ success: true, data: null, message: 'Delete current transformer test type completed' })
        })
    })
}