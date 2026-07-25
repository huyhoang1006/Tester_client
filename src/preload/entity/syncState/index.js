'use strict'
const { ipcRenderer } = require('electron')

export const syncStatePreload = () => {
    return {
        getSyncStateByMrid: (nodeMrid) => ipcRenderer.invoke('getSyncStateByMrid', nodeMrid),
        getSyncStatesByMrids: (nodeMrids) => ipcRenderer.invoke('getSyncStatesByMrids', nodeMrids),
        getSyncStatesByStatus: (status) => ipcRenderer.invoke('getSyncStatesByStatus', status),
        upsertSyncState: (data) => ipcRenderer.invoke('upsertSyncState', data),
        markNodeDirty: (nodeMrid, nodeType, lastError) => ipcRenderer.invoke('markNodeDirty', nodeMrid, nodeType, lastError),
        markNodeSyncing: (nodeMrid, nodeType) => ipcRenderer.invoke('markNodeSyncing', nodeMrid, nodeType),
        markNodeSynced: (nodeMrid, nodeType, serverId) => ipcRenderer.invoke('markNodeSynced', nodeMrid, nodeType, serverId),
        markNodeSyncFailed: (nodeMrid, nodeType, error) => ipcRenderer.invoke('markNodeSyncFailed', nodeMrid, nodeType, error),
        deleteSyncStateByMrid: (nodeMrid) => ipcRenderer.invoke('deleteSyncStateByMrid', nodeMrid)
    }
}
