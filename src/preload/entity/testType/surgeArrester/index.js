'use strict'
const {ipcRenderer} = require('electron')
export const testTypeSurgeArresterPreload = () => {
    return {
        insertTestTypeSurgeArrester : (data) => ipcRenderer.invoke('insertTestTypeSurgeArrester', data),
        getTestTypeSurgeArresterByMrid : (mrid) => ipcRenderer.invoke('getTestTypeSurgeArresterByMrid', mrid),
        deleteTestTypeSurgeArresterByMrid : (mrid) => ipcRenderer.invoke('deleteTestTypeSurgeArresterByMrid', mrid),
        getAllTestTypeSurgeArrester : () => ipcRenderer.invoke('getAllTestTypeSurgeArrester'),
        updateTestTypeSurgeArresterByMrid : (mrid, data) => ipcRenderer.invoke('updateTestTypeSurgeArresterByMrid', mrid, data),
    }
}