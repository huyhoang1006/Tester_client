'use strict'
const {ipcRenderer} = require('electron')
export const streetAddressPreload = () => {
    return {
        getStreetAddressByMrid : (mrid) => ipcRenderer.invoke('getStreetAddressByMrid', mrid),
        insertStreetAddress : (data) => ipcRenderer.invoke('insertStreetAddress', data),
        updateStreetAddressByMrid : (mrid, data) => ipcRenderer.invoke('updateStreetAddressByMrid', mrid, data),
        deleteStreetAddressByMrid : (mrid) => ipcRenderer.invoke('deleteStreetAddressByMrid', mrid),
    }
}