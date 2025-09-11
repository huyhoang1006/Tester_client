import db from '../../datacontext/index'
import * as WireInfoFunc from '../wireInfo/index.js'

// Lấy concentricNeutralCableInfo theo mrid
export const getConcentricNeutralCableInfoById = async (mrid) => {
    try {
        const wireInfoResult = await WireInfoFunc.getWireInfoById(mrid)
        if (!wireInfoResult.success) {
            return { success: false, data: null, message: 'WireInfo not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM concentric_neutral_cable_info WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get concentricNeutralCableInfo by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'ConcentricNeutralCableInfo not found' })
                    return resolve({ success: true, data: { ...wireInfoResult.data, ...row }, message: 'Get concentricNeutralCableInfo by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get concentricNeutralCableInfo by id failed' }
    }
}

// Thêm mới concentricNeutralCableInfo (transaction)
export const insertConcentricNeutralCableInfoTransaction = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const wireInfoResult = await WireInfoFunc.insertWireInfoTransaction(info, dbsql)
            if (!wireInfoResult.success) {
                return reject({ success: false, message: 'Insert wireInfo failed', err: wireInfoResult.err })
            }
            dbsql.run(
                `INSERT INTO concentric_neutral_cable_info(
                    mrid, construction_kind, diameter_over_core, diameter_over_insulation, diameter_over_jacket,
                    diameter_over_screen, is_strand_fill, nominal_temperature, outer_jacket_kind,
                    sheath_as_neutral, shield_material
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    construction_kind = excluded.construction_kind,
                    diameter_over_core = excluded.diameter_over_core,
                    diameter_over_insulation = excluded.diameter_over_insulation,
                    diameter_over_jacket = excluded.diameter_over_jacket,
                    diameter_over_screen = excluded.diameter_over_screen,
                    is_strand_fill = excluded.is_strand_fill,
                    nominal_temperature = excluded.nominal_temperature,
                    outer_jacket_kind = excluded.outer_jacket_kind,
                    sheath_as_neutral = excluded.sheath_as_neutral,
                    shield_material = excluded.shield_material
                `,
                [
                    info.mrid,
                    info.construction_kind,
                    info.diameter_over_core,
                    info.diameter_over_insulation,
                    info.diameter_over_jacket,
                    info.diameter_over_screen,
                    info.is_strand_fill,
                    info.nominal_temperature,
                    info.outer_jacket_kind,
                    info.sheath_as_neutral,
                    info.shield_material
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Insert concentricNeutralCableInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert concentricNeutralCableInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert concentricNeutralCableInfo transaction failed' })
        }
    })
}

// Cập nhật concentricNeutralCableInfo (transaction)
export const updateConcentricNeutralCableInfoTransaction = async (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const wireInfoResult = await WireInfoFunc.updateWireInfoTransaction(mrid, info, dbsql)
            if (!wireInfoResult.success) {
                return reject({ success: false, message: 'Update wireInfo failed', err: wireInfoResult.err })
            }
            dbsql.run(
                `UPDATE concentric_neutral_cable_info SET
                    construction_kind = ?,
                    diameter_over_core = ?,
                    diameter_over_insulation = ?,
                    diameter_over_jacket = ?,
                    diameter_over_screen = ?,
                    is_strand_fill = ?,
                    nominal_temperature = ?,
                    outer_jacket_kind = ?,
                    sheath_as_neutral = ?,
                    shield_material = ?
                WHERE mrid = ?`,
                [
                    info.construction_kind,
                    info.diameter_over_core,
                    info.diameter_over_insulation,
                    info.diameter_over_jacket,
                    info.diameter_over_screen,
                    info.is_strand_fill,
                    info.nominal_temperature,
                    info.outer_jacket_kind,
                    info.sheath_as_neutral,
                    info.shield_material,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Update concentricNeutralCableInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Update concentricNeutralCableInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update concentricNeutralCableInfo transaction failed' })
        }
    })
}

// Xóa concentricNeutralCableInfo (transaction)
export const deleteConcentricNeutralCableInfoTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const wireInfoResult = await WireInfoFunc.deleteWireInfoTransaction(mrid, dbsql)
            if (!wireInfoResult.success) {
                return reject({ success: false, message: 'Delete wireInfo failed', err: wireInfoResult.err })
            }
            dbsql.run("DELETE FROM concentric_neutral_cable_info WHERE mrid=?", [mrid], function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Delete concentricNeutralCableInfo failed' })
                }
                return resolve({ success: true, data: mrid, message: 'Delete concentricNeutralCableInfo completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete concentricNeutralCableInfo transaction failed' })
        }
            })
}