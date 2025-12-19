import db from '../../datacontext/index'

// Lấy thông tin appSettings theo key
export const getAppSettingsByKey = async (key) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM app_settings WHERE key=?", [key], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get appSettings by key failed' })
            if (!row) return resolve({ success: false, data: null, message: 'AppSettings not found' })
            return resolve({ success: true, data: row, message: 'Get appSettings by key completed' })
        })
    })
}


// Transaction: Thêm mới appSettings
export const insertAppSettingsTransaction = (data, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO app_settings(
                key, value
            ) VALUES (?, ?)
            ON CONFLICT(key) DO UPDATE SET
                value = excluded.value
            `,
            [
                data.key,
                data.value
            ],
            function (err) {
                if (err) {
                    return reject({ success: false, err: err, message: 'Insert appSettings transaction failed' })
                }
                return resolve({ success: true, data: data, message: 'Insert appSettings transaction completed' })
            }
        )
    })
}

// Transaction: Cập nhật appSettings
export const updateAppSettingsTransaction = (data, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE app_settings SET
                value = ?
            WHERE key = ?`,
            [
                data.value,
                data.key
            ],
            function (err) {
                if (err) {
                    return reject({ success: false, err: err, message: 'Update appSettings transaction failed' })
                }
                return resolve({ success: true, data: data, message: 'Update appSettings transaction completed' })
            }
        )
    })
}

// Transaction: Xóa assetPsr
export const deleteAppSettingsPsrTransaction = (key, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM app_settings WHERE key=?", [key], function (err) {
            if (err) {
                return reject({ success: false, err: err, message: 'Delete appSettings transaction failed' })
            }
            return resolve({ success: true, data: key, message: 'Delete appSettings transaction completed' })
        })
    })
}