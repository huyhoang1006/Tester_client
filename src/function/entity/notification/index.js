import db from '../../datacontext/index.js'

export const getAllNotifications = async () => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM notification ORDER BY mrid DESC`, [], (err, rows) => {
            if (err) reject(err)
            else resolve({ success: true, data: rows, message: 'Notifications retrieved successfully' })
        })
    })
}

export const getNotificationById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM notification WHERE mrid = ?`, [mrid], (err, row) => {
            if (err) reject(err)
            else if (row) resolve({ success: true, data: row, message: 'Notification retrieved successfully' })
            else resolve({ success: false, message: 'Notification not found' })
        })
    })
}

export const insertNotification = async (entity) => {
    const createdAt = entity.created_at || new Date().toISOString()
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO notification (mrid, name, message, type, status, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
            [entity.mrid, entity.name, entity.message, entity.type, entity.status || 'unread', createdAt],
            function (err) {
                if (err) reject(err)
                else resolve({ success: true, data: { ...entity, created_at: createdAt }, message: 'Notification inserted successfully' })
            }
        )
    })
}

export const updateNotification = async (mrid, entity) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE notification SET name = ?, message = ?, type = ?, status = ? WHERE mrid = ?`,
            [entity.name, entity.message, entity.type, entity.status, mrid],
            function (err) {
                if (err) reject(err)
                else resolve({ success: true, data: entity, message: 'Notification updated successfully' })
            }
        )
    })
}

export const markAsRead = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE notification SET status = ? WHERE mrid = ?`, ['read', mrid], function (err) {
            if (err) reject(err)
            else resolve({ success: true, message: 'Notification marked as read' })
        })
    })
}

export const hideNotification = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE notification SET status = ? WHERE mrid = ?`, ['hidden', mrid], function (err) {
            if (err) reject(err)
            else resolve({ success: true, message: 'Notification hidden successfully' })
        })
    })
}

export const deleteNotification = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM notification WHERE mrid = ?`, [mrid], function (err) {
            if (err) reject(err)
            else resolve({ success: true, message: 'Notification deleted successfully' })
        })
    })
}

const runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err)
            else resolve()
        })
    })
}

const getAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err)
            else resolve(row)
        })
    })
}

const allAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err)
            else resolve(rows)
        })
    })
}
