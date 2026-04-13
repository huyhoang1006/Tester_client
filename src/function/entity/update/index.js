import {autoUpdater} from 'electron-updater'
import {win} from '@/background'
import {entityFunc} from '@/function'

// Forward logs to renderer for debugging
autoUpdater.logger = {
    info: (...args) => {
        sendToRenderer('[AutoUpdater]', ...args)
    },
    warn: (...args) => {
        sendToRenderer('[AutoUpdater]', ...args)
    },
    error: (...args) => {
        sendToRenderer('[AutoUpdater]', ...args)
    }
}

// function sendToRenderer(...args) {
//     if (win && !win.isDestroyed()) {
//         win.webContents.send('auto-updater-log', args.join(' '))
//     }
// }
autoUpdater.forceDevUpdateConfig = true

// Set token trực tiếp trên autoUpdater
autoUpdater.autoDownload = false

autoUpdater.setFeedURL({
    provider: "generic",
    url: "http://103.163.118.212:30151/tester-ied/tester/Tester_client/"
})

autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')'
    if (win && !win.isDestroyed()) {
        win.webContents.send('download-progress', progressObj)
    }
})

console.log('[AutoUpdater] Feed URL set, testing connection...')

autoUpdater.on('update-available', async (info) => {

    // Gọi hàm tạo notification riêng
    await createUpdateNotificationInDB(info)

    if (win && !win.isDestroyed()) {
        win.webContents.send('update-available', info)
    }
})

// Hàm riêng để tạo notification
async function createUpdateNotificationInDB(info) {
    try {

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


        const result = await entityFunc.notificationEntityFunc.insertNotification(notification)
        console.log('[AutoUpdater] Insert result:', result)

        if (result.success) {
        } else if (result.duplicate) {
        } else {
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
    console.error('[AutoUpdater] Error IN autoUpdater.on')
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
        try {
            await autoUpdater.checkForUpdates()
        } catch (err) {
            console.error('[AutoUpdater] Auto check failed')
        }
    }, 5000) // Wait 5 seconds for app to fully load
}

export async function downloadUpdate() {
    try {
        const result = await autoUpdater.downloadUpdate()
        return result
    } catch (error) {
        console.error('[Update] Download failed:', error)
        throw error
    }
}

// Event when update is downloaded and ready to install
autoUpdater.on('update-downloaded', (info) => {
    if (win && !win.isDestroyed()) {
        win.webContents.send('update-downloaded', info)
    }

    autoUpdater.autoRunAppAfterInstall = true
    autoUpdater.quitAndInstall(false, true)
})