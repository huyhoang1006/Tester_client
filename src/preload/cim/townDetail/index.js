'use strict'
const {ipcRenderer} = require('electron')
export const townDetailPreload = () => {
    return {
        getTownDetailByMrid : (mrid) => ipcRenderer.invoke('getTownDetailByMrid', mrid),
        getTownDetailByLocationId : (locationId) => ipcRenderer.invoke('getTownDetailByLocationId', locationId),
        insertTownDetail : (data) => ipcRenderer.invoke('insertTownDetail', data),
        updateTownDetailByMrid : (mrid, data) => ipcRenderer.invoke('updateTownDetailByMrid', mrid, data),
        deleteTownDetailByMrid : (mrid) => ipcRenderer.invoke('deleteTownDetailByMrid', mrid),
    }
}