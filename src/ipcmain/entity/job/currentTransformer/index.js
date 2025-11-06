'use strict'
import { ipcMain } from 'electron'
import { entityFunc } from "@/function"

export const insertCurrentTransformerJob = () => {
    ipcMain.handle('insertCurrentTransformerJob', async function (event, old_data, data) {
        try {
            const rs = await entityFunc.jobEntityFunc.currentTransformerJob.insertCurrentTransformerJobEntity(old_data, data)
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

export const getCurrentTransformerJobByMrid = () => {
    ipcMain.handle('getCurrentTransformerJobByMrid', async function (event, mrid) {
        try {
            const rs = await entityFunc.jobEntityFunc.currentTransformerJob.getCurrentTransformerJobEntity(mrid)
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

export const deleteCurrentTransformerJobByMrid = () => {
    ipcMain.handle('deleteCurrentTransformerJobByMrid', async function (event, data) {
        try {
            const rs = await entityFunc.jobEntityFunc.currentTransformerJob.deleteCurrentTransformerJobEntity(data)
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
    insertCurrentTransformerJob()
    getCurrentTransformerJobByMrid()
    deleteCurrentTransformerJobByMrid()
}