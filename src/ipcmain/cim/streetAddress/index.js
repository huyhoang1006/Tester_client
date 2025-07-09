'use strict'
import {ipcMain} from 'electron'
import {cimFunc} from "@/function"

export const getStreetAddressByMrid = () => {
    ipcMain.handle('getStreetAddressByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.streetAddressFunc.getStreetAddressById(mrid)
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

export const insertStreetAddress = () => {
    ipcMain.handle('insertStreetAddress', async function (event, data) {
        const rs = await cimFunc.streetAddressFunc.insertStreetAddress(data)
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

export const deleteStreetAddressByMrid = () => {
    ipcMain.handle('deleteStreetAddressByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.streetAddressFunc.deleteStreetAddressById(mrid)
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

export const updateStreetAddressByMrid = () => {
    ipcMain.handle('updateStreetAddressByMrid', async function (event, mrid, data) {
        try {
            const rs = await cimFunc.streetAddressFunc.updateStreetAddressById(mrid, data)
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
    getStreetAddressByMrid()
    insertStreetAddress()
    updateStreetAddressByMrid()
    deleteStreetAddressByMrid()
}