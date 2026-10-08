'use strict'

const {ipcRenderer} = require('electron')

export const appLicensePreload = () => ({
    getDeviceFingerprint: () => ipcRenderer.invoke('getDeviceFingerprint'),
    getOnlineLicenseSetup: () => ipcRenderer.invoke('getOnlineLicenseSetup'),
    checkOnlineLicense: () => ipcRenderer.invoke('checkOnlineLicense'),
    activateOnlineLicense: payload => ipcRenderer.invoke('activateOnlineLicense', payload),
    clearOnlineLicense: () => ipcRenderer.invoke('clearOnlineLicense')
})

