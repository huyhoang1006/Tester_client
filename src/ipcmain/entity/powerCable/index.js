'use strict'
import { ipcMain } from 'electron'
import { entityFunc } from "@/function"

export const insertPowerCableEntity = () => {
    ipcMain.handle('insertPowerCableEntity', async function (event, old_data, data) {
        try {
            const rs = await entityFunc.powerCableEntityFunc.insertPowerCableEntity(old_data, data)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data: rs.data
                }
            }
            else {
                return {
                    success: false,
                    message: "fail",
                }
            }
        } catch (error) {
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const active = () => {
    insertPowerCableEntity()
}
