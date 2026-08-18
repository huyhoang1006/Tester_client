'use strict'
const { ipcRenderer } = require('electron')

export const userIdentifiedObjectPreload = () => ({
    ensureUserOwnership: (userId, identifiedObjectId, mrid = null) =>
        ipcRenderer.invoke('ensureUserOwnership', userId, identifiedObjectId, mrid),
    getIdentifiedObjectIdsByUser: (userId) =>
        ipcRenderer.invoke('getIdentifiedObjectIdsByUser', userId)
})
