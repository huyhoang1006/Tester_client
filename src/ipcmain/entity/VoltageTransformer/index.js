'use strict'
import { ipcMain } from 'electron'
import { entityFunc } from "@/function"

export const insertVoltageTransformerEntity = () => {
    ipcMain.handle('insertVoltageTransformerEntity', async function (event, old_data, data) {
        try {

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

export const getVoltageTransformerEntityByMrid = () => {
    ipcMain.handle('getVoltageTransformerEntityByMrid', async function (event, mrid, psrId) {
        try {
            const rs = await entityFunc.voltageTransformerEntityFunc.getVoltageTransformerEntityById(mrid, psrId)
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
            console.error("Error retrieving Voltage transformer entity by MRID:", error);
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const deleteVoltageTransformerEntity = () => {
    ipcMain.handle('deleteVoltageTransformerEntity', async function (event, data) {
        try {
            const rs = await entityFunc.voltageTransformerEntityFunc.deleteVoltageTransformerEntity(data)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data : data
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
    insertVoltageTransformerEntity()
    getVoltageTransformerEntityByMrid()
    deleteVoltageTransformerEntity()
}