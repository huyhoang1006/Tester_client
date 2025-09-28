'use strict'
const { ipcRenderer } = require('electron')
export const currentTransformerEntityPreload = () => {
    return {
        insertCurrentTransformerEntity: (old_data, data) => ipcRenderer.invoke('insertCurrentTransformerEntity', old_data, data),
        getCurrentTransformerEntityByMrid: (mrid, psr_id) => ipcRenderer.invoke('getCurrentTransformerEntityByMrid', mrid, psr_id),
    }
}