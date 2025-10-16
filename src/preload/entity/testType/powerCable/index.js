'use strict'
const { ipcRenderer } = require('electron')
export const testTypePowerCablePreload = () => {
    return {
        insertTestTypePowerCable: (data) => ipcRenderer.invoke('insertTestTypePowerCable', data),
        getTestTypePowerCableByMrid: (mrid) => ipcRenderer.invoke('getTestTypePowerCableByMrid', mrid),
        deleteTestTypePowerCableByMrid: (mrid) => ipcRenderer.invoke('deleteTestTypePowerCableByMrid', mrid),
        getAllTestTypePowerCable: () => ipcRenderer.invoke('getAllTestTypePowerCable'),
        updateTestTypePowerCableByMrid: (mrid, data) => ipcRenderer.invoke('updateTestTypePowerCableByMrid', mrid, data),
    }
}