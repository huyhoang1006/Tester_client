import db from '../../../datacontext/index'

export const getTestTypeCapacitorByMrid = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM capacitor_test_type WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get capacitor test type by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Capacitor test type not found' })
            return resolve({ success: true, data: row, message: 'Get capacitor test type by id completed' })
        })
    })
}

export const getAllTestTypeCapacitor = async () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM capacitor_test_type", [], (err, rows) => {
            if (err) return reject({ success: false, err: err, message: 'Get all capacitor test types failed' })
            return resolve({ success: true, data: rows, message: 'Get all capacitor test types completed' })
        })
    })
}

export const insertTestTypeCapacitor = async (testType) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO capacitor_test_type(mrid, code, name)
             VALUES (?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                code = excluded.code,
                name = excluded.name`,            [
                testType.mrid,
                testType.code,
                testType.name
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert capacitor test type failed' })
                return resolve({ success: true, data: testType, message: 'Insert capacitor test type completed' })
            }
        )
    })
}

export const insertTestTypeCapacitorTransaction = async (testType, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO capacitor_test_type(mrid, code, name)
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
                if (err) return reject({ success: false, err, message: 'Insert capacitor test type failed' })
                return resolve({ success: true, data: testType, message: 'Insert capacitor test type completed' })
            }
        )
    })
}

export const updateTestTypeCapacitorById = async (mrid, testType) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE capacitor_test_type
             SET code = ?, name = ?
             WHERE mrid = ?`,
            [testType.code, testType.name, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update capacitor test type failed' })
                return resolve({ success: true, data: testType, message: 'Update capacitor test type completed' })
            }
        )
    })
}

export const updateTestTypeCapacitorByIdTransaction = async (mrid, testType, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE capacitor_test_type
             SET code = ?, name = ?
             WHERE mrid = ?`,
            [testType.code, testType.name, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update capacitor test type failed' })
                return resolve({ success: true, data: testType, message: 'Update capacitor test type completed' })
            }
        )
    })
}

export const deleteTestTypeCapacitorById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM capacitor_test_type WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete capacitor test type failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Capacitor test type not found' })
            return resolve({ success: true, data: null, message: 'Delete capacitor test type completed' })
        })
    })
}

export const deleteTestTypeCapacitorByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM capacitor_test_type WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete capacitor test type failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Capacitor test type not found' })
            return resolve({ success: true, data: null, message: 'Delete capacitor test type completed' })
        })
    })
}