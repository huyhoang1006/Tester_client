'use strict'
const {ipcRenderer} = require('electron')

export const exportPreload = () => {
    return {
        exportJSON: (payload, options) => ipcRenderer.invoke('exportJSON', payload, options)
    }
}

