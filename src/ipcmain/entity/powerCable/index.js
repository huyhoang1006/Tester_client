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

export const getPowerCableEntityByMrid = () => {
    ipcMain.handle('getPowerCableEntityByMrid', async function (event, mrid, psrId) {
        try {
            const rs = await entityFunc.powerCableEntityFunc.getPowerCableEntity(mrid, psrId)
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


export const deletePowerCableEntity = () => {
    ipcMain.handle('deletePowerCableEntity', async function (event, data) {
        try {
            const rs = await entityFunc.powerCableEntityFunc.deletePowerCableEntity(data)
            console.log("Delete power cable entity", rs)
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
    insertPowerCableEntity()
    getPowerCableEntityByMrid()
    deletePowerCableEntity()
}
