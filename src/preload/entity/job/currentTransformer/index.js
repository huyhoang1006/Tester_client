'use strict'
const {ipcRenderer} = require('electron')
export const currentTransformerJobPreload = () => {
    return {
        insertCurrentTransformerJob : (old_data, data) => ipcRenderer.invoke('insertCurrentTransformerJob', old_data, data),
        getCurrentTransformerJobByMrid : (mrid, assetId) => ipcRenderer.invoke('getCurrentTransformerJobByMrid', mrid),
        deleteCurrentTransformerJobByMrid : (data) => ipcRenderer.invoke('deleteCurrentTransformerJobByMrid', data),
    }
}