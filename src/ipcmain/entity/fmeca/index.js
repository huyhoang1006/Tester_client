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
    ipcMain.handle('createFmeca', (_event, input, userId) => entityFunc.fmecaFunc.createFmeca(input, userId))
    ipcMain.handle('updateFmeca', (_event, record, userId) => entityFunc.fmecaFunc.updateFmeca(record, userId))
    ipcMain.handle('renameFmeca', (_event, id, name, userId) => (
        entityFunc.fmecaFunc.renameFmeca(id, name, userId)
    ))
    ipcMain.handle('deleteFmeca', (_event, id, userId) => entityFunc.fmecaFunc.deleteFmeca(id, userId))
    ipcMain.handle('setHiFmeca', (_event, id, userId) => entityFunc.fmecaFunc.setHiFmeca(id, userId))
}
