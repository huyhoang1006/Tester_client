'use strict'
import { ipcMain } from 'electron'
import { entityFunc } from "@/function"

export const insertTestTypePowerCable = () => {
    ipcMain.handle('insertTestTypePowerCable', async function (event, data) {
        try {
            const rs = await entityFunc.TestTypeFunc.powerCableTestTypeFunc.insertTestTypePowerCable(data)
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

export const getTestTypePowerCableByMrid = () => {
    ipcMain.handle('getTestTypePowerCableByMrid', async function (event, mrid) {
        try {
            const rs = await entityFunc.TestTypeFunc.powerCableTestTypeFunc.getTestTypePowerCableByMrid(mrid)
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

export const getAllTestTypePowerCable = () => {
    ipcMain.handle('getAllTestTypePowerCable', async function (event) {
        try {
            const rs = await entityFunc.TestTypeFunc.powerCableTestTypeFunc.getAllTestTypePowerCable()
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

export const updateTestTypePowerCableByMrid = () => {
    ipcMain.handle('updateTestTypePowerCableByMrid', async function (event, mrid, data) {
        try {
            const rs = await entityFunc.TestTypeFunc.powerCableTestTypeFunc.updateTestTypePowerCableById(mrid, data)
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

export const deleteTestTypePowerCableByMrid = () => {
    ipcMain.handle('deleteTestTypePowerCableByMrid', async function (event, mrid) {
        try {
            const rs = await entityFunc.TestTypeFunc.powerCableTestTypeFunc.deleteTestTypePowerCableById(mrid)
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


export const active = () => {
    insertTestTypePowerCable()
    getTestTypePowerCableByMrid()
    getAllTestTypePowerCable()
    updateTestTypePowerCableByMrid()
    deleteTestTypePowerCableByMrid()
}