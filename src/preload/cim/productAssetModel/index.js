'use strict'
const {ipcRenderer} = require('electron')
export const productAssetModelPreload = () => {
    return {
        getProductAssetModelByMrid : (mrid) => ipcRenderer.invoke('getProductAssetModelByMrid', mrid),
        insertProductAssetModel : (data) => ipcRenderer.invoke('insertProductAssetModel', data),
        updateProductAssetModelByMrid : (mrid, data) => ipcRenderer.invoke('updateProductAssetModelByMrid', mrid, data),
        deleteProductAssetModelByMrid : (mrid) => ipcRenderer.invoke('deleteProductAssetModelByMrid', mrid),
    }
}