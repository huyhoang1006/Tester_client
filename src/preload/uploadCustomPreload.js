'use strict'
const {contextBridge, ipcRenderer} = require('electron')
export const uploadCustomPreload = () => {
    return {
    // uploadCustom
        uploadCustom : (name) => ipcRenderer.invoke('uploadCustom', name),
        getNameTemplate : () => ipcRenderer.invoke('getNameTemplate'),
        uploadReport : (name, asset, location, job, user_id) => ipcRenderer.invoke('uploadReport', name, asset, location, job, user_id),
        getTemplateByName : (name) => ipcRenderer.invoke('getTemplateByName', name),
        deleteTempByName : (name) => ipcRenderer.invoke('deleteTempByName', name),
        updateTempByName: (data) => ipcRenderer.invoke('updateTempByName', data),
        getColumnByName: (name) => ipcRenderer.invoke('getColumnByName', name),
        saveTemplate : (data) => ipcRenderer.invoke('saveTemplate', data),
        checkNameTemplateExist : (name) => ipcRenderer.invoke('checkNameTemplateExist', name),
        getVariableFromJson : () => ipcRenderer.invoke('getVariableFromJson'),
        exportVariableToJon : (data) => ipcRenderer.invoke('exportVariableToJon', data),
        exportReport : (file, location, assetType, asset, job, test, user_id, bushing, tap_changer) => ipcRenderer.invoke('exportReport',file, location, assetType, asset, job, test, user_id, bushing, tap_changer)
    }
}