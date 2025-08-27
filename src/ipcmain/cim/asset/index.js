'use strict'
import {ipcMain} from 'electron'
import {cimFunc} from "@/function"

export const getAssetByMrid = () => {
    ipcMain.handle('getAssetByMrid', async function (event, id) {
        try {
            const rs = await cimFunc.assetFunc.getAssetById(id)
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
    getAssetByMrid()
}