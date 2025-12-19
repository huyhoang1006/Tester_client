'use strict'
const {ipcRenderer} = require('electron')
export const appOptionPreload = () => {
    return {
        minimizeApp : () => ipcRenderer.invoke('minimizeApp'),
        closeApp : () => ipcRenderer.invoke('closeApp'),
        maximizeApp : () => ipcRenderer.invoke('maximizeApp')
    }
}