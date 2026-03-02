'use strict'
const {ipcRenderer} = require('electron')
export const disconnectorJobPreload = () => {
    return {
        insertDisconnectorJob : (old_data, data) => ipcRenderer.invoke('insertDisconnectorJob', old_data, data),
        getDisconnectorJobByMrid : (mrid, assetId) => ipcRenderer.invoke('getDisconnectorJobByMrid', mrid),
        deleteDisconnectorJobByMrid : (data) => ipcRenderer.invoke('deleteDisconnectorJobByMrid', data),
    }
}