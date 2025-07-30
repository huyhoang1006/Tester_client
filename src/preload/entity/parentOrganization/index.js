'use strict'
const {ipcRenderer} = require('electron')
export const parentOrganizationEntityPreload = () => {
    return {
        insertParentOrganizationEntity : (data) => ipcRenderer.invoke('insertParentOrganizationEntity', data),
        getOrganisationEntityByMrid : (id) => ipcRenderer.invoke('getOrganisationEntityByMrid', id),
        deleteParentOrganizationEntity : (data) => ipcRenderer.invoke('deleteParentOrganizationEntity', data)
    }
}