'use strict'
import { ipcMain } from 'electron'
import { entityFunc } from '@/function'

export const active = () => {
    ipcMain.handle('getFmecaById', (_event, id, userId) => entityFunc.fmecaFunc.getFmecaById(id, userId))
    ipcMain.handle('getFmecaByServerId', (_event, serverId, userId) => (
        entityFunc.fmecaFunc.getFmecaByServerId(serverId, userId)
    ))
    ipcMain.handle('listFmeca', (_event, userId) => entityFunc.fmecaFunc.listFmeca(userId))
    ipcMain.handle('saveFmeca', (_event, record, userId) => entityFunc.fmecaFunc.saveFmeca(record, userId))
}
