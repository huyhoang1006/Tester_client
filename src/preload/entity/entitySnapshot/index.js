'use strict'
const {ipcRenderer} = require('electron')
export const entitySnapshotPreload = () => {
    return {
        getEntitySnapshotByMrid : (mrid, type) => ipcRenderer.invoke('getEntitySnapshotByMrid', mrid, type),
        insertEntitySnapshot : (data) => ipcRenderer.invoke('insertEntitySnapshot', data),
        deleteEntitySnapshotByMrid : (mrid) => ipcRenderer.invoke('deleteEntitySnapshotByMrid', mrid),
    }
}