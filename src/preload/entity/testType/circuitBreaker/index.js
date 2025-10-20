'use strict'
const {ipcRenderer} = require('electron')
export const testTypeCircuitBreakerPreload = () => {
    return {
        insertTestTypeCircuitBreaker : (data) => ipcRenderer.invoke('insertTestTypeCircuitBreaker', data),
        getTestTypeCircuitBreakerByMrid : (mrid) => ipcRenderer.invoke('getTestTypeCircuitBreakerByMrid', mrid),
        deleteTestTypeCircuitBreakerByMrid : (mrid) => ipcRenderer.invoke('deleteTestTypeCircuitBreakerByMrid', mrid),
        getAllTestTypeCircuitBreaker : () => ipcRenderer.invoke('getAllTestTypeCircuitBreaker'),
        updateTestTypeCircuitBreakerByMrid : (mrid, data) => ipcRenderer.invoke('updateTestTypeCircuitBreakerByMrid', mrid, data),
    }
}