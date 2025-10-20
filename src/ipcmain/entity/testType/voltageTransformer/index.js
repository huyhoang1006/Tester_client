'use strict'
import { ipcMain } from 'electron'
import { entityFunc } from "@/function"

export const insertTestTypeVT = () => {
    ipcMain.handle('insertTestTypeVT', async function (event, data) {
        try {
            const rs = await entityFunc.TestTypeFunc.voltageTransformerTestTypeFunc.insertTestTypeVT(data)
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

export const getTestTypeVTByMrid = () => {
    ipcMain.handle('getTestTypeVTByMrid', async function (event, mrid) {
        try {
            const rs = await entityFunc.TestTypeFunc.voltageTransformerTestTypeFunc.getTestTypeVTByMrid(mrid)
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

export const getAllTestTypeVTs = () => {
    ipcMain.handle('getAllTestTypeVTs', async function (event) {
        try {
            const rs = await entityFunc.TestTypeFunc.voltageTransformerTestTypeFunc.getAllTestTypeVT()
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

export const updateTestTypeVTByMrid = () => {
    ipcMain.handle('updateTestTypeVTByMrid', async function (event, mrid, data) {
        try {
            const rs = await entityFunc.TestTypeFunc.voltageTransformerTestTypeFunc.updateTestTypeVTById(mrid, data)
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

export const deleteTestTypeVTByMrid = () => {
    ipcMain.handle('deleteTestTypeVTByMrid', async function (event, mrid) {
        try {
            const rs = await entityFunc.TestTypeFunc.voltageTransformerTestTypeFunc.deleteTestTypeVTById(mrid)
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
    insertTestTypeVT()
    getTestTypeVTByMrid()
    getAllTestTypeVTs()
    updateTestTypeVTByMrid()
    deleteTestTypeVTByMrid()
}