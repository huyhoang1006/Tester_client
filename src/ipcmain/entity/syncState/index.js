'use strict'
import { ipcMain } from 'electron'
import { entityFunc } from '@/function'

const wrap = async (handler) => {
    try {
        const rs = await handler()
        if (rs && rs.success === true) {
            return {
                success: true,
                message: rs.message || 'Success',
                data: rs.data,
                changed: rs.changed
            }
        }
        return {
            success: false,
            message: (rs && rs.message) || 'fail',
            data: rs && rs.data
        }
    } catch (error) {
        console.log(error)
        return {
            error,
            success: false,
            message: error && error.message ? error.message : 'Internal error'
        }
    }
}

export const getSyncStateByMrid = () => {
    ipcMain.handle('getSyncStateByMrid', async (event, nodeMrid) => {
        return wrap(() => entityFunc.syncStateFunc.getSyncStateByMrid(nodeMrid))
    })
}

export const getSyncStatesByMrids = () => {
    ipcMain.handle('getSyncStatesByMrids', async (event, nodeMrids) => {
        return wrap(() => entityFunc.syncStateFunc.getSyncStatesByMrids(nodeMrids))
    })
}

export const getSyncStatesByStatus = () => {
    ipcMain.handle('getSyncStatesByStatus', async (event, status) => {
        return wrap(() => entityFunc.syncStateFunc.getSyncStatesByStatus(status))
    })
}

export const upsertSyncState = () => {
    ipcMain.handle('upsertSyncState', async (event, data) => {
        return wrap(() => entityFunc.syncStateFunc.upsertSyncState(data))
    })
}

export const markNodeDirty = () => {
    ipcMain.handle('markNodeDirty', async (event, nodeMrid, nodeType, lastError) => {
        return wrap(() => entityFunc.syncStateFunc.markNodeDirty(nodeMrid, nodeType, lastError))
    })
}

export const markNodeSyncing = () => {
    ipcMain.handle('markNodeSyncing', async (event, nodeMrid, nodeType) => {
        return wrap(() => entityFunc.syncStateFunc.markNodeSyncing(nodeMrid, nodeType))
    })
}

export const markNodeSynced = () => {
    ipcMain.handle('markNodeSynced', async (event, nodeMrid, nodeType, serverId) => {
        return wrap(() => entityFunc.syncStateFunc.markNodeSynced(nodeMrid, nodeType, serverId))
    })
}

export const markNodeSyncFailed = () => {
    ipcMain.handle('markNodeSyncFailed', async (event, nodeMrid, nodeType, error) => {
        return wrap(() => entityFunc.syncStateFunc.markNodeSyncFailed(nodeMrid, nodeType, error))
    })
}

export const deleteSyncStateByMrid = () => {
    ipcMain.handle('deleteSyncStateByMrid', async (event, nodeMrid) => {
        return wrap(() => entityFunc.syncStateFunc.deleteSyncStateByMrid(nodeMrid))
    })
}

export const active = () => {
    getSyncStateByMrid()
    getSyncStatesByMrids()
    getSyncStatesByStatus()
    upsertSyncState()
    markNodeDirty()
    markNodeSyncing()
    markNodeSynced()
    markNodeSyncFailed()
    deleteSyncStateByMrid()
}
