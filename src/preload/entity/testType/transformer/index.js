'use strict'
const {ipcRenderer} = require('electron')
export const testTypeTransformerPreload = () => {
    return {
        insertTestTypeTransformer : (data) => ipcRenderer.invoke('insertTestTypeTransformer', data),
        getTestTypeTransformerByMrid : (mrid) => ipcRenderer.invoke('getTestTypeTransformerByMrid', mrid),
        deleteTestTypeTransformerByMrid : (mrid) => ipcRenderer.invoke('deleteTestTypeTransformerByMrid', mrid),
        getAllTestTypeTransformer : () => ipcRenderer.invoke('getAllTestTypeTransformer'),
        updateTestTypeTransformerByMrid : (mrid, data) => ipcRenderer.invoke('updateTestTypeTransformerByMrid', mrid, data),
    }
}