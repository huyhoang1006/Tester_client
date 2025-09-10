'use strict'
import {ipcMain} from 'electron'
import {cimFunc} from "@/function"

export const getAnalogByMrid = () => {
    ipcMain.handle('getAnalogByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.analogFunc.getAnalogById(mrid)
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

export const getAllAnalogByProcedure = () => {
    ipcMain.handle('getAllAnalogByProcedure', async function (event, procedureId) {
        try {
            const rs = await cimFunc.analogFunc.getAllAnalogByProcedure(procedureId)
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

export const insertAnalog = () => {
    ipcMain.handle('insertAnalog', async function (event, data) {
        const rs = await cimFunc.analogFunc.insertAnalog(data)
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

export const deleteAnalogByMrid = () => {
    ipcMain.handle('deleteAnalogByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.analogFunc.deleteAnalogById(mrid)
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
    getAnalogByMrid()
    getAllAnalogByProcedure()
    insertAnalog()
    deleteAnalogByMrid()
}