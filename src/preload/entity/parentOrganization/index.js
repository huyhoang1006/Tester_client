'use strict'
const {ipcRenderer} = require('electron')
export const parentOrganizationEntityPreload = () => {
    return {
        insertParentOrganizationEntity : (data) => ipcRenderer.invoke('insertParentOrganizationEntity', data),
    }
}