'use strict'
const {ipcRenderer} = require('electron')
export const voltageTransformerJobPreload = () => {
    return {
        insertVoltageTransformerJob : (old_data, data) => ipcRenderer.invoke('insertVoltageTransformerJob', old_data, data),
        getVoltageTransformerJobByMrid : (mrid, assetId) => ipcRenderer.invoke('getVoltageTransformerJobByMrid', mrid),
        deleteVoltageTransformerJobByMrid : (data) => ipcRenderer.invoke('deleteVoltageTransformerJobByMrid', data),
    }
}