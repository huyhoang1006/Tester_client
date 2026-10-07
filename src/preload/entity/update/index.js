'use strict'
const {ipcRenderer} = require('electron')
export const updateEntityPreload = () => {
    return {
        checkForStartupUpdate: (serviceDomain) => ipcRenderer.invoke('checkForStartupUpdate', serviceDomain),
        checkForBackgroundUpdate: (serviceDomain) => ipcRenderer.invoke('checkForBackgroundUpdate', serviceDomain),
        downloadUpdate: (serviceDomain) => ipcRenderer.invoke('downloadUpdate', serviceDomain),
        onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (_event, data) => callback(data)),
        onUpdateNotAvailable: (callback) => ipcRenderer.on('update-not-available', (_event, data) => callback(data)),
        onUpdateError: (callback) => ipcRenderer.on('update-error', (_event, data) => callback(data)),
        onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (_event, data) => callback(data)),
        onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', (_event, data) => callback(data)),
        onUpdateNotificationCreated: (callback) => {
            const listener = (_event, data) => callback(data)
            ipcRenderer.on('update-notification-created', listener)
            return () => ipcRenderer.removeListener('update-notification-created', listener)
        }
    }
}
