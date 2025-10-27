'use strict'
import { ipcMain } from 'electron'
import { entityFunc } from "@/function"

export const insertCapacitorEntity = () => {
    ipcMain.handle('insertCapacitorEntity', async function (event, old_data, data) {
        try {
            const rs = await entityFunc.capacitorEntityFunc.insertCapacitorEntity(old_data, data)
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

export const getCapacitorEntityByMrid = () => {
    ipcMain.handle('getCapacitorEntityByMrid', async function (event, mrid, psrId) {
        try {
            const rs = await entityFunc.capacitorEntityFunc.getCapacitorEntity(mrid, psrId)
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


export const deleteCapacitorEntity = () => {
    ipcMain.handle('deleteCapacitorEntity', async function (event, data) {
        try {
            const rs = await entityFunc.capacitorEntityFunc.deleteCapacitorEntity(data)
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
    insertCapacitorEntity()
    getCapacitorEntityByMrid()
    deleteCapacitorEntity()
}
