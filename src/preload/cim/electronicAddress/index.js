'use strict'
const {ipcRenderer} = require('electron')
export const electronicAddressPreload = () => {
    return {
        getElectronicAddressByMrid : (mrid) => ipcRenderer.invoke('getElectronicAddressByMrid', mrid),
        insertElectronicAddress : (data) => ipcRenderer.invoke('insertElectronicAddress', data),
        updateElectronicAddressByMrid : (mrid, data) => ipcRenderer.invoke('updateElectronicAddressByMrid', mrid, data),
        deleteElectronicAddressByMrid : (mrid) => ipcRenderer.invoke('deleteElectronicAddressByMrid', mrid),
    }
}