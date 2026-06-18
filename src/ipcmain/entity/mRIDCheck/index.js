'use strict'
import {ipcMain} from 'electron'
import {entityFunc} from "@/function"

export const checkMridsExist = () => {
    ipcMain.handle('checkMridsExist', async function (event, items) {
        try {
            const rs = await entityFunc.mRIDCheckFunc.checkMridsExist(items || [])
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

export const resolveMridPath = () => {
    ipcMain.handle('resolveMridPath', async function (event, { mrid, mode }) {
        const rs = await entityFunc.mRIDCheckFunc.resolveMridPath(mrid, mode)
        try {
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
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const active = () => {
    checkMridsExist()
    resolveMridPath()
}