'use strict'
const {ipcRenderer} = require('electron')

export const importPreload = () => {
    return {
        importJSON: () => ipcRenderer.invoke('importJSON')
    }
}
