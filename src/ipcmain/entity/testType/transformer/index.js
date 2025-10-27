'use strict'
import { ipcMain } from 'electron'
import { entityFunc } from "@/function"

export const insertTestTypeTransformer = () => {
    ipcMain.handle('insertTestTypeTransformer', async function (event, data) {
        try {
            const rs = await entityFunc.TestTypeFunc.transformerTestTypeFunc.insertTestTypeTransformer(data)
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

export const getTestTypeTransformerByMrid = () => {
    ipcMain.handle('getTestTypeTransformerByMrid', async function (event, mrid) {
        try {
            const rs = await entityFunc.TestTypeFunc.transformerTestTypeFunc.getTestTypeTransformerByMrid(mrid)
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

export const getAllTestTypeTransformers = () => {
    ipcMain.handle('getAllTestTypeTransformers', async function (event) {
        try {
            const rs = await entityFunc.TestTypeFunc.transformerTestTypeFunc.getAllTestTypeTransformer()
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

export const updateTestTypeTransformerByMrid = () => {
    ipcMain.handle('updateTestTypeTransformerByMrid', async function (event, mrid, data) {
        try {
            const rs = await entityFunc.TestTypeFunc.transformerTestTypeFunc.updateTestTypeTransformerById(mrid, data)
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

export const deleteTestTypeTransformerByMrid = () => {
    ipcMain.handle('deleteTestTypeTransformerByMrid', async function (event, mrid) {
        try {
            const rs = await entityFunc.TestTypeFunc.transformerTestTypeFunc.deleteTestTypeTransformerById(mrid)
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
    insertTestTypeTransformer()
    getTestTypeTransformerByMrid()
    getAllTestTypeTransformers()
    updateTestTypeTransformerByMrid()
    deleteTestTypeTransformerByMrid()
}