'use strict'
const {ipcRenderer} = require('electron')
export const substationEntityPreload = () => {
    return {
        insertSubstationEntity : (data) => ipcRenderer.invoke('insertSubstationEntity', data),
        getSubstationEntityByMrid : (mrid, user_id, organisation_id) => ipcRenderer.invoke('getSubstationEntityByMrid', mrid, user_id, organisation_id),
        deleteSubstationEntityByMrid : (data) => ipcRenderer.invoke('deleteSubstationEntityByMrid', data)
    }
}