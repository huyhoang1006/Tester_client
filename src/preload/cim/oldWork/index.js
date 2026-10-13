'use strict'
const {ipcRenderer} = require('electron')
export const oldWorkPreload = () => {
    return {
        getOldWorkByMrid : (mrid) => ipcRenderer.invoke('getOldWorkByMrid', mrid),
        getOldWorkByAssetId : (assetId) => ipcRenderer.invoke('getOldWorkByAssetId', assetId),
        getWorkTasksByWorkId : (workId) => ipcRenderer.invoke('getWorkTasksByWorkId', workId),
        getWorkTasksByAssetId : (assetId) => ipcRenderer.invoke('getWorkTasksByAssetId', assetId),
        updateOldWorkAssetIdById : (mrid, assetId) => ipcRenderer.invoke('updateOldWorkAssetIdById', mrid, assetId),
    }
}
