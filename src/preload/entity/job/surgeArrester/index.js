'use strict'
const {ipcRenderer} = require('electron')
export const surgeArresterJobPreload = () => {
    return {
        insertSurgeArresterJob : (old_data, data) => ipcRenderer.invoke('insertSurgeArresterJob', old_data, data),
        getSurgeArresterJobByMrid : (mrid, assetId) => ipcRenderer.invoke('getSurgeArresterJobByMrid', mrid, assetId),
        deleteSurgeArresterJobByMrid : (mrid) => ipcRenderer.invoke('deleteSurgeArresterJobByMrid', mrid),
    }
}