'use strict'
const {ipcRenderer} = require('electron')
export const bayEntityPreload = () => {
    return {
        insertBayEntity : (data) => ipcRenderer.invoke('insertBayEntity', data),
        getBayEntityByMrid : (id) => ipcRenderer.invoke('getBayEntityByMrid', id),
        deleteBayEntityByMrid : (data) => ipcRenderer.invoke('deleteBayEntityByMrid', data)
    }
}