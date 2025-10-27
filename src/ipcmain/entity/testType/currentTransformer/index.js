'use strict'
import { ipcMain } from 'electron'
import { entityFunc } from "@/function"

export const insertTestTypeCT = () => {
    ipcMain.handle('insertTestTypeCT', async function (event, data) {
        try {
            const rs = await entityFunc.TestTypeFunc.currentTransformerTestTypeFunc.insertTestTypeCT(data)
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

export const getTestTypeCTByMrid = () => {
    ipcMain.handle('getTestTypeCTByMrid', async function (event, mrid) {
        try {
            const rs = await entityFunc.TestTypeFunc.currentTransformerTestTypeFunc.getTestTypeCTByMrid(mrid)
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

export const getAllTestTypeCT = () => {
    ipcMain.handle('getAllTestTypeCT', async function (event) {
        try {
            const rs = await entityFunc.TestTypeFunc.currentTransformerTestTypeFunc.getAllTestTypeCT()
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

export const updateTestTypeCTByMrid = () => {
    ipcMain.handle('updateTestTypeCTByMrid', async function (event, mrid, data) {
        try {
            const rs = await entityFunc.TestTypeFunc.currentTransformerTestTypeFunc.updateTestTypeCTById(mrid, data)
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

export const deleteTestTypeCTByMrid = () => {
    ipcMain.handle('deleteTestTypeCTByMrid', async function (event, mrid) {
        try {
            const rs = await entityFunc.TestTypeFunc.currentTransformerTestTypeFunc.deleteTestTypeCTById(mrid)
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
    insertTestTypeCT()
    getTestTypeCTByMrid()
    getAllTestTypeCT()
    updateTestTypeCTByMrid()
    deleteTestTypeCTByMrid()
}