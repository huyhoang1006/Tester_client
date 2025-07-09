'use strict'
import {ipcMain} from 'electron'
import {cimFunc} from "@/function"

export const getTelephoneNumberByMrid = () => {
    ipcMain.handle('getTelephoneNumberByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.telephoneNumberFunc.getTelephoneNumberById(mrid)
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

export const insertTelephoneNumber = () => {
    ipcMain.handle('insertTelephoneNumber', async function (event, data) {
        const rs = await cimFunc.telephoneNumberFunc.insertTelephoneNumber(data)
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

export const deleteTelephoneNumberByMrid = () => {
    ipcMain.handle('deleteTelephoneNumberByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.telephoneNumberFunc.deleteTelephoneNumberById(mrid)
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

export const updateTelephoneNumberByMrid = () => {
    ipcMain.handle('updateTelephoneNumberByMrid', async function (event, mrid, data) {
        try {
            const rs = await cimFunc.telephoneNumberFunc.updateTelephoneNumberById(mrid, data)
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
    getTelephoneNumberByMrid()
    insertTelephoneNumber()
    updateTelephoneNumberByMrid()
    deleteTelephoneNumberByMrid()
}