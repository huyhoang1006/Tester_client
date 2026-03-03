'use strict'
import {ipcMain} from 'electron'
import {entityFunc} from "@/function"

export const insertRotatingMachineJob = () => {
    ipcMain.handle('insertRotatingMachineJob', async function (event,old_data, data) {
        try {
            const rs = await entityFunc.jobEntityFunc.rotatingMachineJob.insertRotatingMachineJobEntity(old_data, data)
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

export const getRotatingMachineJobByMrid = () => {
    ipcMain.handle('getRotatingMachineJobByMrid', async function (event, mrid) {
        try {
            const rs = await entityFunc.jobEntityFunc.rotatingMachineJob.getRotatingMachineJobEntity(mrid)
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

export const deleteRotatingMachineJobByMrid = () => {
    ipcMain.handle('deleteRotatingMachineJobByMrid', async function (event, data) {
        try {
            const rs = await entityFunc.jobEntityFunc.rotatingMachineJob.deleteRotatingMachineJobEntity(data)
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
    insertRotatingMachineJob()
    getRotatingMachineJobByMrid()
    deleteRotatingMachineJobByMrid()
}