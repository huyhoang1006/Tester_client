'use strict'
const { ipcRenderer } = require('electron')
export const powerCableJobPreload = () => {
    return {
        insertPowerCableJob: (old_data, data) => ipcRenderer.invoke('insertPowerCableJob', old_data, data),
        getPowerCableJobByMrid: (mrid) => ipcRenderer.invoke('getPowerCableJobByMrid', mrid),
        deletePowerCableJobByMrid: (mrid) => ipcRenderer.invoke('deletePowerCableJobByMrid', mrid),
    }
}