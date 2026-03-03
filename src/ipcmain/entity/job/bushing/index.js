'use strict'
import {ipcMain} from 'electron'
import {entityFunc} from "@/function"

export const insertBushingJob = () => {
    ipcMain.handle('insertBushingJob', async function (event,old_data, data) {
        try {
            const rs = await entityFunc.jobEntityFunc.bushingJob.insertBushingJobEntity(old_data, data)
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

export const getBushingJobByMrid = () => {
    ipcMain.handle('getBushingJobByMrid', async function (event, mrid) {
        try {
            const rs = await entityFunc.jobEntityFunc.bushingJob.getBushingJobEntity(mrid)
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

export const deleteBushingJobByMrid = () => {
    ipcMain.handle('deleteBushingJobByMrid', async function (event, data) {
        try {
            const rs = await entityFunc.jobEntityFunc.bushingJob.deleteBushingJobEntity(data)
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
    insertBushingJob()
    getBushingJobByMrid()
    deleteBushingJobByMrid()
}