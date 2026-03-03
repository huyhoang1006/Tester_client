'use strict'
const {ipcRenderer} = require('electron')
export const transformerJobPreload = () => {
    return {
        insertTransformerJob : (old_data, data) => ipcRenderer.invoke('insertTransformerJob', old_data, data),
        getTransformerJobByMrid : (mrid, assetId) => ipcRenderer.invoke('getTransformerJobByMrid', mrid),
        deleteTransformerJobByMrid : (data) => ipcRenderer.invoke('deleteTransformerJobByMrid', data),
    }
}