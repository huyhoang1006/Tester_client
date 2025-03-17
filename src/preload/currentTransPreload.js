'use strict'
const {contextBridge, ipcRenderer} = require('electron')
export const currentTransPreload = () => {
    return {
    //current transformer
        insertCurrentVoltage : (location_id, asset) => ipcRenderer.invoke('insertCurrentVoltage', location_id, asset),
        getCurrentVoltageByLocationId : (location_id) => ipcRenderer.invoke('getCurrentVoltageByLocationId', location_id),
        getCurrentVoltageById : (id) => ipcRenderer.invoke('getCurrentVoltageById', id),
        deleteCurrentVoltage : (ids) => ipcRenderer.invoke('deleteCurrentVoltage', ids),
        updateCurrentVoltage : (asset) => ipcRenderer.invoke('updateCurrentVoltage', asset),
        relocateCurrent : (asset) => ipcRenderer.invoke('relocateCurrent', asset),


        //get test type current trans
        getLocationAssetByIdCurrentVoltage: (id) => ipcRenderer.invoke('getLocationAssetByIdCurrentVoltage', id),
        getTestCurrentVoltageTypes: () => ipcRenderer.invoke('getTestCurrentVoltageTypes'),
        getJobCurrentVoltage : (asset_id) => ipcRenderer.invoke('getJobCurrentVoltage', asset_id),
        getJobCurrentVoltageById: (id) => ipcRenderer.invoke('getJobCurrentVoltageById', id),
        saveJobCurrent : (job) => ipcRenderer.invoke('saveJobCurrent', job),
        saveTestCurrent : (testList, job_id) => ipcRenderer.invoke('saveTestCurrent', testList, job_id),
        insertJobCurrentVoltage: (assetId, properties, testList, testConditionArr, attachmentArr) => ipcRenderer.invoke('insertJobCurrentVoltage', assetId, properties, testList, testConditionArr, attachmentArr),
        updateJobCurrentVoltage: (properties, testList, testConditionArr, attachmentArr) => ipcRenderer.invoke('updateJobCurrentVoltage', properties, testList, testConditionArr, attachmentArr),
        deleteJobCurrentVoltage: (ids) => ipcRenderer.invoke('deleteJobCurrentVoltage', ids),
        deleteCurrentVoltageTest: (id) => ipcRenderer.invoke('deleteCurrentVoltageTest', id),
        getTestCurrentByJobId: (job_id) => ipcRenderer.invoke('getTestCurrentByJobId', job_id)
    }
}