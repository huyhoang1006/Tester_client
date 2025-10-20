'use strict'
const {ipcRenderer} = require('electron')
export const testTypeDisconnectorPreload = () => {
    return {
        insertTestTypeDisconnector : (data) => ipcRenderer.invoke('insertTestTypeDisconnector', data),
        getTestTypeDisconnectorByMrid : (mrid) => ipcRenderer.invoke('getTestTypeDisconnectorByMrid', mrid),
        deleteTestTypeDisconnectorByMrid : (mrid) => ipcRenderer.invoke('deleteTestTypeDisconnectorByMrid', mrid),
        getAllTestTypeDisconnector : () => ipcRenderer.invoke('getAllTestTypeDisconnector'),
        updateTestTypeDisconnectorByMrid : (mrid, data) => ipcRenderer.invoke('updateTestTypeDisconnectorByMrid', mrid, data),
    }
}