'use strict'
const {ipcRenderer} = require('electron')
export const rotatingMachineJobPreload = () => {
    return {
        insertRotatingMachineJob : (old_data, data) => ipcRenderer.invoke('insertRotatingMachineJob', old_data, data),
        getRotatingMachineJobByMrid : (mrid, assetId) => ipcRenderer.invoke('getRotatingMachineJobByMrid', mrid),
        deleteRotatingMachineJobByMrid : (data) => ipcRenderer.invoke('deleteRotatingMachineJobByMrid', data),
    }
}