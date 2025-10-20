import db from '../../../datacontext/index'

export const getTestTypeCircuitBreakerByMrid = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM breaker_test_type WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get circuit breaker test type by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Circuit breaker test type not found' })
            return resolve({ success: true, data: row, message: 'Get circuit breaker test type by id completed' })
        })
    })
}

export const getAllTestTypeCircuitBreaker = async () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM breaker_test_type", [], (err, rows) => {
            if (err) return reject({ success: false, err: err, message: 'Get all circuit breaker test types failed' })
            return resolve({ success: true, data: rows, message: 'Get all circuit breaker test types completed' })
        })
    })
}

export const insertTestTypeCircuitBreaker = async (testType) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO breaker_test_type(mrid, code, name)
             VALUES (?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                code = excluded.code,
                name = excluded.name`,            [
                testType.mrid,
                testType.code,
                testType.name
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert circuit breaker test type failed' })
                return resolve({ success: true, data: testType, message: 'Insert circuit breaker test type completed' })
            }
        )
    })
}

export const insertTestTypeCircuitBreakerTransaction = async (testType, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO breaker_test_type(mrid, code, name)
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
                if (err) return reject({ success: false, err, message: 'Insert circuit breaker test type failed' })
                return resolve({ success: true, data: testType, message: 'Insert circuit breaker test type completed' })
            }
        )
    })
}

export const updateTestTypeCircuitBreakerById = async (mrid, testType) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE breaker_test_type
             SET code = ?, name = ?
             WHERE mrid = ?`,
            [testType.code, testType.name, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update circuit breaker test type failed' })
                return resolve({ success: true, data: testType, message: 'Update circuit breaker test type completed' })
            }
        )
    })
}

export const updateTestTypeCircuitBreakerByIdTransaction = async (mrid, testType, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE breaker_test_type
             SET code = ?, name = ?
             WHERE mrid = ?`,
            [testType.code, testType.name, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update circuit breaker test type failed' })
                return resolve({ success: true, data: testType, message: 'Update circuit breaker test type completed' })
            }
        )
    })
}

export const deleteTestTypeCircuitBreakerById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM breaker_test_type WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete circuit breaker test type failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Circuit breaker test type not found' })
            return resolve({ success: true, data: null, message: 'Delete circuit breaker test type completed' })
        })
    })
}

export const deleteTestTypeCircuitBreakerByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM breaker_test_type WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete circuit breaker test type failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Circuit breaker test type not found' })
            return resolve({ success: true, data: null, message: 'Delete circuit breaker test type completed' })
        })
    })
}