'use strict'
import {ipcMain} from 'electron'
import {cimFunc} from "@/function"

export const getOldWorkByMrid = () => {
    ipcMain.handle('getOldWorkByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.oldWorkFunc.getOldWorkById(mrid)
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

export const getOldWorkByAssetId = () => {
    ipcMain.handle('getOldWorkByAssetId', async function (event, assetId) {
        const rs = await cimFunc.oldWorkFunc.getOldWorkByAssetId(assetId)
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

export const getWorkTasksByWorkId = () => {
    ipcMain.handle('getWorkTasksByWorkId', async function (event, workId) {
        try {
            const rs = await cimFunc.workTaskFunc.getWorkTaskByWork(workId)
            return {
                success: rs.success === true,
                message: rs.message || (rs.success ? 'Success' : 'fail'),
                data: Array.isArray(rs.data) ? rs.data : []
            }
        } catch (error) {
            console.log(error)
            return {
                error,
                success: false,
                message: (error && error.message) ? error.message : 'Internal error',
                data: []
            }
        }
    })
}

export const getWorkTasksByAssetId = () => {
    ipcMain.handle('getWorkTasksByAssetId', async function (event, assetId) {
        try {
            const rs = await cimFunc.workTaskFunc.getWorkTaskByAsset(assetId)
            return {
                success: rs.success === true,
                message: rs.message || (rs.success ? 'Success' : 'fail'),
                data: Array.isArray(rs.data) ? rs.data : []
            }
        } catch (error) {
            console.log(error)
            return {
                error,
                success: false,
                message: (error && error.message) ? error.message : 'Internal error',
                data: []
            }
        }
    })
}

export const updateOldWorkAssetIdById = () => {
    ipcMain.handle('updateOldWorkAssetIdById', async function (event, mrid, assetId) {
        try {
            const rs = await cimFunc.oldWorkFunc.updateOldWorkAssetIdById(mrid, assetId)
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

export const active = () => {
    getOldWorkByMrid()
    getOldWorkByAssetId()
    getWorkTasksByWorkId()
    getWorkTasksByAssetId()
    updateOldWorkAssetIdById()
}
