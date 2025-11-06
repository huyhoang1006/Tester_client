'use strict'
const { ipcRenderer } = require('electron')
export const breakerEntityPreload = () => {
    return {
        insertBreakerEntity: (old_data, data) => ipcRenderer.invoke('insertBreakerEntity', old_data, data),
        getBreakerEntityByMrid: (mrid, prsId) => ipcRenderer.invoke('getBreakerEntityByMrid', mrid, prsId),
        deleteBreakerEntity: (data) => ipcRenderer.invoke('deleteBreakerEntity', data)
    }
}