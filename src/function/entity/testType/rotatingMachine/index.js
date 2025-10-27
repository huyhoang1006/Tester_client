import db from '../../../datacontext/index'

export const getTestTypeRotatingMachineByMrid = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM rotating_machine_test_type WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get rotating machine test type by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Rotating machine test type not found' })
            return resolve({ success: true, data: row, message: 'Get rotating machine test type by id completed' })
        })
    })
}

export const getAllTestTypeRotatingMachine = async () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM rotating_machine_test_type", [], (err, rows) => {
            if (err) return reject({ success: false, err: err, message: 'Get all rotating machine test types failed' })
            return resolve({ success: true, data: rows, message: 'Get all rotating machine test types completed' })
        })
    })
}

export const insertTestTypeRotatingMachine = async (testType) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO rotating_machine_test_type(mrid, code, name)
             VALUES (?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                code = excluded.code,
                name = excluded.name`,            [
                testType.mrid,
                testType.code,
                testType.name
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert rotating machine test type failed' })
                return resolve({ success: true, data: testType, message: 'Insert rotating machine test type completed' })
            }
        )
    })
}

export const insertTestTypeRotatingMachineTransaction = async (testType, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO rotating_machine_test_type(mrid, code, name)
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
                if (err) return reject({ success: false, err, message: 'Insert rotating machine test type failed' })
                return resolve({ success: true, data: testType, message: 'Insert rotating machine test type completed' })
            }
        )
    })
}

export const updateTestTypeRotatingMachineById = async (mrid, testType) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE rotating_machine_test_type
             SET code = ?, name = ?
             WHERE mrid = ?`,
            [testType.code, testType.name, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update rotating machine test type failed' })
                return resolve({ success: true, data: testType, message: 'Update rotating machine test type completed' })
            }
        )
    })
}

export const updateTestTypeRotatingMachineByIdTransaction = async (mrid, testType, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE rotating_machine_test_type
             SET code = ?, name = ?
             WHERE mrid = ?`,
            [testType.code, testType.name, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update rotating machine test type failed' })
                return resolve({ success: true, data: testType, message: 'Update rotating machine test type completed' })
            }
        )
    })
}

export const deleteTestTypeRotatingMachineById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM rotating_machine_test_type WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete rotating machine test type failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Rotating machine test type not found' })
            return resolve({ success: true, data: null, message: 'Delete rotating machine test type completed' })
        })
    })
}

export const deleteTestTypeRotatingMachineByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM rotating_machine_test_type WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete rotating machine test type failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Rotating machine test type not found' })
            return resolve({ success: true, data: null, message: 'Delete rotating machine test type completed' })
        })
    })
}