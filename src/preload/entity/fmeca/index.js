'use strict'
const { ipcRenderer } = require('electron')

export const fmecaPreload = () => ({
    getFmecaById: (id, userId) => ipcRenderer.invoke('getFmecaById', id, userId),
    getFmecaByServerId: (serverId, userId) => ipcRenderer.invoke('getFmecaByServerId', serverId, userId),
    listFmeca: (userId) => ipcRenderer.invoke('listFmeca', userId),
    saveFmeca: (record, userId) => ipcRenderer.invoke('saveFmeca', record, userId)
})
