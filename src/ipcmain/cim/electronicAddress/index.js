'use strict'
import {ipcMain} from 'electron'
import {cimFunc} from "@/function"

export const getElectronicAddressByMrid = () => {
    ipcMain.handle('getElectronicAddressByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.electronicAddressFunc.getElectronicAddressById(mrid)
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

export const insertElectronicAddress = () => {
    ipcMain.handle('insertElectronicAddress', async function (event, data) {
        const rs = await cimFunc.electronicAddressFunc.insertElectronicAddress(data)
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

export const deleteElectronicAddressByMrid = () => {
    ipcMain.handle('deleteElectronicAddressByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.electronicAddressFunc.deleteElectronicAddressById(mrid)
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

export const updateElectronicAddressByMrid = () => {
    ipcMain.handle('updateElectronicAddressByMrid', async function (event, mrid, data) {
        try {
            const rs = await cimFunc.electronicAddressFunc.updateElectronicAddressById(mrid, data)
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
    getElectronicAddressByMrid()
    insertElectronicAddress()
    updateElectronicAddressByMrid()
    deleteElectronicAddressByMrid()
}