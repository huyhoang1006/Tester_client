'use strict'
const {contextBridge, ipcRenderer} = require('electron')
export const disconnectorPreload = () => {
    return {
    //Disconnector
        insertDisconnector : (location_id, asset) => ipcRenderer.invoke('insertDisconnector', location_id, asset),
        getDisconnectorByLocationId : (location_id) => ipcRenderer.invoke('getDisconnectorByLocationId', location_id),
        getDisconnectorById : (id) => ipcRenderer.invoke('getDisconnectorById', id),
        deleteDisconnector : (ids) => ipcRenderer.invoke('deleteDisconnector', ids),
        updateDisconnector : (asset) => ipcRenderer.invoke('updateDisconnector', asset),
        relocateDisconnector : (asset) => ipcRenderer.invoke('relocateDisconnector', asset),


        //Disconnector
        getLocationAssetByIdDisconnector: (id) => ipcRenderer.invoke('getLocationAssetByIdDisconnector', id),
        getTestDisconnectorTypes: () => ipcRenderer.invoke('getTestDisconnectorTypes'),
        getJobDisconnector : (asset_id) => ipcRenderer.invoke('getJobDisconnector', asset_id),
        getJobDisconnectorById: (id) => ipcRenderer.invoke('getJobDisconnectorById', id),
        saveJobDisconnector : (job) => ipcRenderer.invoke('saveJobDisconnector', job),
        saveTestDisconnector : (testList, job_id) => ipcRenderer.invoke('saveTestDisconnector', testList, job_id),
        insertJobDisconnector: (assetId, properties, testList, testConditionArr, attachmentArr) => ipcRenderer.invoke('insertJobDisconnector', assetId, properties, testList, testConditionArr, attachmentArr),
        updateJobDisconnector: (properties, testList, testConditionArr, attachmentArr) => ipcRenderer.invoke('updateJobDisconnector', properties, testList, testConditionArr, attachmentArr),
        deleteJobDisconnector: (ids) => ipcRenderer.invoke('deleteJobDisconnector', ids),
        deleteDisconnectorTest: (id) => ipcRenderer.invoke('deleteDisconnectorTest', id),
        getTestDisconnectorByJobId: (job_id) => ipcRenderer.invoke('getTestDisconnectorByJobId', job_id)
    }
}