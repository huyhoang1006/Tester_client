import db from '../../../datacontext/index'

export const getTestTypeReactorByMrid = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM reactor_test_type WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get reactor test type by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Reactor test type not found' })
            return resolve({ success: true, data: row, message: 'Get reactor test type by id completed' })
        })
    })
}

export const getAllTestTypeReactor = async () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM reactor_test_type", [], (err, rows) => {
            if (err) return reject({ success: false, err: err, message: 'Get all reactor test types failed' })
            return resolve({ success: true, data: rows, message: 'Get all reactor test types completed' })
        })
    })
}

export const insertTestTypeReactor = async (testType) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO reactor_test_type(mrid, code, name)
             VALUES (?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                code = excluded.code,
                name = excluded.name`,            [
                testType.mrid,
                testType.code,
                testType.name
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert reactor test type failed' })
                return resolve({ success: true, data: testType, message: 'Insert reactor test type completed' })
            }
        )
    })
}

export const insertTestTypeReactorTransaction = async (testType, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO reactor_test_type(mrid, code, name)
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
                if (err) return reject({ success: false, err, message: 'Insert reactor test type failed' })
                return resolve({ success: true, data: testType, message: 'Insert reactor test type completed' })
            }
        )
    })
}

export const updateTestTypeReactorById = async (mrid, testType) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE reactor_test_type
             SET code = ?, name = ?
             WHERE mrid = ?`,
            [testType.code, testType.name, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update reactor test type failed' })
                return resolve({ success: true, data: testType, message: 'Update reactor test type completed' })
            }
        )
    })
}

export const updateTestTypeReactorByIdTransaction = async (mrid, testType, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE reactor_test_type
             SET code = ?, name = ?
             WHERE mrid = ?`,
            [testType.code, testType.name, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update reactor test type failed' })
                return resolve({ success: true, data: testType, message: 'Update reactor test type completed' })
            }
        )
    })
}

export const deleteTestTypeReactorById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM reactor_test_type WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete reactor test type failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Reactor test type not found' })
            return resolve({ success: true, data: null, message: 'Delete reactor test type completed' })
        })
    })
}

export const deleteTestTypeReactorByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM reactor_test_type WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete reactor test type failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Reactor test type not found' })
            return resolve({ success: true, data: null, message: 'Delete reactor test type completed' })
        })
    })
}