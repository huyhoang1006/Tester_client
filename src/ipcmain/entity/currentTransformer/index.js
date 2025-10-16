'use strict'
import { ipcMain } from 'electron'
import { entityFunc } from "@/function"

export const insertCurrentTransformerEntity = () => {
    ipcMain.handle('insertCurrentTransformerEntity', async function (event, old_data, data) {
        try {
            const rs = await entityFunc.currentTransformerEntityFunc.insertCurrentTransformerEntity(old_data, data)
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
        }
        catch (error) {
            console.log(error)
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const getCurrentTransformerEntityByMrid = () => {
    ipcMain.handle('getCurrentTransformerEntityByMrid', async function (event, mrid, psrId) {
        try {
            const rs = await entityFunc.currentTransformerEntityFunc.getCurrentTransformerEntityById(mrid, psrId)
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
        }
        catch (error) {
            console.error("Error retrieving Current transformer entity by MRID:", error);
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const deleteCurrentTransformerEntity = () => {
    ipcMain.handle('deleteCurrentTransformerEntity', async function (event, data) {
        try {
            console.log('Delete current transformer entity in ipcMain')
            const rs = await entityFunc.currentTransformerEntityFunc.deleteCurrentTransformerEntity(data)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data : data
                }
            }else {
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
    insertCurrentTransformerEntity()
    getCurrentTransformerEntityByMrid()
    deleteCurrentTransformerEntity()
}