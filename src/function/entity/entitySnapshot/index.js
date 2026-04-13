import db from '../../datacontext/index'

export const getSnapshot = async (mrid, type) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM entity_snapshot WHERE mrid = ? AND type = ?`,
            [mrid, type],
            (err, row) => {
                if (err) return reject({ success: false, error: err })
                if (!row) return resolve({ success: false, data: null })
                try {
                    resolve({ success: true, data: JSON.parse(row.snapshot) })
                } catch (e) {
                    resolve({ success: false, error: e, data: null })
                }
            }
        )
    })
}

// Dùng trong transaction — nhận db instance từ ngoài
export const saveSnapshotTransaction = async (mrid, type, snapshotDto, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT OR REPLACE INTO entity_snapshot (mrid, type, snapshot, updated_at)
             VALUES (?, ?, ?, ?)`,
            [mrid, type, JSON.stringify(snapshotDto), new Date().toISOString()],
            (err) => {
                if (err) reject(err)
                else resolve()
            }
        )
    })
}
 
// Dùng độc lập
export const saveSnapshot = async (mrid, type, snapshotDto) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT OR REPLACE INTO entity_snapshot (mrid, type, snapshot, updated_at)
             VALUES (?, ?, ?, ?)`,
            [mrid, type, JSON.stringify(snapshotDto), new Date().toISOString()],
            (err) => {
                if (err) reject({ success: false, error: err })
                else resolve({ success: true })
            }
        )
    })
}

// Dùng trong transaction khi xóa entity
export const deleteSnapshotTransaction = async (mrid, type, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `DELETE FROM entity_snapshot WHERE mrid = ? AND type = ?`,
            [mrid, type],
            (err) => {
                if (err) reject(err)
                else resolve()
            }
        )
    })
}

// Dùng độc lập
export const deleteSnapshot = async (mrid, type) => {
    return new Promise((resolve, reject) => {
        db.run(
            `DELETE FROM entity_snapshot WHERE mrid = ? AND type = ?`,
            [mrid, type],
            (err) => {
                if (err) reject({ success: false, error: err })
                else resolve({ success: true })
            }
        )
    })
}