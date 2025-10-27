'use strict'
const {ipcRenderer} = require('electron')
export const testTypeVoltageTransformerPreload = () => {
    return {
        insertTestTypeVT : (data) => ipcRenderer.invoke('insertTestTypeVT', data),
        getTestTypeVTByMrid : (mrid) => ipcRenderer.invoke('getTestTypeVTByMrid', mrid),
        deleteTestTypeVTByMrid : (mrid) => ipcRenderer.invoke('deleteTestTypeVTByMrid', mrid),
        getAllTestTypeVT : () => ipcRenderer.invoke('getAllTestTypeVT'),
        updateTestTypeVTByMrid : (mrid, data) => ipcRenderer.invoke('updateTestTypeVTByMrid', mrid, data),
    }
}