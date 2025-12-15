'use strict'
import {ipcMain} from 'electron'
import {entityFunc} from "@/function"

export const insertSurgeArresterJob = () => {
    ipcMain.handle('insertSurgeArresterJob', async function (event,old_data, data) {
        try {
            const rs = await entityFunc.jobEntityFunc.surgeArresterJob.insertSurgeArresterJobEntity(old_data, data)
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

export const getSurgeArresterJobByMrid = () => {
    ipcMain.handle('getSurgeArresterJobByMrid', async function (event, mrid, assetId) {
        try {
            const rs = await entityFunc.jobEntityFunc.surgeArresterJob.getSurgeArresterJobEntity(mrid, assetId)
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

export const deleteSurgeArresterJobByMrid = () => {
    ipcMain.handle('deleteSurgeArresterJobByMrid', async function (event, data) {
        try {
            const rs = await entityFunc.jobEntityFunc.surgeArresterJob.deleteSurgeArresterJobEntity(data)
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
    insertSurgeArresterJob()
    getSurgeArresterJobByMrid()
    deleteSurgeArresterJobByMrid()
}