import db from '../../datacontext/index'
import * as equipmentContainerFunc from '../equipmentContainer/index.js'

// Thêm mới Substation (gồm cả insert EquipmentContainer)
export const insertSubstation = async (substation) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            equipmentContainerFunc.insertEquipmentContainerTransaction(substation, db)
                .then(result => {
                    if (!result.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Insert EquipmentContainer failed', err: result.err })
                    }
                    db.run(
                        `INSERT INTO substation(mrid, generation, industry)
                         VALUES (?, ?, ?)
                         ON CONFLICT(mrid) DO UPDATE SET
                            generation = excluded.generation,
                            industry = excluded.industry`,
                        [substation.mrid, substation.generation, substation.industry],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Insert Substation failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: substation, message: 'Insert Substation completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Insert Substation transaction failed' })
                })
        })
    })
}

// Thêm mới Substation trong transaction (cho lớp cha gọi)
export const insertSubstationTransaction = async (substation, dbsql) => {
    return new Promise((resolve, reject) => {
        equipmentContainerFunc.insertEquipmentContainerTransaction(substation, dbsql)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Insert EquipmentContainer failed', err: result.err })
                }
                dbsql.run(
                    `INSERT INTO substation(mrid, generation, industry)
                     VALUES (?, ?, ?)
                     ON CONFLICT(mrid) DO UPDATE SET
                        generation = excluded.generation,
                        industry = excluded.industry`,
                    [substation.mrid, substation.generation, substation.industry],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Insert Substation failed' })
                        }
                        return resolve({ success: true, data: substation, message: 'Insert Substation completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Insert Substation transaction failed' })
            })
    })
}

export const getSubstationsInOrganisationForUser = async (organisationId, userId) => {
    try {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    s.*, 
                    psr.location AS location_id,
                    io.name AS location_name
                FROM substation s
                JOIN power_system_resource psr ON s.mrid = psr.mrid
                JOIN location l ON psr.location = l.mrid
                JOIN identified_object io ON l.mrid = io.mrid
                JOIN organisation_location ol ON l.mrid = ol.location_id
                JOIN user_identified_object uio ON s.mrid = uio.identified_object_id
                WHERE ol.organisation_id = ?
                  AND uio.user_id = ?
            `;

            db.all(query, [organisationId, userId], (err, rows) => {
                if (err) {
                    return reject({ success: false, data: null, message: 'Query failed', err });
                }
                if (!rows || rows.length === 0) {
                    return resolve({ success: false, data: [], message: 'No substations found for this user in organisation' });
                }

                return resolve({
                    success: true,
                    data: rows,
                    message: 'Substations in organisation for user retrieved'
                });
            });
        });
    } catch (err) {
        return { success: false, data: null, message: 'Unexpected error', err };
    }
};


// Lấy Substation theo mrid (gộp cả cha, trả về data: data)
export const getSubstationById = async (mrid) => {
    try {
        const ecResult = await equipmentContainerFunc.getEquipmentContainerById(mrid)
        if (!ecResult.success) {
            return { success: false, data: null, message: 'EquipmentContainer not found' }
        }
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM substation WHERE mrid = ?", [mrid], (err, row) => {
                if (err) return reject({ success: false, data: null, message: 'Get Substation failed', err })
                if (!row) return resolve({ success: false, data: null, message: 'Substation not found' })
                const data = { ...ecResult.data, ...row }
                return resolve({ success: true, data: data, message: 'Get Substation completed' })
            })
        })
    } catch (err) {
        return { success: false, data: null, message: 'Get Substation failed', err }
    }
}

// Cập nhật Substation (gồm cả EquipmentContainer)
export const updateSubstationById = async (mrid, substation) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            equipmentContainerFunc.updateEquipmentContainerByIdTransaction(mrid, substation, db)
                .then(result => {
                    if (!result.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Update EquipmentContainer failed', err: result.err })
                    }
                    db.run(
                        `UPDATE substation SET
                            generation = ?,
                            industry = ?
                         WHERE mrid = ?`,
                        [substation.generation, substation.industry, mrid],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Update Substation failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: substation, message: 'Update Substation completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Update Substation transaction failed' })
                })
        })
    })
}

// Cập nhật Substation trong transaction (cho lớp cha gọi)
export const updateSubstationByIdTransaction = async (mrid, substation, dbsql) => {
    return new Promise((resolve, reject) => {
        equipmentContainerFunc.updateEquipmentContainerByIdTransaction(mrid, substation, dbsql)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Update EquipmentContainer failed', err: result.err })
                }
                dbsql.run(
                    `UPDATE substation SET
                        generation = ?,
                        industry = ?
                     WHERE mrid = ?`,
                    [substation.generation, substation.industry, mrid],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Update Substation failed' })
                        }
                        return resolve({ success: true, data: substation, message: 'Update Substation completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Update Substation transaction failed' })
            })
    })
}

// Xóa Substation (gồm cả EquipmentContainer, dùng cascade)
export const deleteSubstationById = async (mrid) => {
    return new Promise((resolve, reject) => {
        equipmentContainerFunc.deleteEquipmentContainerByIdTransaction(mrid, db)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete EquipmentContainer failed', err: result.err })
                }
                return resolve({ success: true, message: 'Delete Substation (and EquipmentContainer) completed' })
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Delete Substation transaction failed' })
            })
    })
}

// Xóa Substation trong transaction (cho lớp cha gọi)
export const deleteSubstationByIdTransaction = async (mrid, dbsql) => {
    return equipmentContainerFunc.deleteEquipmentContainerByIdTransaction(mrid, dbsql)
}