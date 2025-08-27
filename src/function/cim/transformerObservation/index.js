import db from '../../datacontext/index'
import * as identifiedObjectFunc from '../identifiedObject/index'

// Lấy transformerObservation theo mrid
export const getTransformerObservationById = async (mrid) => {
    try {
        const identifiedObject = await identifiedObjectFunc.getIdentifiedObjectById(mrid)
        if (!identifiedObject.success) {
            return { success: false, data: null, message: 'IdentifiedObject not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM transformer_observation WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get transformerObservation by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'TransformerObservation not found' })
                    return resolve({ success: true, data: { ...identifiedObject.data, ...row }, message: 'Get transformerObservation by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get transformerObservation by id failed' }
    }
}

// Thêm mới transformerObservation
export const insertTransformerObservationTransaction = async (transformerObservation, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thêm identifiedObject trước
            const idObjResult = await identifiedObjectFunc.insertIdentifiedObjectTransaction(transformerObservation, dbsql)
            if (!idObjResult.success) {
                return reject({ success: false, message: 'Insert identifiedObject failed', err: idObjResult.err })
            }
            dbsql.run(
                `INSERT INTO transformer_observation(
                    mrid, bushing_temp, dga, freq_resp, furfural_dp, hot_spot_temp, oil_color,
                    oil_dielectric_strength, oil_ift, oil_level, oil_neutralization_number, pump_vibration,
                    status, top_oil_temp, water_content, transformer, reconditioning
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    bushing_temp = excluded.bushing_temp,
                    dga = excluded.dga,
                    freq_resp = excluded.freq_resp,
                    furfural_dp = excluded.furfural_dp,
                    hot_spot_temp = excluded.hot_spot_temp,
                    oil_color = excluded.oil_color,
                    oil_dielectric_strength = excluded.oil_dielectric_strength,
                    oil_ift = excluded.oil_ift,
                    oil_level = excluded.oil_level,
                    oil_neutralization_number = excluded.oil_neutralization_number,
                    pump_vibration = excluded.pump_vibration,
                    status = excluded.status,
                    top_oil_temp = excluded.top_oil_temp,
                    water_content = excluded.water_content,
                    transformer = excluded.transformer,
                    reconditioning = excluded.reconditioning
                `,
                [
                    transformerObservation.mrid,
                    transformerObservation.bushing_temp,
                    transformerObservation.dga,
                    transformerObservation.freq_resp,
                    transformerObservation.furfural_dp,
                    transformerObservation.hot_spot_temp,
                    transformerObservation.oil_color,
                    transformerObservation.oil_dielectric_strength,
                    transformerObservation.oil_ift,
                    transformerObservation.oil_level,
                    transformerObservation.oil_neutralization_number,
                    transformerObservation.pump_vibration,
                    transformerObservation.status,
                    transformerObservation.top_oil_temp,
                    transformerObservation.water_content,
                    transformerObservation.transformer,
                    transformerObservation.reconditioning
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert transformerObservation failed' })
                    return resolve({ success: true, data: transformerObservation, message: 'Insert transformerObservation completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert transformerObservation failed' })
        }
    })
}

// Cập nhật transformerObservation
export const updateTransformerObservationByIdTransaction = async (mrid, transformerObservation, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Cập nhật identifiedObject trước
            const idObjResult = await identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, transformerObservation, dbsql)
            if (!idObjResult.success) {
                return reject({ success: false, message: 'Update identifiedObject failed', err: idObjResult.err })
            }
            dbsql.run(
                `UPDATE transformer_observation SET
                    bushing_temp = ?,
                    dga = ?,
                    freq_resp = ?,
                    furfural_dp = ?,
                    hot_spot_temp = ?,
                    oil_color = ?,
                    oil_dielectric_strength = ?,
                    oil_ift = ?,
                    oil_level = ?,
                    oil_neutralization_number = ?,
                    pump_vibration = ?,
                    status = ?,
                    top_oil_temp = ?,
                    water_content = ?,
                    transformer = ?,
                    reconditioning = ?
                WHERE mrid = ?`,
                [
                    transformerObservation.bushing_temp,
                    transformerObservation.dga,
                    transformerObservation.freq_resp,
                    transformerObservation.furfural_dp,
                    transformerObservation.hot_spot_temp,
                    transformerObservation.oil_color,
                    transformerObservation.oil_dielectric_strength,
                    transformerObservation.oil_ift,
                    transformerObservation.oil_level,
                    transformerObservation.oil_neutralization_number,
                    transformerObservation.pump_vibration,
                    transformerObservation.status,
                    transformerObservation.top_oil_temp,
                    transformerObservation.water_content,
                    transformerObservation.transformer,
                    transformerObservation.reconditioning,
                    mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update transformerObservation failed' })
                    return resolve({ success: true, data: transformerObservation, message: 'Update transformerObservation completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update transformerObservation failed' })
        }
    })
}

// Xóa transformerObservation
export const deleteTransformerObservationByIdTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM transformer_observation WHERE mrid=?", [mrid], function (err) {
                if (err) return reject({ success: false, err, message: 'Delete transformerObservation failed' })
                if (this.changes === 0) return resolve({ success: false, data: null, message: 'TransformerObservation not found' })
                // Xóa identifiedObject sau khi xóa transformerObservation
                identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, dbsql)
                return resolve({ success: true, data: null, message: 'Delete transformerObservation completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete transformerObservation failed' })
        }
    })
}