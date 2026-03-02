'use strict'
const {ipcRenderer} = require('electron')
export const capacitorJobPreload = () => {
    return {
        insertCapacitorJob : (old_data, data) => ipcRenderer.invoke('insertCapacitorJob', old_data, data),
        getCapacitorJobByMrid : (mrid, assetId) => ipcRenderer.invoke('getCapacitorJobByMrid', mrid),
        deleteCapacitorJobByMrid : (data) => ipcRenderer.invoke('deleteCapacitorJobByMrid', data),
    }
}