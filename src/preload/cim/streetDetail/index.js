'use strict'
const {ipcRenderer} = require('electron')
export const streetDetailPreload = () => {
    return {
        getStreetDetailByMrid : (mrid) => ipcRenderer.invoke('getStreetDetailByMrid', mrid),
        getStreetDetailByLocationId : (locationId) => ipcRenderer.invoke('getStreetDetailByLocationId', locationId),
        insertStreetDetail : (data) => ipcRenderer.invoke('insertStreetDetail', data),
        updateStreetDetailByMrid : (mrid, data) => ipcRenderer.invoke('updateStreetDetailByMrid', mrid, data),
        deleteStreetDetailByMrid : (mrid) => ipcRenderer.invoke('deleteStreetDetailByMrid', mrid),
    }
}