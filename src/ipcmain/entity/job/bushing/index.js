'use strict'
import {ipcMain} from 'electron'
import {entityFunc} from "@/function"
import { describeFailure } from '@/ipcmain/failureMessage'

export const insertBushingJob = () => {
    ipcMain.handle('insertBushingJob', async function (event,old_data, data) {
        try {
            const rs = await entityFunc.jobEntityFunc.bushingJob.insertBushingJobEntity(old_data, data)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data: rs.data,
                    changed: rs.changed
                }
            }
            else {
                return {
                    success: false,
                    message: describeFailure(rs),
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
                    data: rs.data,
                    changed: rs.changed
                }
            }
            else {
                return {
                    success: false,
                    message: describeFailure(rs),
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
                    message: describeFailure(rs),
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