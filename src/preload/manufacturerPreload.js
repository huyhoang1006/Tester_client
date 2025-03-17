'use strict'
const {contextBridge, ipcRenderer} = require('electron')
export const munufacturerPreload = () => {
    return {
        getManufacturerByType : (type) => ipcRenderer.invoke('getManufacturerByType', type),
        getManufacturerByTypeAndName : (type, name) => ipcRenderer.invoke('getManufacturerByTypeAndName', type, name),
        getManufacturerByName : (name) => ipcRenderer.invoke('getManufacturerByName', name),
        insertManufacturer : (name, type) => ipcRenderer.invoke('insertManufacturer', name, type),
        updateManufacturerByName : (name, data) => ipcRenderer.invoke('updateManufacturerByName', name, data),
        updateManufacturerById : (id, data) => ipcRenderer.invoke('updateManufacturerById', id, data),
        deleteManufacturerByName : (name) => ipcRenderer.invoke('deleteManufacturerByName', name),
        deleteManufacturerById : (id) => ipcRenderer.invoke('deleteManufacturerById', id)
    }
}