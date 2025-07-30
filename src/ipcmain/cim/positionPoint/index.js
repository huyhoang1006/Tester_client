'use strict'
import {ipcMain} from 'electron'
import {cimFunc} from "@/function"

export const getPositionPointMrid = () => {
    ipcMain.handle('getPositionPointMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.positionPointFunc.getPositionPointById(mrid)
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

export const getPositionPointByLocationId = () => {
    ipcMain.handle('getPositionPointByLocationId', async function (event, locationId) {
        try {
            const rs = await cimFunc.positionPointFunc.getPositionPointByLocationId(locationId)
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
    getPositionPointMrid()
    getPositionPointByLocationId()
}