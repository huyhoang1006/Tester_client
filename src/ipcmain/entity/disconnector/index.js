'use strict'
import { ipcMain } from 'electron'
import { entityFunc } from "@/function"

/**
 * Insert DisconnectorEntity
 */
export const insertDisconnectorEntity = () => {
    ipcMain.handle('insertDisconnectorEntity', async (event, old_data, data) => {
        try {
           
            const rs = await entityFunc.disconnectorEntityFunc.insertDisconnectorEntity(old_data, data)
            try {
                console.log('[Disconnector][IPC] insertDisconnectorEntity result:', {
                    success: rs && rs.success,
                    message: rs && rs.message,
                })
            } catch (logErr) {
                console.log('[Disconnector][IPC] result log error', (logErr && logErr.message) || logErr)
            }
            return {
                success: rs.success === true,
                message: rs.success ? "Insert DisconnectorEntity success" : "Insert DisconnectorEntity failed",
                data: rs.data || null
            }
        } catch (error) {
            return {
                success: false,
                message: (error && error.message) || "Internal error",
                error
            }
        }
    })
}

/**
 * Get DisconnectorEntity by MRID
 */
export const getDisconnectorEntityByMrid = () => {
    ipcMain.handle('getDisconnectorEntityByMrid', async (event, mrid, user_id, organisation_id) => {
        try {
            const rs = await entityFunc.disconnectorEntityFunc.getDisconnectorEntityById(mrid, user_id, organisation_id)
            return {
                success: rs.success === true,
                message: rs.success ? "Get DisconnectorEntity success" : "Get DisconnectorEntity failed",
                data: rs.data || null
            }
        } catch (error) {
            return {
                success: false,
                message: (error && error.message) || "Internal error",
                error
            }
        }
    })
}

/**
 * Delete DisconnectorEntity by MRID
 */
export const deleteDisconnectorEntityByMrid = () => {
    ipcMain.handle('deleteDisconnectorEntityByMrid', async (event, mrid) => {
        try {
            const rs = await entityFunc.disconnectorEntityFunc.deleteDisconnectorEntityById(mrid)
            return {
                success: rs.success === true,
                message: rs.success ? "Delete DisconnectorEntity success" : "Delete DisconnectorEntity failed",
                data: rs.success ? mrid : null
            }
        } catch (error) {
            return {
                success: false,
                message: (error && error.message) || "Internal error",
                error
            }
        }
    })
}

/**
 * Active handlers
 */
export const active = () => {
    insertDisconnectorEntity()
    getDisconnectorEntityByMrid()
    deleteDisconnectorEntityByMrid()
}
