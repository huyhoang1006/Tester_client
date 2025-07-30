'use strict'
const {ipcRenderer} = require('electron')
export const voltagePreload = () => {
    return {
        getVoltageByMrid : (mrid) => ipcRenderer.invoke('getVoltageByMrid', mrid),
        insertVoltage : (data) => ipcRenderer.invoke('insertVoltage', data),
        updateVoltageByMrid : (mrid, data) => ipcRenderer.invoke('updateVoltageByMrid', mrid, data),
        deleteVoltageByMrid : (mrid) => ipcRenderer.invoke('deleteVoltageByMrid', mrid),
    }
}