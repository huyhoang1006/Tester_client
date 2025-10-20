'use strict'
const {ipcRenderer} = require('electron')
export const testTypeCurrentTransformerPreload = () => {
    return {
        insertTestTypeCT : (data) => ipcRenderer.invoke('insertTestTypeCT', data),
        getTestTypeCTByMrid : (mrid) => ipcRenderer.invoke('getTestTypeCTByMrid', mrid),
        deleteTestTypeCTByMrid : (mrid) => ipcRenderer.invoke('deleteTestTypeCTByMrid', mrid),
        getAllTestTypeCT : () => ipcRenderer.invoke('getAllTestTypeCT'),
        updateTestTypeCTByMrid : (mrid, data) => ipcRenderer.invoke('updateTestTypeCTByMrid', mrid, data),
    }
}