'use strict'
const {ipcRenderer} = require('electron')
export const updateEntityPreload = () => {
    return {
        checkForStartupUpdate: (serviceDomain) => ipcRenderer.invoke('checkForStartupUpdate', serviceDomain),
        downloadUpdate: () => ipcRenderer.invoke('downloadUpdate'),
        onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (_event, data) => callback(data)),
        onUpdateNotAvailable: (callback) => ipcRenderer.on('update-not-available', (_event, data) => callback(data)),
        onUpdateError: (callback) => ipcRenderer.on('update-error', (_event, data) => callback(data)),
        onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (_event, data) => callback(data)),
        onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', (_event, data) => callback(data))
    }
}
