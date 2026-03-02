'use strict'
import {ipcMain} from 'electron'
import {entityFunc} from "@/function"

export const insertDisconnectorJob = () => {
    ipcMain.handle('insertDisconnectorJob', async function (event,old_data, data) {
        try {
            const rs = await entityFunc.jobEntityFunc.disconnectorJob.insertDisconnectorJobEntity(old_data, data)
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
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const getDisconnectorJobByMrid = () => {
    ipcMain.handle('getDisconnectorJobByMrid', async function (event, mrid) {
        try {
            const rs = await entityFunc.jobEntityFunc.disconnectorJob.getDisconnectorJobEntity(mrid)
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
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const deleteDisconnectorJobByMrid = () => {
    ipcMain.handle('deleteDisconnectorJobByMrid', async function (event, data) {
        try {
            const rs = await entityFunc.jobEntityFunc.disconnectorJob.deleteDisconnectorJobEntity(data)
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
    insertDisconnectorJob()
    getDisconnectorJobByMrid()
    deleteDisconnectorJobByMrid()
}