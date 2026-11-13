'use strict'
const {ipcRenderer} = require('electron')
export const substationEntityPreload = () => {
    return {
        insertSubstationEntity : (data, serverSnapshot) => ipcRenderer.invoke('insertSubstationEntity', data, serverSnapshot),
        getSubstationEntityByMrid : (mrid, user_id, organisation_id) => ipcRenderer.invoke('getSubstationEntityByMrid', mrid, user_id, organisation_id),
        deleteSubstationEntityByMrid : (data) => ipcRenderer.invoke('deleteSubstationEntityByMrid', data),
        moveSubstationToOrganisation : (substationId, organisationId) => ipcRenderer.invoke('moveSubstationToOrganisation', substationId, organisationId)
    }
}
