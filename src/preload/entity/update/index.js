'use strict'
const {ipcRenderer} = require('electron')
export const updateEntityPreload = () => {
    return {
        checkForUpdate: () => ipcRenderer.invoke('checkForUpdate'),
        downloadUpdate: () => ipcRenderer.invoke('downloadUpdate'),
        installUpdate: () => ipcRenderer.invoke('installUpdate'),
        onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (_event, data) => callback(data)),
        onUpdateNotAvailable: (callback) => ipcRenderer.on('update-not-available', (_event, data) => callback(data)),
        onUpdateError: (callback) => ipcRenderer.on('update-error', (_event, data) => callback(data)),
        onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (_event, data) => callback(data)),
        onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', (_event, data) => callback(data)),
        onAutoUpdaterLog: (callback) => ipcRenderer.on('auto-updater-log', (_event, data) => callback(data))
    }
}
