'use strict'
import { ipcMain } from 'electron'
import { entityFunc } from "@/function"

export const insertBreakerEntity = () => {
    ipcMain.handle('insertBreakerEntity', async function (event, old_data, data) {
        try {
            const rs = await entityFunc.breakerEntityFunc.insertBreakerEntity(old_data, data)
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

export const getBreakerEntityByMrid = () => {
    ipcMain.handle('getBreakerEntityByMrid', async function (event, mrid, psrId) {
        try {
            const rs = await entityFunc.breakerEntityFunc.getBreakerEntity(mrid, psrId)
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


export const deleteBreakerEntity = () => {
    ipcMain.handle('deleteBreakerEntity', async function (event, data) {
        try {
            const rs = await entityFunc.breakerEntityFunc.deleteBreakerEntity(data)
            console.log("Delete capacitor entity", rs)
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
    insertBreakerEntity()
    getBreakerEntityByMrid()
    deleteBreakerEntity()
}
