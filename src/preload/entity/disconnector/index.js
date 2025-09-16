'use strict'
const { ipcRenderer } = require('electron')
export const disconnectorEntityPreload = () => {
    return {
        insertDisconnectorEntity: (old_data, data) => ipcRenderer.invoke('insertDisconnectorEntity', old_data, data),
    }
}