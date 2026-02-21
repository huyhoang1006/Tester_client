import db from '../../datacontext/index.js'

export const getAllNotifications = async () => {
    try {
        const sql = `SELECT * FROM notification ORDER BY created_at DESC`
        const notifications = await allAsync(sql)
        return { success: true, data: notifications, message: 'Notifications retrieved successfully' }
    } catch (error) {
        console.error('Error retrieving notifications:', error)
        return { success: false, error, message: 'Error retrieving notifications' }
    }
}

export const getNotificationById = async (id) => {
    try {
        const sql = `SELECT * FROM notification WHERE id = ?`
        const notification = await getAsync(sql, [id])
        if (notification) {
            return { success: true, data: notification, message: 'Notification retrieved successfully' }
        } else {
            return { success: false, message: 'Notification not found' }
        }
    } catch (error) {
        console.error('Error retrieving notification:', error)
        return { success: false, error, message: 'Error retrieving notification' }
    }
}

export const insertNotification = async (entity) => {
    try {
        const sql = `INSERT INTO notification (message, time, read, icon, hidden, created_at) 
                     VALUES (?, ?, ?, ?, ?, datetime('now'))`
        await runAsync(sql, [
            entity.message,
            entity.time,
            entity.read || 0,
            entity.icon,
            entity.hidden || 0
        ])
        return { success: true, data: entity, message: 'Notification inserted successfully' }
    } catch (error) {
        console.error('Error inserting notification:', error)
        return { success: false, error, message: 'Error inserting notification' }
    }
}

export const updateNotification = async (id, entity) => {
    try {
        const sql = `UPDATE notification SET message = ?, time = ?, read = ?, icon = ?, hidden = ? WHERE id = ?`
        await runAsync(sql, [
            entity.message,
            entity.time,
            entity.read,
            entity.icon,
            entity.hidden,
            id
        ])
        return { success: true, data: entity, message: 'Notification updated successfully' }
    } catch (error) {
        console.error('Error updating notification:', error)
        return { success: false, error, message: 'Error updating notification' }
    }
}

export const markAsRead = async (id) => {
    try {
        const sql = `UPDATE notification SET read = 1 WHERE id = ?`
        await runAsync(sql, [id])
        return { success: true, message: 'Notification marked as read' }
    } catch (error) {
        console.error('Error marking notification as read:', error)
        return { success: false, error, message: 'Error marking notification as read' }
    }
}

export const hideNotification = async (id) => {
    try {
        const sql = `UPDATE notification SET hidden = 1 WHERE id = ?`
        await runAsync(sql, [id])
        return { success: true, message: 'Notification hidden successfully' }
    } catch (error) {
        console.error('Error hiding notification:', error)
        return { success: false, error, message: 'Error hiding notification' }
    }
}

export const deleteNotification = async (id) => {
    try {
        const sql = `DELETE FROM notification WHERE id = ?`
        await runAsync(sql, [id])
        return { success: true, message: 'Notification deleted successfully' }
    } catch (error) {
        console.error('Error deleting notification:', error)
        return { success: false, error, message: 'Error deleting notification' }
    }
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
