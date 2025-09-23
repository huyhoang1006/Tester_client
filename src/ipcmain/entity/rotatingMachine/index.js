'use strict'
import { ipcMain } from 'electron'
import { entityFunc } from "@/function"

export const insertRotatingMachineEntity = () => {
    ipcMain.handle('insertRotatingMachineEntity', async function (event, data) {
        try {
            const rs = await entityFunc.rotatingMachineEntityFunc.insertRotatingMachineEntity(data)
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
    insertRotatingMachineEntity()
}
