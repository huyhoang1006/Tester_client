import db from '../../datacontext/index'
import * as CableInfoFunc from '../cableInfo/index.js'

// Lấy concentricNeutralCableInfo theo mrid
export const getConcentricNeutralCableInfoById = async (mrid) => {
    try {
        const cableInfoResult = await CableInfoFunc.getCableInfoById(mrid)
        if (!cableInfoResult.success) {
            return { success: false, data: null, message: 'CableInfo not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM concentric_neutral_cable_info WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get concentricNeutralCableInfo by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'ConcentricNeutralCableInfo not found' })
                    return resolve({ success: true, data: { ...cableInfoResult.data, ...row }, message: 'Get concentricNeutralCableInfo by id completed' })
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
            const cableInfoResult = await CableInfoFunc.insertCableInfoTransaction(info, dbsql)
            if (!cableInfoResult.success) {
                return reject({ success: false, message: 'Insert cableInfo failed', err: cableInfoResult.err })
            }
            dbsql.run(
                `INSERT INTO concentric_neutral_cable_info(
                    mrid, diameter_over_neutral, neutral_strand_count, neutral_strand_gmr, neutral_strand_radius, neutral_strand_rdc
                ) VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    diameter_over_neutral = excluded.diameter_over_neutral,
                    neutral_strand_count = excluded.neutral_strand_count,
                    neutral_strand_gmr = excluded.neutral_strand_gmr,
                    neutral_strand_radius = excluded.neutral_strand_radius,
                    neutral_strand_rdc = excluded.neutral_strand_rdc
                `,
                [
                    info.mrid,
                    info.diameter_over_neutral,
                    info.neutral_strand_count,
                    info.neutral_strand_gmr,
                    info.neutral_strand_radius,
                    info.neutral_strand_rdc
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
            const cableInfoResult = await CableInfoFunc.updateCableInfoTransaction(mrid, info, dbsql)
            if (!cableInfoResult.success) {
                return reject({ success: false, message: 'Update cableInfo failed', err: cableInfoResult.err })
            }
            dbsql.run(
                `UPDATE concentric_neutral_cable_info SET
                    diameter_over_neutral = ?,
                    neutral_strand_count = ?,
                    neutral_strand_gmr = ?,
                    neutral_strand_radius = ?,
                    neutral_strand_rdc = ?
                WHERE mrid = ?`,
                [
                    info.diameter_over_neutral,
                    info.neutral_strand_count,
                    info.neutral_strand_gmr,
                    info.neutral_strand_radius,
                    info.neutral_strand_rdc,
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
            const cableInfoResult = await CableInfoFunc.deleteCableInfoTransaction(mrid, dbsql)
            if (!cableInfoResult.success) {
                return reject({ success: false, message: 'Delete cableInfo failed', err: cableInfoResult.err })
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