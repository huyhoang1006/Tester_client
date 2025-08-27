import db from '../../datacontext/index'
import * as identifiedObjectFunc from '../identifiedObject/index'

// Lấy specimen theo mrid
export const getSpecimenById = async (mrid) => {
    try {
        const identifiedObject = await identifiedObjectFunc.getIdentifiedObjectById(mrid)
        if (!identifiedObject.success) {
            return { success: false, data: null, message: 'IdentifiedObject not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM specimen WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get specimen by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'Specimen not found' })
                    return resolve({ success: true, data: { ...identifiedObject.data, ...row }, message: 'Get specimen by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get specimen by id failed' }
    }
}

// Thêm mới specimen
export const insertSpecimenTransaction = async (specimen, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thêm identifiedObject trước
            const idObjResult = await identifiedObjectFunc.insertIdentifiedObjectTransaction(specimen, dbsql)
            if (!idObjResult.success) {
                return reject({ success: false, message: 'Insert identifiedObject failed', err: idObjResult.err })
            }
            dbsql.run(
                `INSERT INTO specimen(
                    mrid, ambient_temperature_at_sampling, humidity_at_sampling, specimen_id,
                    specimen_sample_date_time, specimen_to_lab_date_time, asset_test_sample_taker
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    ambient_temperature_at_sampling = excluded.ambient_temperature_at_sampling,
                    humidity_at_sampling = excluded.humidity_at_sampling,
                    specimen_id = excluded.specimen_id,
                    specimen_sample_date_time = excluded.specimen_sample_date_time,
                    specimen_to_lab_date_time = excluded.specimen_to_lab_date_time,
                    asset_test_sample_taker = excluded.asset_test_sample_taker
                `,
                [
                    specimen.mrid,
                    specimen.ambient_temperature_at_sampling,
                    specimen.humidity_at_sampling,
                    specimen.specimen_id,
                    specimen.specimen_sample_date_time,
                    specimen.specimen_to_lab_date_time,
                    specimen.asset_test_sample_taker
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert specimen failed' })
                    return resolve({ success: true, data: specimen, message: 'Insert specimen completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert specimen failed' })
        }
    })
}

// Cập nhật specimen
export const updateSpecimenByIdTransaction = async (mrid, specimen, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Cập nhật identifiedObject trước
            const idObjResult = await identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, specimen, dbsql)
            if (!idObjResult.success) {
                return reject({ success: false, message: 'Update identifiedObject failed', err: idObjResult.err })
            }
            dbsql.run(
                `UPDATE specimen SET
                    ambient_temperature_at_sampling = ?,
                    humidity_at_sampling = ?,
                    specimen_id = ?,
                    specimen_sample_date_time = ?,
                    specimen_to_lab_date_time = ?,
                    asset_test_sample_taker = ?
                WHERE mrid = ?`,
                [
                    specimen.ambient_temperature_at_sampling,
                    specimen.humidity_at_sampling,
                    specimen.specimen_id,
                    specimen.specimen_sample_date_time,
                    specimen.specimen_to_lab_date_time,
                    specimen.asset_test_sample_taker,
                    mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update specimen failed' })
                    return resolve({ success: true, data: specimen, message: 'Update specimen completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update specimen failed' })
        }
    })
}

// Xóa specimen
export const deleteSpecimenByIdTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM specimen WHERE mrid=?", [mrid], function (err) {
                if (err) return reject({ success: false, err, message: 'Delete specimen failed' })
                if (this.changes === 0) return resolve({ success: false, data: null, message: 'Specimen not found' })
                // Xóa identifiedObject sau khi xóa specimen
                identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, dbsql)
                return resolve({ success: true, data: null, message: 'Delete specimen completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete specimen failed' })
        }
    })
}