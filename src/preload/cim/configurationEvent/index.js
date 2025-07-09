'use strict'
const {ipcRenderer} = require('electron')
export const configurationEventPreload = () => {
    return {
        getConfigurationEventByMrid : (mrid) => ipcRenderer.invoke('getConfigurationEventByMrid', mrid),
        getAllConfigurationEvents : () => ipcRenderer.invoke('getAllConfigurationEvents'),
        insertConfigurationEvent : (data) => ipcRenderer.invoke('insertConfigurationEvent', data),
        updateConfigurationEventByMrid : (mrid, data) => ipcRenderer.invoke('updateConfigurationEventByMrid', mrid, data),
        deleteConfigurationEventByMrid : (mrid) => ipcRenderer.invoke('deleteConfigurationEventByMrid', mrid),
    }
}