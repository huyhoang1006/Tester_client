'use strict'
const { ipcRenderer } = require('electron')
export const assetPreload = () => {
    return {
        getAssetByMrid: (mrid) => ipcRenderer.invoke('getAssetByMrid', mrid),
        getAssetByPsrIdAndKind: (prsId, kind) => ipcRenderer.invoke('getAssetByPsrIdAndKind', prsId, kind),
        updateAssetByMrid: (mrid, data) => ipcRenderer.invoke('updateAssetByMrid', mrid, data)
    }
}