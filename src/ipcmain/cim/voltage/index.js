'use strict'
import {ipcMain} from 'electron'
import {cimFunc} from "@/function"

export const getVoltageByMrid = () => {
    ipcMain.handle('getVoltageByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.voltageFunc.getVoltageById(mrid)
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

export const insertVoltage = () => {
    ipcMain.handle('insertVoltage', async function (event, data) {
        const rs = await cimFunc.voltageFunc.insertVoltage(data)
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


export const updateVoltageByMrid = () => {
    ipcMain.handle('updateVoltageByMrid', async function (event, mrid, data) {
        try {
            const rs = await cimFunc.voltageFunc.updateVoltageById(mrid, data)
            if (rs.success == true) {
                return {
                    success: true,
                    message: rs.message || "Success",
                    data : rs.data
                }
            }
            else {
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

export const deleteVoltageByMrid = () => {
    ipcMain.handle('deleteVoltageByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.voltageFunc.deleteVoltageById(mrid)
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
    getVoltageByMrid()
    insertVoltage()
    updateVoltageByMrid()
    deleteVoltageByMrid()
}