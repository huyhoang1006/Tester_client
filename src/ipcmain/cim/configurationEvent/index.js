'use strict'
import {ipcMain} from 'electron'
import {cimFunc} from "@/function"

export const getConfigurationEventByMrid = () => {
    ipcMain.handle('getConfigurationEventByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.configurationEventFunc.getConfigurationEventById(mrid)
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

export const getAllConfigurationEvents = () => {
    ipcMain.handle('getAllConfigurationEvents', async function (event) {
        try {
            const rs = await cimFunc.configurationEventFunc.getAllConfigurationEvents()
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

export const insertConfigurationEvent = () => {
    ipcMain.handle('insertConfigurationEvent', async function (event, data) {
        const rs = await cimFunc.configurationEventFunc.insertConfigurationEvent(data)
        try {
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

export const deleteConfigurationEventByMrid = () => {
    ipcMain.handle('deleteConfigurationEventByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.configurationEventFunc.deleteConfigurationEventById(mrid)
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

export const updateConfigurationEventByMrid = () => {
    ipcMain.handle('updateConfigurationEventByMrid', async function (event, mrid, data) {
        try {
            const rs = await cimFunc.configurationEventFunc.updateConfigurationEventById(mrid, data)
            if (rs.success == true) {
                return {
                    success: true,
                    message: rs.message || "Success",
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

export const active = () => {
    getConfigurationEventByMrid()
    getAllConfigurationEvents()
    insertConfigurationEvent()
    updateConfigurationEventByMrid()
    deleteConfigurationEventByMrid()
}