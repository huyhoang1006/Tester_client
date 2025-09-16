'use strict'
const { ipcRenderer } = require('electron')
export const voltageTransformerEntityPreload = () => {
    return {
        insertVoltageTransformerEntity: (old_data, data) => ipcRenderer.invoke('insertVoltageTransformerEntity', old_data, data),
        getVoltageTransformerEntityByMrid : (mrid, psr_id) => ipcRenderer.invoke('getVoltageTransformerEntityByMrid', mrid, psr_id),
    }
}