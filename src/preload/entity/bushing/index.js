'use strict'
const {ipcRenderer} = require('electron')
export const bushingEntityPreload = () => {
    return {
        insertBushingEntity : (data) => ipcRenderer.invoke('insertBushingEntity', data),
        getBushingEntityByMrid : (mrid, psr_id) => ipcRenderer.invoke('getBushingEntityByMrid', mrid, psr_id),
        deleteBushingEntity : (data) => ipcRenderer.invoke('deleteBushingEntity', data)
    }
}