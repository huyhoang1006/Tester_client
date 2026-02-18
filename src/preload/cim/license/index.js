'use strict'
const { ipcRenderer } = require('electron')

export const licensePreload = () => {
    return {
        checkLicense: (name) => ipcRenderer.invoke('checkLicenseLimitation', name),
        updateLicense: (name, limit) => ipcRenderer.invoke('updateLicenseLimit', name, limit),
        getAllLicenses: () => ipcRenderer.invoke('getAllLicenses')
    }
}