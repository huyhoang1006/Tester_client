import db from '../../../datacontext/index'

export const getTestTypePowerCableByMrid = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM power_cable_test_type WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get power cable test type by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Power cable test type not found' })
            return resolve({ success: true, data: row, message: 'Get power cable test type by id completed' })
        })
    })
}

export const getAllTestTypePowerCable = async () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM power_cable_test_type", [], (err, rows) => {
            if (err) return reject({ success: false, err: err, message: 'Get all power cable test types failed' })
            return resolve({ success: true, data: rows, message: 'Get all power cable test types completed' })
        })
    })
}

export const insertTestTypePowerCable = async (testType) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO power_cable_test_type(mrid, code, name)
             VALUES (?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                code = excluded.code,
                name = excluded.name`, [
            testType.mrid,
            testType.code,
            testType.name
        ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert power cable test type failed' })
                return resolve({ success: true, data: testType, message: 'Insert power cable test type completed' })
            }
        )
    })
}

export const insertTestTypePowerCableTransaction = async (testType, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO power_cable_test_type(mrid, code, name)
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
                if (err) return reject({ success: false, err, message: 'Insert power cable test type failed' })
                return resolve({ success: true, data: testType, message: 'Insert power cable test type completed' })
            }
        )
    })
}

export const updateTestTypePowerCableById = async (mrid, testType) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE power_cable_test_type
             SET code = ?, name = ?
             WHERE mrid = ?`,
            [testType.code, testType.name, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update power cable test type failed' })
                return resolve({ success: true, data: testType, message: 'Update power cable test type completed' })
            }
        )
    })
}

export const updateTestTypePowerCableByIdTransaction = async (mrid, testType, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE power_cable_test_type
             SET code = ?, name = ?
             WHERE mrid = ?`,
            [testType.code, testType.name, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update power cable test type failed' })
                return resolve({ success: true, data: testType, message: 'Update power cable test type completed' })
            }
        )
    })
}

export const deleteTestTypePowerCableById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM power_cable_test_type WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete power cable test type failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Power cable test type not found' })
            return resolve({ success: true, data: null, message: 'Delete power cable test type completed' })
        })
    })
}

export const deleteTestTypePowerCableByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM power_cable_test_type WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete power cable test type failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Power cable test type not found' })
            return resolve({ success: true, data: null, message: 'Delete power cable test type completed' })
        })
    })
}