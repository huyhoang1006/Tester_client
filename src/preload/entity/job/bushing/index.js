'use strict'
const {ipcRenderer} = require('electron')
export const bushingJobPreload = () => {
    return {
        insertBushingJob : (old_data, data) => ipcRenderer.invoke('insertBushingJob', old_data, data),
        getBushingJobByMrid : (mrid, assetId) => ipcRenderer.invoke('getBushingJobByMrid', mrid),
        deleteBushingJobByMrid : (data) => ipcRenderer.invoke('deleteBushingJobByMrid', data),
    }
}