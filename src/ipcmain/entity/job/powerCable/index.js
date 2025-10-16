'use strict'
import { ipcMain } from 'electron'
import { entityFunc } from "@/function"

export const insertPowerCableJob = () => {
    ipcMain.handle('insertPowerCableJob', async function (event, old_data, data) {
        try {
            const rs = await entityFunc.jobEntityFunc.powerCableJob.insertPowerCableJobEntity(old_data, data)
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

export const getPowerCableJobByMrid = () => {
    ipcMain.handle('getPowerCableJobByMrid', async function (event, mrid) {
        try {
            const rs = await entityFunc.jobEntityFunc.powerCableJob.getPowerCableJobEntity(mrid)
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

export const deletePowerCableJobByMrid = () => {
    ipcMain.handle('deletePowerCableJobByMrid', async function (event, data) {
        try {
            const rs = await entityFunc.jobEntityFunc.powerCableJob.deletePowerCableJobEntity(data)
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
    insertPowerCableJob()
    getPowerCableJobByMrid()
    deletePowerCableJobByMrid()
}