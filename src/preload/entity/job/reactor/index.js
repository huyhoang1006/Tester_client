'use strict'
const {ipcRenderer} = require('electron')
export const reactorJobPreload = () => {
    return {
        insertReactorJob : (old_data, data) => ipcRenderer.invoke('insertReactorJob', old_data, data),
        getReactorJobByMrid : (mrid, assetId) => ipcRenderer.invoke('getReactorJobByMrid', mrid),
        deleteReactorJobByMrid : (data) => ipcRenderer.invoke('deleteReactorJobByMrid', data),
    }
}