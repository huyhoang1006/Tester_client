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

export const getRotatingMachineEntityByMrid = () => {
    ipcMain.handle('getRotatingMachineEntityByMrid', async function (event, mrid, psrId) {
        try {
            const rs = await entityFunc.rotatingMachineEntityFunc.getRotatingMachineEntity(mrid, psrId)
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
            console.error("Error retrieving Power Cable entity by MRID:", error);
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}


export const deleteRotatingMachineEntity = () => {
    ipcMain.handle('deleteRotatingMachineEntity', async function (event, data) {
        try {
            const rs = await entityFunc.rotatingMachineEntityFunc.deleteRotatingMachineEntity(data)
            console.log("Delete rotating machine entity", rs)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data: data
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
    getRotatingMachineEntityByMrid()
    deleteRotatingMachineEntity()
}
