import db from '../../datacontext/index.js'

export const getAllNotifications = async () => {
    try {
        const sql = `SELECT * FROM notification ORDER BY mrid DESC`
        const notifications = await allAsync(sql)
        return { success: true, data: notifications, message: 'Notifications retrieved successfully' }
    } catch (error) {
        console.error('Error retrieving notifications:', error)
        return { success: false, error, message: 'Error retrieving notifications' }
    }
}

export const getNotificationById = async (mrid) => {
    try {
        const sql = `SELECT * FROM notification WHERE mrid = ?`
        const notification = await getAsync(sql, [mrid])
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
        const sql = `INSERT INTO notification (mrid, name, message, type, status) 
                     VALUES (?, ?, ?, ?, ?)`
        await runAsync(sql, [
            entity.mrid,
            entity.name,
            entity.message,
            entity.type,
            entity.status
        ])
        return { success: true, data: entity, message: 'Notification inserted successfully' }
    } catch (error) {
        console.error('Error inserting notification:', error)
        return { success: false, error, message: 'Error inserting notification' }
    }
}

export const updateNotification = async (mrid, entity) => {
    try {
        const sql = `UPDATE notification SET name = ?, message = ?, type = ?, status = ? WHERE mrid = ?`
        await runAsync(sql, [
            entity.name,
            entity.message,
            entity.type,
            entity.status,
            mrid
        ])
        return { success: true, data: entity, message: 'Notification updated successfully' }
    } catch (error) {
        console.error('Error updating notification:', error)
        return { success: false, error, message: 'Error updating notification' }
    }
}

export const markAsRead = async (mrid) => {
    try {
        const sql = `UPDATE notification SET status = 'read' WHERE mrid = ?`
        await runAsync(sql, [mrid])
        return { success: true, message: 'Notification marked as read' }
    } catch (error) {
        console.error('Error marking notification as read:', error)
        return { success: false, error, message: 'Error marking notification as read' }
    }
}

export const hideNotification = async (mrid) => {
    try {
        const sql = `UPDATE notification SET status = 'hidden' WHERE mrid = ?`
        await runAsync(sql, [mrid])
        return { success: true, message: 'Notification hidden successfully' }
    } catch (error) {
        console.error('Error hiding notification:', error)
        return { success: false, error, message: 'Error hiding notification' }
    }
}

export const deleteNotification = async (mrid) => {
    try {
        const sql = `DELETE FROM notification WHERE mrid = ?`
        await runAsync(sql, [mrid])
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
