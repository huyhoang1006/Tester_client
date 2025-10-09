'use strict'
import { ipcMain } from 'electron'
import { entityFunc } from "@/function"

export const insertBushingEntity = () => {
    ipcMain.handle('insertBushingEntity', async function (event, data) {
        try {
            const rs = await entityFunc.bushingEntityFunc.insertBushingEntity(data)
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

export const getBushingEntityByMrid = () => {
    ipcMain.handle('getBushingEntityByMrid', async function (event, mrid, psrId) {
        try {
            const rs = await entityFunc.bushingEntityFunc.getBushingEntityById(mrid, psrId)
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
            console.error("Error retrieving Bushing entity by MRID:", error);
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const deleteBushingEntity = () => {
    ipcMain.handle('deleteBushingEntity', async function (event, data) {
        try {
            const rs = await entityFunc.bushingEntityFunc.deleteBushingEntity(data)
            console.log("Delete bushing entity", rs)
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
    insertBushingEntity()
    getBushingEntityByMrid()
    deleteBushingEntity()
}