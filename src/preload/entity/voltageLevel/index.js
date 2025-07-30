'use strict'
const {ipcRenderer} = require('electron')
export const voltageLevelEntityPreload = () => {
    return {
        insertVoltageLevelEntity : (data) => ipcRenderer.invoke('insertVoltageLevelEntity', data),
        getVoltageLevelEntityByMrid : (id) => ipcRenderer.invoke('getVoltageLevelEntityByMrid', id),
        deleteVoltageLevelEntityByMrid : (data) => ipcRenderer.invoke('deleteVoltageLevelEntityByMrid', data)
    }
}