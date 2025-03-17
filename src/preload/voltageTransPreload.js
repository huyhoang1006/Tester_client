'use strict'
const {contextBridge, ipcRenderer} = require('electron')
export const voltageTransPreload = () => {
    return {
    //voltage transformer
        insertVoltageTrans : (location_id, asset) => ipcRenderer.invoke('insertVoltageTrans', location_id, asset),
        getVoltageTransByLocationId : (location_id) => ipcRenderer.invoke('getVoltageTransByLocationId', location_id),
        getVoltageTransById : (id) => ipcRenderer.invoke('getVoltageTransById', id),
        deleteVoltageTrans : (ids) => ipcRenderer.invoke('deleteVoltageTrans', ids),
        updateVoltageTrans : (asset) => ipcRenderer.invoke('updateVoltageTrans', asset),
        relocateVoltage : (asset) => ipcRenderer.invoke('relocateVoltage', asset),


        //get test type voltage trans
        getLocationAssetByIdVoltageTrans: (id) => ipcRenderer.invoke('getLocationAssetByIdVoltageTrans', id),
        getTestVoltageTransTypes: () => ipcRenderer.invoke('getTestVoltageTransTypes'),
        getJobVoltageTrans : (asset_id) => ipcRenderer.invoke('getJobVoltageTrans', asset_id),
        getJobVoltageTransById: (id) => ipcRenderer.invoke('getJobVoltageTransById', id),
        saveJobVoltage : (job) => ipcRenderer.invoke('saveJobVoltage', job),
        saveTestVoltage : (testList, job_id) => ipcRenderer.invoke('saveTestVoltage', testList, job_id),
        insertJobVoltageTrans: (assetId, properties, testList, testConditionArr, attachmentArr) => ipcRenderer.invoke('insertJobVoltageTrans', assetId, properties, testList, testConditionArr, attachmentArr),
        updateJobVoltageTrans: (properties, testList, testConditionArr, attachmentArr) => ipcRenderer.invoke('updateJobVoltageTrans', properties, testList, testConditionArr, attachmentArr),
        deleteJobVoltageTrans: (ids) => ipcRenderer.invoke('deleteJobVoltageTrans', ids),
        deleteVoltageTransTest: (id) => ipcRenderer.invoke('deleteVoltageTransTest', id),
        getTestVoltageByJobId: (job_id) => ipcRenderer.invoke('getTestVoltageByJobId', job_id)
    }
}