'use strict'
const {ipcRenderer} = require('electron')
export const appOptionPreload = () => {
    return {
        minimizeApp : () => ipcRenderer.invoke('minimizeApp'),
        closeApp : () => ipcRenderer.invoke('closeApp'),
        maximizeApp : () => ipcRenderer.invoke('maximizeApp'),
        openSsoLogin: (targetUrl, redirectUri) => ipcRenderer.invoke('openSsoLogin', targetUrl, redirectUri),
        openSsoLoginFresh: (targetUrl, redirectUri) => ipcRenderer.invoke('openSsoLoginFresh', targetUrl, redirectUri),
        openSsoLogout: (targetUrl, redirectUri) => ipcRenderer.invoke('openSsoLogout', targetUrl, redirectUri),
        cancelSsoWindow: () => ipcRenderer.invoke('cancelSsoWindow'),
        focusApp: () => ipcRenderer.invoke('focusApp'),
        openFileDialog: (type) => ipcRenderer.invoke('openFileDialog', type)
    }
}
