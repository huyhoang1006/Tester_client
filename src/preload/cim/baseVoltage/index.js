'use strict'
const {ipcRenderer} = require('electron')
export const baseVoltagePreload = () => {
    return {
        getBaseVoltageByMrid : (mrid) => ipcRenderer.invoke('getBaseVoltageByMrid', mrid),
        insertBaseVoltage : (data) => ipcRenderer.invoke('insertBaseVoltage', data),
        updateBaseVoltageByMrid : (mrid, data) => ipcRenderer.invoke('updateBaseVoltageByMrid', mrid, data),
        deleteBaseVoltageByMrid : (mrid) => ipcRenderer.invoke('deleteBaseVoltageByMrid', mrid),
    }
}