'use strict'
import { ipcMain } from 'electron'
import { cimFunc } from "@/function"

export const getPowerCableByMrid = () => {
    ipcMain.handle('getPowerCableByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.powerCableFunc.getPowerCableById(mrid)
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

export const insertPowerCable = () => {
    ipcMain.handle('insertPowerCable', async function (event, data) {
        try {
            const rs = await cimFunc.powerCableFunc.insertPowerCable(data)
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


export const updatePowerCableByMrid = () => {
    ipcMain.handle('updatePowerCableByMrid', async function (event, mrid, data) {
        try {
            const rs = await cimFunc.powerCableFunc.updatePowerCable(mrid, data)
            if (rs.success == true) {
                return {
                    success: true,
                    message: rs.message || "Success",
                    data: rs.data
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

export const deletePowerCableByMrid = () => {
    ipcMain.handle('deletePowerCableByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.powerCableFunc.deletePowerCableById(mrid)
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

export const getPowerCableByPsrId = () => {
    ipcMain.handle('getPowerCableByPsrId', async function (event, psrId) {
        try {
            const rs = await cimFunc.powerCableFunc.getPowerCableByPsrId(psrId)
            if (rs.success == true) {
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

export const active = () => {
    getPowerCableByMrid()
    getPowerCableByPsrId()
    insertPowerCable()
    updatePowerCableByMrid()
    deletePowerCableByMrid()
}