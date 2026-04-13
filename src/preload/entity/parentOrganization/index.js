'use strict'
const {ipcRenderer} = require('electron')
export const parentOrganizationEntityPreload = () => {
    return {
        insertParentOrganizationEntity : (data) => ipcRenderer.invoke('insertParentOrganizationEntity', data),
        insertParentOrganizationEntityFromServer : (data, serverData) => ipcRenderer.invoke('insertParentOrganizationEntityFromServer', data, serverData),
        getOrganisationEntityByMrid : (id) => ipcRenderer.invoke('getOrganisationEntityByMrid', id),
        deleteParentOrganizationEntity : (data) => ipcRenderer.invoke('deleteParentOrganizationEntity', data)
    }
}