'use strict'
import { ipcMain } from 'electron'
import { entityFunc } from "@/function"

export const insertVoltageTransformerEntity = () => {
    ipcMain.handle('insertVoltageTransformerEntity', async function (event, old_data, data) {
        try {

            console.log('Point 2');
            const rs = await entityFunc.voltageTransformerEntityFunc.insertVoltageTransformerEntity(old_data, data)
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
            console.log(error)
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const active = () => {
    insertVoltageTransformerEntity()
}