'use strict'
const {contextBridge, ipcRenderer} = require('electron')
export const circuitPreload = () => {
    return {
    //circuit breaker
        insertCircuit : (location_id, asset) => ipcRenderer.invoke('insertCircuit', location_id, asset),
        getCircuitByLocationId : (location_id) => ipcRenderer.invoke('getCircuitByLocationId', location_id),
        getCircuitId : (id) => ipcRenderer.invoke('getCircuitId', id),
        deleteCircuit : (ids) => ipcRenderer.invoke('deleteCircuit', ids),
        updateCircuit : (asset) => ipcRenderer.invoke('updateCircuit', asset),
        updateCircuitAssessmentLimits : (asset) => ipcRenderer.invoke('updateCircuitAssessmentLimits', asset),
        relocateCircuit : (asset) => ipcRenderer.invoke('relocateCircuit', asset),


        //get test type circuit
        getLocationAssetByIdCircuit: (id) => ipcRenderer.invoke('getLocationAssetByIdCircuit', id),
        getTestCircuitTypes: () => ipcRenderer.invoke('getTestCircuitTypes'),
        getJobCircuit : (asset_id) => ipcRenderer.invoke('getJobCircuit', asset_id),
        getJobCircuitById: (id) => ipcRenderer.invoke('getJobCircuitById', id),
        saveJobCircuit : (job) => ipcRenderer.invoke('saveJobCircuit', job),
        saveTestCircuit : (testList, job_id) => ipcRenderer.invoke('saveTestCircuit', testList, job_id),
        insertJobdata: (assetId, properties, testList, testConditionArr, attachmentArr) => ipcRenderer.invoke('insertJobdata', assetId, properties, testList, testConditionArr, attachmentArr),
        updateJobdata: (properties, testList, testConditionArr, attachmentArr) => ipcRenderer.invoke('updateJobdata', properties, testList, testConditionArr, attachmentArr),
        deleteJobCircuit: (ids) => ipcRenderer.invoke('deleteJobCircuit', ids),
        deleteCircuitTest: (id) => ipcRenderer.invoke('deleteCircuitTest', id),
        getTestCircuitByJobId: (job_id) => ipcRenderer.invoke('getTestCircuitByJobId', job_id)
    }
}