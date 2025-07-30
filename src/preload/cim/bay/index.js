'use strict'
const {ipcRenderer} = require('electron')
export const bayPreload = () => {
    return {
        getBayByMrid : (mrid) => ipcRenderer.invoke('getBayByMrid', mrid),
        insertBay : (data) => ipcRenderer.invoke('insertBay', data),
        getBayByVoltageBySubstationId : (voltage_level, substationId) => ipcRenderer.invoke('getBayByVoltageBySubstationId', voltage_level, substationId),
        updateBayByMrid : (mrid, data) => ipcRenderer.invoke('updateBayByMrid', mrid, data),
        deleteBayByMrid : (mrid) => ipcRenderer.invoke('deleteBayByMrid', mrid),
    }
}