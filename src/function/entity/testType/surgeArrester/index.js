import db from '../../../datacontext/index'

export const getTestTypeSurgeArresterByMrid = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM surge_arrester_test_type WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get surge arrester test type by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Surge arrester test type not found' })
            return resolve({ success: true, data: row, message: 'Get surge arrester test type by id completed' })
        })
    })
}

export const getAllTestTypeSurgeArrester = async () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM surge_arrester_test_type", [], (err, rows) => {
            if (err) return reject({ success: false, err: err, message: 'Get all surge arrester test types failed' })
            return resolve({ success: true, data: rows, message: 'Get all surge arrester test types completed' })
        })
    })
}

export const insertTestTypeSurgeArrester = async (testType) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO surge_arrester_test_type(mrid, code, name)
             VALUES (?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                code = excluded.code,
                name = excluded.name`,            [
                testType.mrid,
                testType.code,
                testType.name
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert surge arrester test type failed' })
                return resolve({ success: true, data: testType, message: 'Insert surge arrester test type completed' })
            }
        )
    })
}

export const insertTestTypeSurgeArresterTransaction = async (testType, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO surge_arrester_test_type(mrid, code, name)
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
                if (err) return reject({ success: false, err, message: 'Insert surge arrester test type failed' })
                return resolve({ success: true, data: testType, message: 'Insert surge arrester test type completed' })
            }
        )
    })
}

export const updateTestTypeSurgeArresterById = async (mrid, testType) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE surge_arrester_test_type
             SET code = ?, name = ?
             WHERE mrid = ?`,
            [testType.code, testType.name, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update surge arrester test type failed' })
                return resolve({ success: true, data: testType, message: 'Update surge arrester test type completed' })
            }
        )
    })
}

export const updateTestTypeSurgeArresterByIdTransaction = async (mrid, testType, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE surge_arrester_test_type
             SET code = ?, name = ?
             WHERE mrid = ?`,
            [testType.code, testType.name, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update surge arrester test type failed' })
                return resolve({ success: true, data: testType, message: 'Update surge arrester test type completed' })
            }
        )
    })
}

export const deleteTestTypeSurgeArresterById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM surge_arrester_test_type WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete surge arrester test type failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Surge arrester test type not found' })
            return resolve({ success: true, data: null, message: 'Delete surge arrester test type completed' })
        })
    })
}

export const deleteTestTypeSurgeArresterByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM surge_arrester_test_type WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete surge arrester test type failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Surge arrester test type not found' })
            return resolve({ success: true, data: null, message: 'Delete surge arrester test type completed' })
        })
    })
}