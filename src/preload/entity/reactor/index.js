'use strict'
const { ipcRenderer } = require('electron')
export const reactorEntityPreload = () => {
    return {
        insertReactorEntity: (old_data, data) => ipcRenderer.invoke('insertReactorEntity', old_data, data),
        getReactorEntityByMrid: (mrid, prsId) => ipcRenderer.invoke('getReactorEntityByMrid', mrid, prsId),
        deleteReactorEntity: (data) => ipcRenderer.invoke('deleteReactorEntity', data)
    }
}