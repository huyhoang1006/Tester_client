import db from '../../datacontext/index.js'

const UPDATE_NOTIFICATION_TYPE = 'update'
const PROCESSED_STATUS = 'processed'

export const getAllNotifications = async () => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM notification
             WHERE NOT (COALESCE(type, '') = ? AND COALESCE(status, '') = ?)
             ORDER BY created_at DESC, mrid DESC`,
            [UPDATE_NOTIFICATION_TYPE, PROCESSED_STATUS],
            (err, rows) => {
                if (err) reject(err)
                else resolve({success: true, data: rows, message: 'Notifications retrieved successfully'})
            }
        )
    })
}

export const getNotificationById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM notification WHERE mrid = ?`, [mrid], (err, row) => {
            if (err) reject(err)

                // `db.get` tra undefined khi khong co dong. Tra success:true kem data
                // undefined la noi doi voi cho goi: ho kiem `success` roi dung `.data`
                // ngay, va nhan TypeError. Khong co dong thi phai la success:false.
            if (!row) return resolve({ success: false, data: null, message: 'Not found' })
            else if (row) resolve({ success: true, data: row, message: 'Notification retrieved successfully' })
            else resolve({ success: false, message: 'Notification not found' })
        })
    })
}

export const insertNotification = async (entity) => {
    // Check for duplicate update notification by version in message
    const versionMatch = entity.message && entity.message.match(/Version\s+(\S+)/)
    if (versionMatch) {
        const version = versionMatch[1]
        const existing = await checkUpdateNotificationExists(version)
        if (existing) {
            return { success: false, data: existing, message: 'Update notification already exists', duplicate: true }
        }
    }

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

export const upsertUpdateNotification = async (version) => {
    const normalizedVersion = String(version || '').trim().replace(/^v/i, '')
    if (!normalizedVersion) throw new Error('Update version is required')

    const notification = {
        mrid: `app-update-${normalizedVersion.replace(/[^0-9A-Za-z._-]/g, '-')}`,
        name: 'Application update available',
        message: `Version ${normalizedVersion} is available. Restart the application to install this update.`,
        type: UPDATE_NOTIFICATION_TYPE,
        status: 'unread',
        created_at: new Date().toISOString()
    }

    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO notification (mrid, name, message, type, status, created_at)
             VALUES (?, ?, ?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                name = excluded.name,
                message = excluded.message,
                type = excluded.type`,
            [
                notification.mrid,
                notification.name,
                notification.message,
                notification.type,
                notification.status,
                notification.created_at
            ],
            function (err) {
                if (err) reject(err)
                else resolve({success: true, data: notification, message: 'Update notification saved'})
            }
        )
    })
}

export const getPendingUpdateNotifications = async () => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM notification
             WHERE type = ? AND COALESCE(status, '') <> ?
             ORDER BY created_at DESC, mrid DESC`,
            [UPDATE_NOTIFICATION_TYPE, PROCESSED_STATUS],
            (err, rows) => {
                if (err) reject(err)
                else resolve(rows || [])
            }
        )
    })
}

export const markUpdateNotificationProcessed = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE notification SET status = ? WHERE mrid = ? AND type = ?`,
            [PROCESSED_STATUS, mrid, UPDATE_NOTIFICATION_TYPE],
            function (err) {
                if (err) reject(err)
                else resolve({success: true, changed: this.changes})
            }
        )
    })
}

// Check if update notification for this version already exists
export const checkUpdateNotificationExists = async (version) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM notification
             WHERE type = ? AND COALESCE(status, '') <> ? AND message LIKE ?`,
            [UPDATE_NOTIFICATION_TYPE, PROCESSED_STATUS, `%${version}%`],
            (err, row) => {
                if (err) reject(err)
                else resolve(row || null)
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
        db.run(
            `UPDATE notification SET status = ?
             WHERE mrid = ? AND NOT (COALESCE(type, '') = ? AND COALESCE(status, '') <> ?)`,
            ['hidden', mrid, UPDATE_NOTIFICATION_TYPE, PROCESSED_STATUS],
            function (err) {
            if (err) reject(err)
                else resolve({success: this.changes > 0, changed: this.changes, message: this.changes > 0
                    ? 'Notification hidden successfully'
                    : 'Pending update notifications cannot be hidden'})
            }
        )
    })
}

export const deleteNotification = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run(
            `DELETE FROM notification
             WHERE mrid = ? AND NOT (COALESCE(type, '') = ? AND COALESCE(status, '') <> ?)`,
            [mrid, UPDATE_NOTIFICATION_TYPE, PROCESSED_STATUS],
            function (err) {
            if (err) reject(err)
                else resolve({success: this.changes > 0, changed: this.changes, message: this.changes > 0
                    ? 'Notification deleted successfully'
                    : 'Pending update notifications cannot be deleted'})
            }
        )
    })
}

export const deleteAllNotifications = async () => {
    return new Promise((resolve, reject) => {
        db.run(
            `DELETE FROM notification
             WHERE NOT (COALESCE(type, '') = ? AND COALESCE(status, '') <> ?)`,
            [UPDATE_NOTIFICATION_TYPE, PROCESSED_STATUS],
            function (err) {
            if (err) reject(err)
                else resolve({success: true, changed: this.changes, message: 'Notifications deleted successfully'})
            }
        )
    })
}
