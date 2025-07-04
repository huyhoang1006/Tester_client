'use strict'
const {ipcRenderer} = require('electron')
export const substationPreload = () => {
    return {
        getSubstationByMrid : (mrid) => ipcRenderer.invoke('getSubstationByMrid', mrid),
        getSubstationsInOrganisationForUser : (mrid, user_id) => ipcRenderer.invoke('getSubstationsInOrganisationForUser', mrid, user_id),
        insertSubstation : (data) => ipcRenderer.invoke('insertSubstation', data),
        updateSubstationByMrid : (mrid, data) => ipcRenderer.invoke('updateSubstationByMrid', mrid, data),
        deleteSubstationByMrid : (mrid) => ipcRenderer.invoke('deleteSubstationByMrid', mrid),
    }
}