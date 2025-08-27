'use strict'
const {ipcRenderer} = require('electron')
export const assetPreload = () => {
    return {
        getAssetByMrid : (mrid) => ipcRenderer.invoke('getAssetByMrid', mrid),
    }
}