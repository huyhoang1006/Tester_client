'use strict'
const {ipcRenderer} = require('electron')
export const surgeArresterJobPreload = () => {
    return {
        insertSurgeArresterJob : (old_data, data) => ipcRenderer.invoke('insertSurgeArresterJob', old_data, data),
        getSurgeArresterJobByMrid : (mrid, assetId) => ipcRenderer.invoke('getSurgeArresterJobByMrid', mrid),
        deleteSurgeArresterJobByMrid : (data) => ipcRenderer.invoke('deleteSurgeArresterJobByMrid', data),
    }
}