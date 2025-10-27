import db from '../../datacontext/index'

// Lấy dissipationFactorInfo theo mrid
export const getDissipationFactorCapacitorInfoById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM dissipation_factor_capacitor_info WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err, message: 'Get dissipationFactorCapacitorInfo by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'DissipationFactorCapacitorInfo not found' })
            return resolve({ success: true, data: row, message: 'Get dissipationFactorCapacitorInfo by id completed' })
        })
    })
}

// Lấy dissipationFactorInfo theo nhiều capacitor_info_id
export const getDissipationFactorCapacitorInfoByIds = async (capacitorInfoIds) => {
    return new Promise((resolve, reject) => {
        if (!capacitorInfoIds || capacitorInfoIds.length === 0) {
            return resolve({ success: false, data: [], message: 'No capacitor_info_ids provided' })
        }

        // Tạo chuỗi placeholder (?, ?, ?) tùy theo số lượng capacitor_info_id
        const placeholders = capacitorInfoIds.map(() => '?').join(',')

        db.all(
            `SELECT * FROM dissipation_factor_capacitor_info WHERE capacitor_info_id IN (${placeholders})`,
            capacitorInfoIds,
            (err, rows) => {
                if (err) {
                    return reject({ success: false, err: err, message: 'Get dissipationFactorCapacitorInfo by ids failed' })
                }
                if (!rows || rows.length === 0) {
                    return resolve({ success: false, data: [], message: 'DissipationFactorCapacitorInfo not found' })
                }
                return resolve({ success: true, data: rows, message: 'Get dissipationFactorCapacitorInfo by ids completed' })
            }
        )
    })
}

// Thêm mới dissipationFactorInfo (transaction)
export const insertDissipationFactorCapacitorInfoTransaction = async (dissipationFactorCapacitorInfo, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO dissipation_factor_capacitor_info(mrid, phase, value, capacitor_info_id)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                phase = excluded.phase,
                value = excluded.value,
                capacitor_info_id = excluded.capacitor_info_id`,
            [
                dissipationFactorCapacitorInfo.mrid,
                dissipationFactorCapacitorInfo.phase,
                dissipationFactorCapacitorInfo.value,
                dissipationFactorCapacitorInfo.capacitor_info_id
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert dissipationFactorCapacitorInfo failed' })
                return resolve({ success: true, data: dissipationFactorCapacitorInfo, message: 'Insert dissipationFactorCapacitorInfo completed' })
            }
        )
    })
}

// Cập nhật dissipationFactorInfo (transaction)
export const updateDissipationFactorCapacitorInfoTransaction = async (mrid, dissipationFactorCapacitorInfo, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE dissipation_factor_capacitor_info SET
                phase = ?,
                value = ?,
                capacitor_info_id = ?
             WHERE mrid = ?`,
            [
                dissipationFactorCapacitorInfo.phase,
                dissipationFactorCapacitorInfo.value,
                dissipationFactorCapacitorInfo.capacitor_info_id,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update dissipationFactorCapacitorInfo failed' })
                return resolve({ success: true, data: dissipationFactorCapacitorInfo, message: 'Update dissipationFactorCapacitorInfo completed' })
            }
        )
    })
}

// Xóa dissipationFactorInfo (transaction)
export const deleteDissipationFactorCapacitorInfoTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM dissipation_factor_capacitor_info WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete dissipationFactorCapacitorInfo failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'DissipationFactorCapacitorInfo not found' })
            return resolve({ success: true, data: null, message: 'Delete dissipationFactorCapacitorInfo completed' })
        })
    })
}

// Xóa dissipationFactorInfo theo ID
export const deleteDissipationFactorCapacitorInfoById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM dissipation_factor_capacitor_info WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete dissipationFactorCapacitorInfo failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'DissipationFactorCapacitorInfo not found' })
            return resolve({ success: true, data: null, message: 'Delete dissipationFactorCapacitorInfo completed' })
        })
    })
}
