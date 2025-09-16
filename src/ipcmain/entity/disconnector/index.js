'use strict'
import { ipcMain } from 'electron'
import { entityFunc } from "@/function"

/**
 * Insert DisconnectorEntity
 */
export const insertDisconnectorEntity = () => {
    ipcMain.handle('insertDisconnectorEntity', async (event, data) => {
        try {
           
            const rs = await entityFunc.disconnectorEntityFunc.insertDisconnectorEntity(data)
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
    ipcMain.handle('getDisconnectorEntityByMrid', async function (event, mrid, psrId) {
        try {
            const rs = await entityFunc.disconnectorEntityFunc.getDisconnectorEntityById(mrid, psrId)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data : rs.data
                }
            }
            else {
                return {
                    success: false,
                    message: "fail",
                }
            }
        } catch (error) {
            console.error("Error retrieving Disconnector entity by MRID:", error);
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
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
}
