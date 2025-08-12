'use strict'
const {ipcRenderer} = require('electron')
export const surgeArresterPreload = () => {
    return {
        getSurgeArresterByMrid : (mrid) => ipcRenderer.invoke('getSurgeArresterByMrid', mrid),
        getSurgeArresterByPsrId : (mrid) => ipcRenderer.invoke('getSurgeArresterByPsrId', mrid),
        insertSurgeArrester : (data) => ipcRenderer.invoke('insertSurgeArrester', data),
        updateSurgeArresterByMrid : (mrid, data) => ipcRenderer.invoke('updateSurgeArresterByMrid', mrid, data),
        deleteSurgeArresterByMrid : (mrid) => ipcRenderer.invoke('deleteSurgeArresterByMrid', mrid),
    }
}