'use strict'
import { ipcMain } from 'electron'
import { cimFunc } from "@/function"

export const getOtherByMrid = () => {
    ipcMain.handle('getOtherByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.otherFunc.getOtherById(mrid)
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

export const insertOther = () => {
    ipcMain.handle('insertOther', async function (event, data) {
        try {
            const rs = await cimFunc.otherFunc.insertOther(data)
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

export const updateOtherByMrid = () => {
    ipcMain.handle('updateOtherByMrid', async function (event, mrid, data) {
        try {
            const rs = await cimFunc.otherFunc.updateOtherById(mrid, data)
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

export const deleteOtherByMrid = () => {
    ipcMain.handle('deleteOtherByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.otherFunc.deleteOtherById(mrid)
            if (rs.success === true) {
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
    getOtherByMrid()
    insertOther()
    updateOtherByMrid()
    deleteOtherByMrid()
}
