import {autoUpdater} from 'electron-updater'
import {win} from '@/background'

autoUpdater.logger = console
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

autoUpdater.on('update-available', (info) => {
    console.log('[AutoUpdater] Update available:', info)
    if (win && !win.isDestroyed()) {
        win.webContents.send('update-available', info)
    }
})

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

autoUpdater.on('update-downloaded', (info) => {
    console.log('[AutoUpdater] Update downloaded:', info)
    if (win && !win.isDestroyed()) {
        win.webContents.send('update-downloaded', info)
    }
})

export async function checkForUpdates() {
    // Gọi setFeedURL trước mỗi lần check update
    return await autoUpdater.checkForUpdates()
}

export async function downloadUpdate() {
    try {
        return await autoUpdater.downloadUpdate()
    } catch (error) {
        console.error('[Update] Update failed:', error)
        throw error
    }
}

autoUpdater.on('update-downloaded', (info) => {
    if (win && !win.isDestroyed()) {
        win.webContents.send('update-downloaded', info)
    }

    autoUpdater.autoRunAppAfterInstall = true
    autoUpdater.quitAndInstall(false, true)
})