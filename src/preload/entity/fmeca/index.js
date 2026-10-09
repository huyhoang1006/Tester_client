'use strict'
const { ipcRenderer } = require('electron')

export const fmecaPreload = () => ({
    getFmecaById: (id, userId) => ipcRenderer.invoke('getFmecaById', id, userId),
    getFmecaByServerId: (serverId, userId) => ipcRenderer.invoke('getFmecaByServerId', serverId, userId),
    listFmeca: (userId) => ipcRenderer.invoke('listFmeca', userId),
    saveFmeca: (record, userId) => ipcRenderer.invoke('saveFmeca', record, userId),
    createFmeca: (input, userId) => ipcRenderer.invoke('createFmeca', input, userId),
    updateFmeca: (record, userId) => ipcRenderer.invoke('updateFmeca', record, userId),
    renameFmeca: (id, name, userId) => ipcRenderer.invoke('renameFmeca', id, name, userId),
    deleteFmeca: (id, userId) => ipcRenderer.invoke('deleteFmeca', id, userId),
    setHiFmeca: (id, userId) => ipcRenderer.invoke('setHiFmeca', id, userId)
})
