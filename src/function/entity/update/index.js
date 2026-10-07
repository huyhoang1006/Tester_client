import {autoUpdater} from 'electron-updater'
import {app, BrowserWindow} from 'electron'
import semver from 'semver'
import * as notificationEntityFunc from '@/function/entity/notification'

const UPDATE_PATH = '/api/app-updates/win/'
const VERSION_PATTERN = /\bVersion\s+v?([0-9]+(?:\.[0-9]+){1,3}(?:-[0-9A-Za-z.-]+)?)/i

autoUpdater.autoDownload = false

let checkPromise = null
let lastAvailableVersion = ''
let notificationSavePromise = Promise.resolve()

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

const normalizeVersion = (value) => {
    const rawVersion = String(value || '').trim().replace(/^v/i, '')
    if (!rawVersion) return null
    const coercedVersion = semver.coerce(rawVersion)
    return semver.valid(rawVersion) || (coercedVersion && coercedVersion.version)
}

const extractNotificationVersion = (notification) => {
    const match = String(notification && notification.message || '').match(VERSION_PATTERN)
    return match ? normalizeVersion(match[1]) : null
}

const sendToRenderer = (channel, data) => {
    BrowserWindow.getAllWindows()
        .filter((browserWindow) => !browserWindow.isDestroyed())
        .forEach((browserWindow) => browserWindow.webContents.send(channel, data))
}

const saveUpdateNotification = (info) => {
    const version = normalizeVersion(info && info.version)
    if (!version) return Promise.resolve(null)

    return notificationEntityFunc.upsertUpdateNotification(version)
        .then((result) => {
            sendToRenderer('update-notification-created', result.data)
            return result.data
        })
        .catch((error) => {
            console.error('[AutoUpdater] Failed to save update notification:', error)
            return null
        })
}

const getPendingUpdateNotification = async () => {
    const currentVersion = normalizeVersion(app.getVersion())
    const notifications = await notificationEntityFunc.getPendingUpdateNotifications()
    let newestPending = null

    for (const notification of notifications) {
        const version = extractNotificationVersion(notification)
        if (!version) continue

        if (currentVersion && semver.lte(version, currentVersion)) {
            await notificationEntityFunc.markUpdateNotificationProcessed(notification.mrid)
            continue
        }

        if (!newestPending || semver.gt(version, newestPending.version)) {
            newestPending = {...notification, version}
        }
    }

    return newestPending
}

const performUpdateCheck = async (serviceDomain) => {
    if (checkPromise) return checkPromise

    checkPromise = (async () => {
        autoUpdater.setFeedURL({
            provider: 'generic',
            url: buildUpdateFeedUrl(serviceDomain)
        })
        lastAvailableVersion = ''
        notificationSavePromise = Promise.resolve()
        await autoUpdater.checkForUpdates()
        await notificationSavePromise
        return {
            updateAvailable: Boolean(lastAvailableVersion),
            version: lastAvailableVersion
        }
    })()

    try {
        return await checkPromise
    } finally {
        checkPromise = null
    }
}

autoUpdater.on('download-progress', (progressObj) => {
    sendToRenderer('download-progress', progressObj)
})

autoUpdater.on('update-available', (info) => {
    lastAvailableVersion = normalizeVersion(info && info.version) || ''
    notificationSavePromise = saveUpdateNotification(info)
    sendToRenderer('update-available', info)
})

autoUpdater.on('update-not-available', (info) => {
    lastAvailableVersion = ''
    sendToRenderer('update-not-available', info)
})

autoUpdater.on('error', (err) => {
    console.error('[AutoUpdater] Error IN autoUpdater.on')
    sendToRenderer('update-error', err.message || String(err))
})

export async function checkForStartupUpdate(serviceDomain) {
    const pendingNotification = await getPendingUpdateNotification()
    if (pendingNotification) {
        return {
            mandatory: true,
            checked: false,
            notification: pendingNotification,
            version: pendingNotification.version
        }
    }

    if (!serviceDomain) {
        return {mandatory: false, checked: false, offline: true}
    }

    try {
        const result = await performUpdateCheck(serviceDomain)
        return {mandatory: false, checked: true, ...result}
    } catch (error) {
        console.warn('[AutoUpdater] Startup check skipped while offline:', error.message || error)
        return {
            mandatory: false,
            checked: false,
            offline: true,
            message: error.message || String(error)
        }
    }
}

export async function checkForBackgroundUpdate(serviceDomain) {
    if (await getPendingUpdateNotification()) {
        return {checked: false, skipped: true, reason: 'pending-update'}
    }
    if (!serviceDomain) return {checked: false, skipped: true, reason: 'service-domain-missing'}

    try {
        return {checked: true, ...(await performUpdateCheck(serviceDomain))}
    } catch (error) {
        console.warn('[AutoUpdater] Background check skipped while offline:', error.message || error)
        return {checked: false, offline: true, message: error.message || String(error)}
    }
}

export async function downloadUpdate(serviceDomain) {
    try {
        await performUpdateCheck(serviceDomain)
        if (!lastAvailableVersion) {
            throw new Error('The update is no longer available')
        }
        const result = await autoUpdater.downloadUpdate()
        return result
    } catch (error) {
        console.error('[Update] Download failed:', error)
        throw error
    }
}

autoUpdater.on('update-downloaded', (info) => {
    sendToRenderer('update-downloaded', info)

    autoUpdater.autoRunAppAfterInstall = true
    setTimeout(() => autoUpdater.quitAndInstall(false, true), 500)
})
