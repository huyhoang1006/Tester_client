'use strict'
const {ipcRenderer} = require('electron')
export const personRolePreload = () => {
    return {
        getPersonRoleByMrid : (mrid) => ipcRenderer.invoke('getPersonRoleByMrid', mrid),
        getPersonRoleByPersonId : (personId) => ipcRenderer.invoke('getPersonRoleByPersonId', personId),
        insertPersonRole : (data) => ipcRenderer.invoke('insertPersonRole', data),
        updatePersonRoleByMrid : (mrid, data) => ipcRenderer.invoke('updatePersonRoleByMrid', mrid, data),
        deletePersonRoleByMrid : (mrid) => ipcRenderer.invoke('deletePersonRoleByMrid', mrid),
    }
}