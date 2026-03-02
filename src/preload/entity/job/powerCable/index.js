'use strict'
const {ipcRenderer} = require('electron')
export const powerCableJobPreload = () => {
    return {
        insertPowerCableJob : (old_data, data) => ipcRenderer.invoke('insertPowerCableJob', old_data, data),
        getPowerCableJobByMrid : (mrid, assetId) => ipcRenderer.invoke('getPowerCableJobByMrid', mrid),
        deletePowerCableJobByMrid : (data) => ipcRenderer.invoke('deletePowerCableJobByMrid', data),
    }
}