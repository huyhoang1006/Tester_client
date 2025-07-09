import db from '../../datacontext/index'
import * as identifiedObjectFunc from '../identifiedObject/index.js'

// Thêm mới PersonRole (gồm cả insert identified_object)
export const insertPersonRole = async (personRole) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            identifiedObjectFunc.insertIdentifiedObjectTransaction(personRole, db)
                .then(identifiedResult => {
                    if (!identifiedResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
                    }
                    db.run(
                        `INSERT INTO person_role(
                            mrid,
                            department,
                            position
                        ) VALUES (?, ?, ?)
                        ON CONFLICT(mrid) DO UPDATE SET
                            department = excluded.department,
                            position = excluded.position`,
                        [
                            personRole.mrid,
                            personRole.department,
                            personRole.position
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Insert personRole failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: personRole, message: 'Insert personRole completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Insert personRole transaction failed' })
                })
        })
    })
}

// Thêm mới PersonRole trong transaction (cho lớp cha gọi)
export const insertPersonRoleTransaction = async (personRole, dbsql) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.insertIdentifiedObjectTransaction(personRole, dbsql)
            .then(identifiedResult => {
                if (!identifiedResult.success) {
                    return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
                }
                dbsql.run(
                    `INSERT INTO person_role(
                        mrid,
                        department,
                        position
                    ) VALUES (?, ?, ?)
                    ON CONFLICT(mrid) DO UPDATE SET
                        department = excluded.department,
                        position = excluded.position`,
                    [
                        personRole.mrid,
                        personRole.department,
                        personRole.position
                    ],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Insert personRole failed' })
                        }
                        return resolve({ success: true, data: personRole, message: 'Insert personRole completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Insert personRole transaction failed' })
            })
    })
}

// Lấy PersonRole theo mrid (gộp cả cha)
export const getPersonRoleById = async (mrid) => {
    try {
        const identifiedResult = await identifiedObjectFunc.getIdentifiedObjectById(mrid)
        if (!identifiedResult.success) {
            return { success: false, data: null, message: 'Identified object not found' }
        }
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM person_role WHERE mrid = ?", [mrid], (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get personRole failed' })
                if (!row) return resolve({ success: false, data: null, message: 'PersonRole not found' })
                const data = { ...identifiedResult.data, ...row }
                return resolve({ success: true, data : data, message: 'Get personRole completed' })
            })
        })
    } catch (err) {
        return { success: false, err, message: 'Get personRole failed' }
    }
}

// Lấy PersonRole theo personId
export const getPersonRoleByPersonId = async (personId) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM person_role WHERE person = ?", [personId], async (err, row) => {
            if (err) return reject({ success: false, err, message: 'Get personRole failed' })
            if (!row) return resolve({ success: false, data: null, message: 'PersonRole not found' })
            try {
                const identifiedResult = await identifiedObjectFunc.getIdentifiedObjectById(row.mrid)
                if (!identifiedResult.success) {
                    return resolve({ success: false, data: null, message: 'Identified object not found' })
                }
                const data = { ...identifiedResult.data, ...row }
                return resolve({ success: true, data:data, message: 'Get personRole completed' })
            } catch (e) {
                return reject({ success: false, err: e, message: 'Get identified object failed' })
            }
        })
    })
}

// Cập nhật PersonRole (gồm cả identified_object)
export const updatePersonRole = async (mrid, personRole) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, personRole, db)
                .then(identifiedResult => {
                    if (!identifiedResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
                    }
                    db.run(
                        `UPDATE person_role SET
                            department = ?,
                            position = ?
                        WHERE mrid = ?`,
                        [
                            personRole.department,
                            personRole.position,
                            mrid
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Update personRole failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: personRole, message: 'Update personRole completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Update personRole transaction failed' })
                })
        })
    })
}

// Cập nhật PersonRole trong transaction (cho lớp cha gọi)
export const updatePersonRoleTransaction = async (mrid, personRole, dbsql) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, personRole, dbsql)
            .then(identifiedResult => {
                if (!identifiedResult.success) {
                    return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
                }
                dbsql.run(
                    `UPDATE person_role SET
                        department = ?,
                        position = ?
                    WHERE mrid = ?`,
                    [
                        personRole.department,
                        personRole.position,
                        mrid
                    ],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Update personRole failed' })
                        }
                        return resolve({ success: true, data: personRole, message: 'Update personRole completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Update personRole transaction failed' })
            })
    })
}

// Xóa PersonRole (gồm cả identified_object, dùng cascade)
export const deletePersonRoleById = async (mrid) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, db)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete identified object failed', err: result.err })
                }
                return resolve({ success: true, message: 'Delete personRole (and identified object) completed' })
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Delete personRole transaction failed' })
            })
    })
}

// Xóa PersonRole trong transaction (cho lớp cha gọi)
export const deletePersonRoleByIdTransaction = async (mrid, dbsql) => {
    return identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, dbsql)
}