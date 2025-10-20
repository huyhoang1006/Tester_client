import db from '../../../datacontext/index'

export const getTestTypeVTByMrid = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM vt_test_type WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get voltage transformer test type by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Voltage transformer test type not found' })
            return resolve({ success: true, data: row, message: 'Get voltage transformer test type by id completed' })
        })
    })
}

export const getAllTestTypeVT = async () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM vt_test_type", [], (err, rows) => {
            if (err) return reject({ success: false, err: err, message: 'Get all voltage transformer test types failed' })
            return resolve({ success: true, data: rows, message: 'Get all voltage transformer test types completed' })
        })
    })
}

export const insertTestTypeVT = async (testType) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO vt_test_type(mrid, code, name)
             VALUES (?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                code = excluded.code,
                name = excluded.name`,            [
                testType.mrid,
                testType.code,
                testType.name
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert voltage transformer test type failed' })
                return resolve({ success: true, data: testType, message: 'Insert voltage transformer test type completed' })
            }
        )
    })
}

export const insertTestTypeVTTransaction = async (testType, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO vt_test_type(mrid, code, name)
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
                if (err) return reject({ success: false, err, message: 'Insert voltage transformer test type failed' })
                return resolve({ success: true, data: testType, message: 'Insert voltage transformer test type completed' })
            }
        )
    })
}

export const updateTestTypeVTById = async (mrid, testType) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE vt_test_type
             SET code = ?, name = ?
             WHERE mrid = ?`,
            [testType.code, testType.name, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update voltage transformer test type failed' })
                return resolve({ success: true, data: testType, message: 'Update voltage transformer test type completed' })
            }
        )
    })
}

export const updateTestTypeVTByIdTransaction = async (mrid, testType, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE vt_test_type
             SET code = ?, name = ?
             WHERE mrid = ?`,
            [testType.code, testType.name, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update voltage transformer test type failed' })
                return resolve({ success: true, data: testType, message: 'Update voltage transformer test type completed' })
            }
        )
    })
}

export const deleteTestTypeVTById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM vt_test_type WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete voltage transformer test type failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Voltage transformer test type not found' })
            return resolve({ success: true, data: null, message: 'Delete voltage transformer test type completed' })
        })
    })
}

export const deleteTestTypeVTByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM vt_test_type WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete voltage transformer test type failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Voltage transformer test type not found' })
            return resolve({ success: true, data: null, message: 'Delete voltage transformer test type completed' })
        })
    })
}