'use strict'
const {ipcRenderer} = require('electron')
export const surgeArresterJobPreload = () => {
    return {
        insertSurgeArresterJob : (old_data, data) => ipcRenderer.invoke('insertSurgeArresterJob', old_data, data),
        getSurgeArresterJobByMrid : (mrid) => ipcRenderer.invoke('getSurgeArresterJobByMrid', mrid),
        deleteSurgeArresterJobByMrid : (mrid) => ipcRenderer.invoke('deleteSurgeArresterJobByMrid', mrid),
    }
}