import { ipcMain } from 'electron'
import { entityFunc } from '@/function'

const wrap = async (handler) => {
    try {
        const rs = await handler()
        if (rs && rs.success === true) {
            return { success: true, data: rs.data, message: rs.message || 'Success' }
        }
        return { success: false, data: rs && rs.data, message: (rs && rs.message) || 'fail' }
    } catch (error) {
        return {
            success: false,
            error,
            message: error && error.message ? error.message : 'Internal error'
        }
    }
}

export const ensureUserOwnership = () => {
    ipcMain.handle('ensureUserOwnership', async (event, userId, identifiedObjectId, mrid = null) => {
        return wrap(() => entityFunc.userIdentifiedObjectFunc.ensureUserIdentifiedObject(
            userId,
            identifiedObjectId,
            mrid
        ))
    })
}

export const getIdentifiedObjectIdsByUser = () => {
    ipcMain.handle('getIdentifiedObjectIdsByUser', async (event, userId) => {
        return wrap(() => entityFunc.userIdentifiedObjectFunc.getIdentifiedObjectIdsByUserId(userId))
    })
}

export const active = () => {
    ensureUserOwnership()
    getIdentifiedObjectIdsByUser()
}
