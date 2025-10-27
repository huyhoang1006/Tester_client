import db from '../../../datacontext/index'

export const getTestTypeTransformerByMrid = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM transformer_test_type WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get transformer test type by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Transformer test type not found' })
            return resolve({ success: true, data: row, message: 'Get transformer test type by id completed' })
        })
    })
}

export const getAllTestTypeTransformer = async () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM transformer_test_type", [], (err, rows) => {
            if (err) return reject({ success: false, err: err, message: 'Get all transformer test types failed' })
            return resolve({ success: true, data: rows, message: 'Get all transformer test types completed' })
        })
    })
}

export const insertTestTypeTransformer = async (testType) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO transformer_test_type(mrid, code, name)
             VALUES (?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                code = excluded.code,
                name = excluded.name`,            [
                testType.mrid,
                testType.code,
                testType.name
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert transformer test type failed' })
                return resolve({ success: true, data: testType, message: 'Insert transformer test type completed' })
            }
        )
    })
}

export const insertTestTypeTransformerTransaction = async (testType, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO transformer_test_type(mrid, code, name)
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
                if (err) return reject({ success: false, err, message: 'Insert transformer test type failed' })
                return resolve({ success: true, data: testType, message: 'Insert transformer test type completed' })
            }
        )
    })
}

export const updateTestTypeTransformerById = async (mrid, testType) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE transformer_test_type
             SET code = ?, name = ?
             WHERE mrid = ?`,
            [testType.code, testType.name, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update transformer test type failed' })
                return resolve({ success: true, data: testType, message: 'Update transformer test type completed' })
            }
        )
    })
}

export const updateTestTypeTransformerByIdTransaction = async (mrid, testType, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE transformer_test_type
             SET code = ?, name = ?
             WHERE mrid = ?`,
            [testType.code, testType.name, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update transformer test type failed' })
                return resolve({ success: true, data: testType, message: 'Update transformer test type completed' })
            }
        )
    })
}

export const deleteTestTypeTransformerById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM transformer_test_type WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete transformer test type failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Transformer test type not found' })
            return resolve({ success: true, data: null, message: 'Delete transformer test type completed' })
        })
    })
}

export const deleteTestTypeTransformerByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM transformer_test_type WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete transformer test type failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Transformer test type not found' })
            return resolve({ success: true, data: null, message: 'Delete transformer test type completed' })
        })
    })
}