'use strict'
const {contextBridge, ipcRenderer} = require('electron')
export const surgeArresterPreload = () => {
    return {
    //Surge Arrester
        insertSurgeArrester : (location_id, asset) => ipcRenderer.invoke('insertSurgeArrester', location_id, asset),
        getSurgeArresterByLocationId : (location_id) => ipcRenderer.invoke('getSurgeArresterByLocationId', location_id),
        getSurgeArresterById : (id) => ipcRenderer.invoke('getSurgeArresterById', id),
        deleteSurgeArrester : (ids) => ipcRenderer.invoke('deleteSurgeArrester', ids),
        updateSurgeArrester : (asset) => ipcRenderer.invoke('updateSurgeArrester', asset),
        relocateSurgeArrester : (asset) => ipcRenderer.invoke('relocateSurgeArrester', asset),


        //Surge Arrester
        getLocationAssetByIdSurgeArrester: (id) => ipcRenderer.invoke('getLocationAssetByIdSurgeArrester', id),
        getTestSurgeArresterTypes: () => ipcRenderer.invoke('getTestSurgeArresterTypes'),
        getJobSurgeArrester : (asset_id) => ipcRenderer.invoke('getJobSurgeArrester', asset_id),
        getJobSurgeArresterById: (id) => ipcRenderer.invoke('getJobSurgeArresterById', id),
        saveJobSurge : (job) => ipcRenderer.invoke('saveJobSurge', job),
        saveTestSurge : (testList, job_id) => ipcRenderer.invoke('saveTestSurge', testList, job_id),
        insertJobSurgeArrester: (assetId, properties, testList, testConditionArr, attachmentArr) => ipcRenderer.invoke('insertJobSurgeArrester', assetId, properties, testList, testConditionArr, attachmentArr),
        updateJobSurgeArrester: (properties, testList, testConditionArr, attachmentArr) => ipcRenderer.invoke('updateJobSurgeArrester', properties, testList, testConditionArr, attachmentArr),
        deleteJobSurgeArrester: (ids) => ipcRenderer.invoke('deleteJobSurgeArrester', ids),
        deleteSurgeArresterTest: (id) => ipcRenderer.invoke('deleteSurgeArresterTest', id),
        getTestSurgeByJobId: (job_id) => ipcRenderer.invoke('getTestSurgeByJobId', job_id)
    }
}