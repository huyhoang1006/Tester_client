'use strict'
const {ipcRenderer} = require('electron')
export const locationPreload = () => {
    return {
        getLocationByMrid : (mrid) => ipcRenderer.invoke('getLocationByMrid', mrid),
        getLocationByOrganisationId : (organisationId) => ipcRenderer.invoke('getLocationByOrganisationId', organisationId),
        insertLocation : (data) => ipcRenderer.invoke('insertLocation', data),
        updateLocationByMrid : (mrid, data) => ipcRenderer.invoke('updateLocationByMrid', mrid, data),
        deleteLocationByMrid : (mrid) => ipcRenderer.invoke('deleteLocationByMrid', mrid),
    }
}