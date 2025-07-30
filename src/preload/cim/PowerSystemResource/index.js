'use strict'
const {ipcRenderer} = require('electron')
export const powerSystemResourcePreload = () => {
    return {
        getPowerSystemResourceByMrid : (mrid) => ipcRenderer.invoke('getPowerSystemResourceByMrid', mrid),
        getLocationByPowerSystemResourceMrid : (mrid) => ipcRenderer.invoke('getLocationByPowerSystemResourceMrid', mrid),
        insertPowerSystemResource : (data) => ipcRenderer.invoke('insertPowerSystemResource', data),
        updatePowerSystemResourceByMrid : (mrid, data) => ipcRenderer.invoke('updatePowerSystemResourceByMrid', mrid, data),
        deletePowerSystemResourceByMrid : (mrid) => ipcRenderer.invoke('deletePowerSystemResourceByMrid', mrid),
    }
}