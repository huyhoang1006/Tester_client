import db from '../../datacontext/index'

// Lấy capacitanceInfo theo mrid
export const getCapacitanceCapacitorInfoById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM capacitance_capacitor_info WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err, message: 'Get capacitanceCapacitorInfo by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'CapacitanceCapacitorInfo not found' })
            return resolve({ success: true, data: row, message: 'Get capacitanceCapacitorInfo by id completed' })
        })
    })
}

// Lấy capacitanceInfo theo nhiều capacitor_info_id
export const getCapacitanceCapacitorInfoByIds = async (capacitorInfoIds) => {
    return new Promise((resolve, reject) => {
        if (!capacitorInfoIds || capacitorInfoIds.length === 0) {
            return resolve({ success: false, data: [], message: 'No capacitor_info_ids provided' })
        }

        // Tạo chuỗi placeholder (?, ?, ?) tùy theo số lượng capacitor_info_id
        const placeholders = capacitorInfoIds.map(() => '?').join(',')

        db.all(
            `SELECT * FROM capacitance_capacitor_info WHERE capacitor_info_id IN (${placeholders})`,
            capacitorInfoIds,
            (err, rows) => {
                if (err) {
                    return reject({ success: false, err: err, message: 'Get capacitanceCapacitorInfo by ids failed' })
                }
                if (!rows || rows.length === 0) {
                    return resolve({ success: false, data: [], message: 'CapacitanceCapacitorInfo not found' })
                }
                return resolve({ success: true, data: rows, message: 'Get capacitanceCapacitorInfo by ids completed' })
            }
        )
    })
}

export const insertCapacitanceCapacitorInfoTransaction = async (capacitanceCapacitorInfo, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO capacitance_capacitor_info (mrid, phase, value, capacitor_info_id)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                 phase = excluded.phase,
                 value = excluded.value,
                 capacitor_info_id = excluded.capacitor_info_id;`,
            [
                capacitanceCapacitorInfo.mrid,
                capacitanceCapacitorInfo.phase,
                capacitanceCapacitorInfo.value,
                capacitanceCapacitorInfo.capacitor_info_id
            ],
            function (err) {
                if (err) {
                    return reject({
                        success: false,
                        err,
                        message: 'Insert capacitanceCapacitorInfo failed'
                    });
                }
                return resolve({
                    success: true,
                    data: capacitanceCapacitorInfo,
                    message: 'Insert capacitanceCapacitorInfo completed'
                });
            }
        );
    });
};



// Cập nhật capacitanceInfo (transaction)
export const updateCapacitanceCapacitorInfoTransaction = async (mrid, capacitanceCapacitorInfo, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE capacitance_capacitor_info SET
                phase = ?,
                value = ?,
                capacitor_info_id = ?
             WHERE mrid = ?`,
            [
                capacitanceCapacitorInfo.phase,
                capacitanceCapacitorInfo.value,
                capacitanceCapacitorInfo.capacitor_info_id,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update capacitanceCapacitorInfo failed' })
                return resolve({ success: true, data: capacitanceCapacitorInfo, message: 'Update capacitanceCapacitorInfo completed' })
            }
        )
    })
}

// Xóa capacitanceInfo (transaction)
export const deleteCapacitanceInfoTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM capacitance_capacitor_info WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete capacitanceCapacitorInfo failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'CapacitanceCapacitorInfo not found' })
            return resolve({ success: true, data: null, message: 'Delete capacitanceCapacitorInfo completed' })
        })
    })
}

// Xóa capacitanceInfo theo ID
export const deleteCapacitanceCapacitorInfoById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM capacitance_capacitor_info WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete capacitance capacitor info failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Capacitance Capacitor Info not found' })
            return resolve({ success: true, data: null, message: 'Delete capacitance capacitor info completed' })
        })
    })
}
