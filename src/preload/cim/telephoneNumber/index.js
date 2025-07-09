'use strict'
const {ipcRenderer} = require('electron')
export const telephoneNumberPreload = () => {
    return {
        getTelephoneNumberByMrid : (mrid) => ipcRenderer.invoke('getTelephoneNumberByMrid', mrid),
        insertTelephoneNumber : (data) => ipcRenderer.invoke('insertTelephoneNumber', data),
        updateTelephoneNumberByMrid : (mrid, data) => ipcRenderer.invoke('updateTelephoneNumberByMrid', mrid, data),
        deleteTelephoneNumberByMrid : (mrid) => ipcRenderer.invoke('deleteTelephoneNumberByMrid', mrid),
    }
}