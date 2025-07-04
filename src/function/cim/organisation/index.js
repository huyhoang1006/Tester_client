import db from '../../datacontext/index'
import * as identifiedObjectFunc from '../identifiedObject/index.js'

// Thêm mới Organisation (gồm cả insert identified_object)
export const insertOrganisation = async (organisation) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            identifiedObjectFunc.insertIdentifiedObjectTransaction(organisation, db)
                .then(identifiedResult => {
                    if (!identifiedResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
                    }
                    db.run(
                        `INSERT INTO organisation(
                            mrid,
                            electronic_address,
                            phone,
                            postal_address,
                            street_address,
                            parent_organisation
                        ) VALUES (?, ?, ?, ?, ?, ?)
                        ON CONFLICT(mrid) DO UPDATE SET
                            electronic_address = excluded.electronic_address,
                            phone = excluded.phone,
                            postal_address = excluded.postal_address,
                            street_address = excluded.street_address,
                            parent_organisation = excluded.parent_organisation`,
                        [
                            organisation.mrid,
                            organisation.electronic_address,
                            organisation.phone,
                            organisation.postal_address,
                            organisation.street_address,
                            organisation.parent_organisation
                        ],
                        function (err) {
                            if (err) {
                                console.log(err)
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Insert organisation failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: organisation, message: 'Insert organisation completed' })
                        }
                    )
                })
                .catch(err => {
                    console.log(err)
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Insert organisation transaction failed' })
                })
        })
    })
}

// Thêm mới Organisation trong transaction (cho lớp cha gọi)
export const insertOrganisationTransaction = async (organisation, dbsql) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.insertIdentifiedObjectTransaction(organisation, dbsql)
            .then(identifiedResult => {
                if (!identifiedResult.success) {
                    return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
                }
                dbsql.run(
                    `INSERT INTO organisation(
                        mrid,
                        electronic_address,
                        phone,
                        postal_address,
                        street_address,
                        parent_organisation
                    ) VALUES (?, ?, ?, ?, ?, ?)
                    ON CONFLICT(mrid) DO UPDATE SET
                        electronic_address = excluded.electronic_address,
                        phone = excluded.phone,
                        postal_address = excluded.postal_address,
                        street_address = excluded.street_address,
                        parent_organisation = excluded.parent_organisation`,
                    [
                        organisation.mrid,
                        organisation.electronic_address,
                        organisation.phone,
                        organisation.postal_address,
                        organisation.street_address,
                        organisation.parent_organisation
                    ],
                    function (err) {
                        console.log(err)
                        if (err) {
                            return reject({ success: false, err, message: 'Insert organisation failed' })
                        }
                        return resolve({ success: true, data: organisation, message: 'Insert organisation completed' })
                    }
                )
            })
            .catch(err => {
                console.log(err)
                return reject({ success: false, err, message: 'Insert organisation transaction failed' })
            })
    })
}

// Lấy Organisation theo mrid (gộp cả cha)
export const getOrganisationById = async (mrid) => {
    try {
        const identifiedResult = await identifiedObjectFunc.getIdentifiedObjectById(mrid)
        if (!identifiedResult.success) {
            return { success: false, data: null, message: 'Identified object not found' }
        }
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM organisation WHERE mrid = ?", [mrid], (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get organisation failed' })
                if (!row) return resolve({ success: false, data: null, message: 'Organisation not found' })
                const data = { ...identifiedResult.data, ...row }
                return resolve({ success: true, data: data, message: 'Get organisation completed' })
            })
        })
    } catch (err) {
        return { success: false, err, message: 'Get organisation failed' }
    }
}

// Cập nhật Organisation (gồm cả identified_object)
export const updateOrganisationById = async (mrid, organisation) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, organisation, db)
                .then(identifiedResult => {
                    if (!identifiedResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
                    }
                    db.run(
                        `UPDATE organisation SET
                            electronic_address = ?,
                            phone = ?,
                            postal_address = ?,
                            street_address = ?,
                            parent_organisation = ?
                        WHERE mrid = ?`,
                        [
                            organisation.electronic_address,
                            organisation.phone,
                            organisation.postal_address,
                            organisation.street_address,
                            organisation.parent_organisation,
                            mrid
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Update organisation failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: organisation, message: 'Update organisation completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Update organisation transaction failed' })
                })
        })
    })
}

// Cập nhật Organisation trong transaction (cho lớp cha gọi)
export const updateOrganisationByIdTransaction = async (mrid, organisation, dbsql) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, organisation, dbsql)
            .then(identifiedResult => {
                if (!identifiedResult.success) {
                    return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
                }
                dbsql.run(
                    `UPDATE organisation SET
                        electronic_address = ?,
                        phone = ?,
                        postal_address = ?,
                        street_address = ?,
                        parent_organisation = ?
                    WHERE mrid = ?`,
                    [
                        organisation.electronic_address,
                        organisation.phone,
                        organisation.postal_address,
                        organisation.street_address,
                        organisation.parent_organisation,
                        mrid
                    ],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Update organisation failed' })
                        }
                        return resolve({ success: true, data: organisation, message: 'Update organisation completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Update organisation transaction failed' })
            })
    })
}

// Xóa Organisation (gồm cả identified_object, dùng cascade)
export const deleteOrganisationById = async (mrid) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, db)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete identified object failed', err: result.err })
                }
                return resolve({ success: true, message: 'Delete organisation (and identified object) completed' })
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Delete organisation transaction failed' })
            })
    })
}

// Xóa Organisation trong transaction (cho lớp cha gọi)
export const deleteOrganisationByIdTransaction = async (mrid, dbsql) => {
    return identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, dbsql)
}