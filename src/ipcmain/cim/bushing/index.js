'use strict'
import {ipcMain} from 'electron'
import {cimFunc} from "@/function"

export const getBushingByMrid = () => {
    ipcMain.handle('getBushingByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.bushingFunc.getBushingById(mrid)
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

export const getBushingByPsrId = () => {
    ipcMain.handle('getBushingByPsrId', async function (event, psrId) {
        try {
            const rs = await cimFunc.bushingFunc.getBushingByPsrId(psrId)
            if (rs.success == true) {
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
    getBushingByMrid()
    getBushingByPsrId()
}