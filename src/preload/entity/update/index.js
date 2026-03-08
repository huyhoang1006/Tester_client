'use strict'
const {ipcRenderer} = require('electron')
export const updateEntityPreload = () => {
    return {
        checkForUpdate : () => ipcRenderer.invoke('checkForUpdate'),
        downloadUpdate : () => ipcRenderer.invoke('downloadUpdate')
    }
}