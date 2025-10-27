'use strict'
import { ipcMain } from 'electron'
import { entityFunc } from "@/function"

export const insertTestTypeDisconnector = () => {
    ipcMain.handle('insertTestTypeDisconnector', async function (event, data) {
        try {
            const rs = await entityFunc.TestTypeFunc.disconnectorTestTypeFunc.insertTestTypeDisconnector(data)
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

export const getTestTypeDisconnectorByMrid = () => {
    ipcMain.handle('getTestTypeDisconnectorByMrid', async function (event, mrid) {
        try {
            const rs = await entityFunc.TestTypeFunc.disconnectorTestTypeFunc.getTestTypeDisconnectorByMrid(mrid)
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

export const getAllTestTypeDisconnector = () => {
    ipcMain.handle('getAllTestTypeDisconnector', async function (event) {
        try {
            const rs = await entityFunc.TestTypeFunc.disconnectorTestTypeFunc.getAllTestTypeDisconnector()
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

export const updateTestTypeDisconnectorByMrid = () => {
    ipcMain.handle('updateTestTypeDisconnectorByMrid', async function (event, mrid, data) {
        try {
            const rs = await entityFunc.TestTypeFunc.disconnectorTestTypeFunc.updateTestTypeDisconnectorById(mrid, data)
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

export const deleteTestTypeDisconnectorByMrid = () => {
    ipcMain.handle('deleteTestTypeDisconnectorByMrid', async function (event, mrid) {
        try {
            const rs = await entityFunc.TestTypeFunc.disconnectorTestTypeFunc.deleteTestTypeDisconnectorById(mrid)
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
    insertTestTypeDisconnector()
    getTestTypeDisconnectorByMrid()
    getAllTestTypeDisconnector()
    updateTestTypeDisconnectorByMrid()
    deleteTestTypeDisconnectorByMrid()
}