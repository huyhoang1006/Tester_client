'use strict'
import { ipcMain } from 'electron'
import { entityFunc } from "@/function"

export const insertVoltageTransformerJob = () => {
    ipcMain.handle('insertVoltageTransformerJob', async function (event, old_data, data) {
        try {
            const rs = await entityFunc.jobEntityFunc.voltageTransformerJob.insertVoltageTransformerJobEntity(old_data, data)
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

export const getVoltageTransformerJobByMrid = () => {
    ipcMain.handle('getVoltageTransformerJobByMrid', async function (event, mrid) {
        try {
            const rs = await entityFunc.jobEntityFunc.voltageTransformerJob.getVoltageTransformerJobEntity(mrid)
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

export const deleteVoltageTransformerJobByMrid = () => {
    ipcMain.handle('deleteVoltageTransformerJobByMrid', async function (event, data) {
        try {
            const rs = await entityFunc.jobEntityFunc.voltageTransformerJob.deleteVoltageTransformerJobEntity(data)
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
    insertVoltageTransformerJob()
    getVoltageTransformerJobByMrid()
    deleteVoltageTransformerJobByMrid()
}