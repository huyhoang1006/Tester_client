'use strict'
const { contextBridge, ipcRenderer } = require('electron')
export const powerCablePreload = () => {
    return {
        //Power Cable
        insertPowerCable: (location_id, asset) => ipcRenderer.invoke('insertPowerCable', location_id, asset),
        getPowerCableByLocationId: (location_id) => ipcRenderer.invoke('getPowerCableByLocationId', location_id),
        getPowerCableById: (id) => ipcRenderer.invoke('getPowerCableById', id),
        deletePowerCable: (ids) => ipcRenderer.invoke('deletePowerCable', ids),
        updatePowerCable: (asset) => ipcRenderer.invoke('updatePowerCable', asset),
        relocatePowerCable: (asset) => ipcRenderer.invoke('relocatePowerCable', asset),


        //get test type Power Cable
        getLocationAssetByIdPowerCable: (id) => ipcRenderer.invoke('getLocationAssetByIdPowerCable', id),
        getTestPowerCableTypes: () => ipcRenderer.invoke('getTestPowerCableTypes'),
        getJobPowerCable: (asset_id) => ipcRenderer.invoke('getJobPowerCable', asset_id),
        getJobPowerCableById: (id) => ipcRenderer.invoke('getJobPowerCableById', id),
        saveJobPower: (job) => ipcRenderer.invoke('saveJobPower', job),
        saveTestPower: (testList, job_id) => ipcRenderer.invoke('saveTestPower', testList, job_id),
        insertJobPowerCable: (assetId, properties, testList, testConditionArr, attachmentArr) => ipcRenderer.invoke('insertJobPowerCable', assetId, properties, testList, testConditionArr, attachmentArr),
        updateJobPowerCable: (properties, testList, testConditionArr, attachmentArr) => ipcRenderer.invoke('updateJobPowerCable', properties, testList, testConditionArr, attachmentArr),
        deleteJobPowerCable: (ids) => ipcRenderer.invoke('deleteJobPowerCable', ids),
        deletePowerCableTest: (id) => ipcRenderer.invoke('deletePowerCableTest', id),
        getTestPowerByJobId: (job_id) => ipcRenderer.invoke('getTestPowerByJobId', job_id)
    }
}