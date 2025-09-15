'use strict'
const { ipcRenderer } = require('electron')
export const voltageTransformerEntityPreload = () => {
    return {
        insertVoltageTransformerEntity: (old_data, data) => ipcRenderer.invoke('insertVoltageTransformerEntity', old_data, data),
    }
}