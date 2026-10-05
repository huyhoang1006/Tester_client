'use strict'
const {ipcRenderer} = require('electron')

export const importPreload = () => {
    return {
        importJSON: () => ipcRenderer.invoke('importJSON'),
        importTreePackage: () => ipcRenderer.invoke('importTreePackage'),
        cleanupTreeImport: (stagingId) => ipcRenderer.invoke('cleanupTreeImport', stagingId)
    }
}
