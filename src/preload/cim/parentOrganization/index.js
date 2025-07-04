'use strict'
const {ipcRenderer} = require('electron')
export const parentOrganizationPreload = () => {
    return {
        insertParentOrganization : (data) => ipcRenderer.invoke('insertParentOrganization', data),
        getParentOrganizationByMrid : (mrid) => ipcRenderer.invoke('getParentOrganizationByMrid', mrid),
        getParentOrganizationByParentMrid : (mrid) => ipcRenderer.invoke('getParentOrganizationByParentMrid', mrid),
        updateParentOrganizationByMrid : (mrid, data) => ipcRenderer.invoke('updateParentOrganizationByMrid', mrid, data),
        deleteParentOrganizationByMrid : (mrid) => ipcRenderer.invoke('deleteParentOrganizationByMrid', mrid),
    }
}