'use strict'
const {ipcRenderer} = require('electron')
export const surgeArresterEntityPreload = () => {
    return {
        insertSurgeArresterEntity : (old_data, data) => ipcRenderer.invoke('insertSurgeArresterEntity', old_data, data),
        getSurgeArresterEntityByMrid : (mrid, psr_id) => ipcRenderer.invoke('getSurgeArresterEntityByMrid', mrid, psr_id),
        deleteSurgeArresterEntityByMrid : (data) => ipcRenderer.invoke('deleteSurgeArresterEntityByMrid', data)
    }
}