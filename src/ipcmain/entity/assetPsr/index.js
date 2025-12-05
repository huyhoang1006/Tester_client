'use strict'
import { ipcMain } from 'electron'
import { entityFunc } from "@/function"

export const getAssetPsrByAssetIdAndPsrId = () => {
    ipcMain.handle('getAssetPsrByAssetIdAndPsrId', async function (event, assetId, psrId) {
        try {
            const rs = await entityFunc.assetPsrFunc.getAssetPsrByAssetIdAndPsrId(assetId, psrId)
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
                    message: rs.message || "fail",
                    data: null
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

export const getAssetPsrById = () => {
    ipcMain.handle('getAssetPsrById', async function (event, mrid) {
        try {
            const rs = await entityFunc.assetPsrFunc.getAssetPsrById(mrid)
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
                    message: rs.message || "fail",
                    data: null
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

export const insertAssetPsr = () => {
    ipcMain.handle('insertAssetPsr', async function (event, data) {
        try {
            const rs = await entityFunc.assetPsrFunc.insertAssetPsr(data)
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

export const updateAssetPsr = () => {
    ipcMain.handle('updateAssetPsr', async function (event, mrid, data) {
        try {
            const rs = await entityFunc.assetPsrFunc.updateAssetPsr(mrid, data)
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

export const deleteAssetPsrById = () => {
    ipcMain.handle('deleteAssetPsrById', async function (event, mrid) {
        try {
            const rs = await entityFunc.assetPsrFunc.deleteAssetPsrById(mrid)
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
    getAssetPsrByAssetIdAndPsrId()
    getAssetPsrById()
    insertAssetPsr()
    updateAssetPsr()
    deleteAssetPsrById()
}
