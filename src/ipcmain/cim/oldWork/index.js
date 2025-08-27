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

export const active = () => {
    getOldWorkByMrid()
    getOldWorkByAssetId()
}