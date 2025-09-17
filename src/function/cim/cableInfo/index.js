import db from '../../datacontext/index'
import * as WireInfoFunc from '../wireInfo/index.js'

// Lấy cableInfo theo mrid
export const getCableInfoById = async (mrid) => {
    try {
        const wireInfoResult = await WireInfoFunc.getWireInfoById(mrid)
        if (!wireInfoResult.success) {
            return { success: false, data: null, message: 'WireInfo not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM cable_info WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get cableInfo by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'CableInfo not found' })
                    return resolve({ success: true, data: { ...wireInfoResult.data, ...row }, message: 'Get cableInfo by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get cableInfo by id failed' }
    }
}

// Thêm mới cableInfo (transaction)
export const insertCableInfoTransaction = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const wireInfoResult = await WireInfoFunc.insertWireInfoTransaction(info, dbsql)
            if (!wireInfoResult.success) {
                return reject({ success: false, message: 'Insert wireInfo failed', err: wireInfoResult.err })
            }
            dbsql.run(
                `INSERT INTO cable_info(
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
                        return reject({ success: false, err, message: 'Insert cableInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert cableInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert cableInfo transaction failed' })
        }
    })
}

// Cập nhật cableInfo (transaction)
export const updateCableInfoTransaction = async (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const wireInfoResult = await WireInfoFunc.updateWireInfoTransaction(mrid, info, dbsql)
            if (!wireInfoResult.success) {
                return reject({ success: false, message: 'Update wireInfo failed', err: wireInfoResult.err })
            }
            dbsql.run(
                `UPDATE cable_info SET
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
                        return reject({ success: false, err, message: 'Update cableInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Update cableInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update cableInfo transaction failed' })
        }
    })
}

// Xóa cableInfo (transaction)
export const deleteCableInfoTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const wireInfoResult = await WireInfoFunc.deleteWireInfoTransaction(mrid, dbsql)
            if (!wireInfoResult.success) {
                return reject({ success: false, message: 'Delete wireInfo failed', err: wireInfoResult.err })
            }
            dbsql.run("DELETE FROM cable_info WHERE mrid=?", [mrid], function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Delete cableInfo failed' })
                }
                return resolve({ success: true, data: mrid, message: 'Delete cableInfo completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete cableInfo transaction failed' })
        }
    })
}