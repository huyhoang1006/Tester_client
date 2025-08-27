'use strict'
const {ipcRenderer} = require('electron')
export const oldWorkPreload = () => {
    return {
        getOldWorkByMrid : (mrid) => ipcRenderer.invoke('getOldWorkByMrid', mrid),
        getOldWorkByAssetId : (assetId) => ipcRenderer.invoke('getOldWorkByAssetId', assetId),
    }
}