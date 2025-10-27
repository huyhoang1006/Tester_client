'use strict'
const { ipcRenderer } = require('electron')
export const capacitorEntityPreload = () => {
    return {
        insertCapacitorEntity: (old_data, data) => ipcRenderer.invoke('insertCapacitorEntity', old_data, data),
        getCapacitorEntityByMrid: (mrid, prsId) => ipcRenderer.invoke('getCapacitorEntityByMrid', mrid, prsId),
        deleteCapacitorEntity: (data) => ipcRenderer.invoke('deleteCapacitorEntity', data)
    }
}