'use strict'
import {ipcMain} from 'electron'
import {cimFunc} from "@/function"

export const getStringMeasurementByMrid = () => {
    ipcMain.handle('getStringMeasurementByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.stringMeasurementFunc.getStringMeasurementById(mrid)
            if (rs.success === true) {
                return {
                    success: true,
                    message: rs.message || "Success",
                    data: rs.data
                }
            } else {
                return {
                    success: false,
                    message: rs.message || "fail",
                }
            }
        } catch (error) {
            console.log(error)
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const getAllStringMeasurementByProcedure = () => {
    ipcMain.handle('getAllStringMeasurementByProcedure', async function (event, procedureId) {
        try {
            const rs = await cimFunc.stringMeasurementFunc.getAllStringMeasurementByProcedure(procedureId)
            if (rs.success === true) {
                return {
                    success: true,
                    message: rs.message || "Success",
                    data: rs.data
                }
            } else {
                return {
                    success: false,
                    data: rs.data || [],
                    message: rs.message || "fail",
                }
            }
        } catch (error) {
            console.log(error)
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const insertStringMeasurement = () => {
    ipcMain.handle('insertStringMeasurement', async function (event, data) {
        const rs = await cimFunc.stringMeasurementFunc.insertStringMeasurement(data)
        try {
            if (rs.success === true) {
                return {
                    success: true,
                    message: rs.message || "Success",
                    data: rs.data
                }
            } else {
                return {
                    success: false,
                    message: rs.message || "fail",
                }
            }
        } catch (error) {
            console.log(error)
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const deleteStringMeasurementByMrid = () => {
    ipcMain.handle('deleteStringMeasurementByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.stringMeasurementFunc.deleteStringMeasurementById(mrid)
            if (rs.success == true) {
                return {
                    success: true,
                    message: rs.message || "Success",
                }
            } else {
                return {
                    success: false,
                    message: rs.message || "fail",
                }
            }
        } catch (error) {
            console.log(error)
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const active = () => {
    getStringMeasurementByMrid()
    getAllStringMeasurementByProcedure()
    insertStringMeasurement()
    deleteStringMeasurementByMrid()
}