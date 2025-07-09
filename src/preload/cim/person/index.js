'use strict'
const {ipcRenderer} = require('electron')
export const personPreload = () => {
    return {
        getPersonByMrid : (mrid) => ipcRenderer.invoke('getPersonByMrid', mrid),
        getPersonByOrganisationId : (organisationId) => ipcRenderer.invoke('getPersonByOrganisationId', organisationId),
        insertPerson : (data) => ipcRenderer.invoke('insertPerson', data),
        updatePersonByMrid : (mrid, data) => ipcRenderer.invoke('updatePersonByMrid', mrid, data),
        deletePersonByMrid : (mrid) => ipcRenderer.invoke('deletePersonByMrid', mrid),
    }
}