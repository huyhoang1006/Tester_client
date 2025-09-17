'use strict'
const { ipcRenderer } = require('electron')
export const disconnectorEntityPreload = () => {
    return {
        insertDisconnectorEntity: (data) => ipcRenderer.invoke('insertDisconnectorEntity', data),
        getDisconnectorEntityByMrid : (mrid, psr_id) => ipcRenderer.invoke('getDisconnectorEntityByMrid', mrid, psr_id),
    }
}