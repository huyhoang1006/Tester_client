'use strict'
const {ipcRenderer} = require('electron')
export const circuitBreakerJobPreload = () => {
    return {
        insertCircuitBreakerJob : (old_data, data) => ipcRenderer.invoke('insertCircuitBreakerJob', old_data, data),
        getCircuitBreakerJobByMrid : (mrid, assetId) => ipcRenderer.invoke('getCircuitBreakerJobByMrid', mrid),
        deleteCircuitBreakerJobByMrid : (data) => ipcRenderer.invoke('deleteCircuitBreakerJobByMrid', data),
    }
}