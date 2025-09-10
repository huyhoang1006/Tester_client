'use strict'
const {ipcRenderer} = require('electron')
export const transformerEntityPreload = () => {
    return {
        insertTransformerEntity : (old_data, data) => ipcRenderer.invoke('insertTransformerEntity', old_data, data),
        getTransformerEntityByMrid : (mrid, psr_id) => ipcRenderer.invoke('getTransformerEntityByMrid', mrid, psr_id),
    }
}