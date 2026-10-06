import {autoUpdater} from 'electron-updater'
import {win} from '@/background'

const UPDATE_PATH = '/api/app-updates/win/'

autoUpdater.autoDownload = false

const buildUpdateFeedUrl = (serviceDomain) => {
    if (typeof serviceDomain !== 'string' || !serviceDomain.trim()) {
        throw new Error('Service domain is not configured')
    }

    const serviceUrl = new URL(serviceDomain.trim())
    if (!['http:', 'https:'].includes(serviceUrl.protocol)) {
        throw new Error('Service domain must use HTTP or HTTPS')
    }

    const basePath = serviceUrl.pathname.replace(/\/+$/, '')
    serviceUrl.pathname = basePath.endsWith('/api')
        ? `${basePath}/app-updates/win/`
        : `${basePath}${UPDATE_PATH}`
    serviceUrl.search = ''
    serviceUrl.hash = ''
    return serviceUrl.toString()
}

autoUpdater.on('download-progress', (progressObj) => {
    if (win && !win.isDestroyed()) {
        win.webContents.send('download-progress', progressObj)
    }
})

autoUpdater.on('update-available', (info) => {
    if (win && !win.isDestroyed()) {
        win.webContents.send('update-available', info)
    }
})

autoUpdater.on('update-not-available', (info) => {
    if (win && !win.isDestroyed()) {
        win.webContents.send('update-not-available', info)
    }
})

autoUpdater.on('error', (err) => {
    console.error('[AutoUpdater] Error IN autoUpdater.on')
    if (win && !win.isDestroyed()) {
        win.webContents.send('update-error', err.message || String(err))
    }
})

export async function checkForStartupUpdate(serviceDomain) {
    autoUpdater.setFeedURL({
        provider: 'generic',
        url: buildUpdateFeedUrl(serviceDomain)
    })
    return await autoUpdater.checkForUpdates()
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

autoUpdater.on('update-downloaded', (info) => {
    if (win && !win.isDestroyed()) {
        win.webContents.send('update-downloaded', info)
    }

    autoUpdater.autoRunAppAfterInstall = true
    setTimeout(() => autoUpdater.quitAndInstall(false, true), 500)
})
