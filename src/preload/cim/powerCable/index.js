'use strict'
const { ipcRenderer } = require('electron')
export const powerCablePreload = () => {
    return {
        getPowerCableByMrid: (mrid) => ipcRenderer.invoke('getPowerCableByMrid', mrid),
        getPowerCableByPsrId: (mrid) => ipcRenderer.invoke('getPowerCableByPsrId', mrid),
        insertPowerCable: (data) => ipcRenderer.invoke('insertPowerCable', data),
        updatePowerCableByMrid: (mrid, data) => ipcRenderer.invoke('updatePowerCableByMrid', mrid, data),
        deletePowerCableByMrid: (mrid) => ipcRenderer.invoke('deletePowerCableByMrid', mrid),
    }
}