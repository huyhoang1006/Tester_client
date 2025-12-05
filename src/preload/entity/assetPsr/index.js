'use strict'
const { ipcRenderer } = require('electron')
export const assetPsrPreload = () => {
    return {
        getAssetPsrByAssetIdAndPsrId: (assetId, psrId) => ipcRenderer.invoke('getAssetPsrByAssetIdAndPsrId', assetId, psrId),
        getAssetPsrById: (mrid) => ipcRenderer.invoke('getAssetPsrById', mrid),
        insertAssetPsr: (data) => ipcRenderer.invoke('insertAssetPsr', data),
        updateAssetPsr: (mrid, data) => ipcRenderer.invoke('updateAssetPsr', mrid, data),
        deleteAssetPsrById: (mrid) => ipcRenderer.invoke('deleteAssetPsrById', mrid),
    }
}
