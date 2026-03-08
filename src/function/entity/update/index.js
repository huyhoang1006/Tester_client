import {autoUpdater} from 'electron-updater'
import {win} from '@/background'
import {entityFunc} from '@/function'

// Forward logs to renderer for debugging
autoUpdater.logger = {
    info: (...args) => {
        console.log('[AutoUpdater]', ...args)
        sendToRenderer('[AutoUpdater]', ...args)
    },
    warn: (...args) => {
        console.warn('[AutoUpdater]', ...args)
        sendToRenderer('[AutoUpdater]', ...args)
    },
    error: (...args) => {
        console.error('[AutoUpdater]', ...args)
        sendToRenderer('[AutoUpdater]', ...args)
    }
}

function sendToRenderer(...args) {
    if (win && !win.isDestroyed()) {
        win.webContents.send('auto-updater-log', args.join(' '))
    }
}
autoUpdater.forceDevUpdateConfig = true

// Set token trực tiếp trên autoUpdater
autoUpdater.autoDownload = false

autoUpdater.setFeedURL({
    provider: "generic",
    url: "https://disparately-nonrationalistic-hope.ngrok-free.dev"
})

autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')'
    console.log('[AutoUpdater]', log_message)
    if (win && !win.isDestroyed()) {
        win.webContents.send('download-progress', progressObj)
    }
})

console.log('[AutoUpdater] Feed URL set, testing connection...')

autoUpdater.on('update-available', async (info) => {
    console.log('[AutoUpdater] Update available:', info)

    // Gọi hàm tạo notification riêng
    await createUpdateNotificationInDB(info)

    if (win && !win.isDestroyed()) {
        win.webContents.send('update-available', info)
    }
})

// Hàm riêng để tạo notification
async function createUpdateNotificationInDB(info) {
    try {
        console.log('[AutoUpdater] Creating notification for version:', info.version)

        const { v4: uuid } = await import('uuid')
        const notificationId = uuid()

        const notification = {
            mrid: notificationId,
            name: 'Update Available',
            message: `Version ${info.version} is ready to install.`,
            type: 'info',
            status: 'unread',
            created_at: new Date().toISOString()
        }

        console.log('[AutoUpdater] Notification data:', notification)

        const result = await entityFunc.notificationEntityFunc.insertNotification(notification)
        console.log('[AutoUpdater] Insert result:', result)

        if (result.success) {
            console.log('[AutoUpdater] ✅ Notification created:', notificationId)
        } else if (result.duplicate) {
            console.log('[AutoUpdater] ⏭️ Notification already exists')
        } else {
            console.log('[AutoUpdater] ❌ Failed:', result.message)
        }
    } catch (err) {
        console.error('[AutoUpdater] ❌ Error creating notification:', err)
    }
}

autoUpdater.on('update-not-available', (info) => {
    console.log('[AutoUpdater] Update not available:', info)
    if (win && !win.isDestroyed()) {
        win.webContents.send('update-not-available', info)
    }
})

autoUpdater.on('error', (err) => {
    console.error('[AutoUpdater] Error:', err)
    if (win && !win.isDestroyed()) {
        win.webContents.send('update-error', err)
    }
})

export async function checkForUpdates() {
    // Gọi setFeedURL trước mỗi lần check update
    return await autoUpdater.checkForUpdates()
}

// Auto check for updates on startup (with delay to wait for window ready)
export const autoCheckForUpdates = () => {
    setTimeout(async () => {
        console.log('[AutoUpdater] Auto checking for updates on startup...')
        try {
            await autoUpdater.checkForUpdates()
        } catch (err) {
            console.error('[AutoUpdater] Auto check failed:', err)
        }
    }, 5000) // Wait 5 seconds for app to fully load
}

export async function downloadUpdate() {
    console.log('[AutoUpdater] Starting download update...')
    try {
        const result = await autoUpdater.downloadUpdate()
        console.log('[AutoUpdater] Download initiated:', result)
        return result
    } catch (error) {
        console.error('[Update] Download failed:', error)
        throw error
    }
}

// Event when update is downloaded and ready to install
autoUpdater.on('update-downloaded', (info) => {
    console.log('[AutoUpdater] Update downloaded, ready to install:', info)
    if (win && !win.isDestroyed()) {
        win.webContents.send('update-downloaded', info)
    }

    // Auto install after download
    console.log('[AutoUpdater] Installing update and restarting...')
    autoUpdater.autoRunAppAfterInstall = true
    autoUpdater.quitAndInstall(false, true)
})