'use strict'
const {ipcRenderer} = require('electron')
export const analogPreload = () => {
    return {
        getAnalogByMrid : (mrid) => ipcRenderer.invoke('getAnalogByMrid', mrid),
        getAllAnalogByProcedure : (procedureId) => ipcRenderer.invoke('getAllAnalogByProcedure', procedureId),
        insertAnalog : (data) => ipcRenderer.invoke('insertAnalog', data),
        deleteAnalogByMrid : (mrid) => ipcRenderer.invoke('deleteAnalogByMrid', mrid),
    }
}