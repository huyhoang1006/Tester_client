'use strict'
import {ipcMain} from 'electron'
import {cimFunc} from "@/function"

export const getStreetDetailByMrid = () => {
    ipcMain.handle('getStreetDetailByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.streetDetailFunc.getStreetDetailById(mrid)
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

export const getStreetDetailByLocationId = () => {
    ipcMain.handle('getStreetDetailByLocationId', async function (event, locationId) {
        try {
            const rs = await cimFunc.streetDetailFunc.getStreetDetailByLocationId(locationId)
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


export const insertStreetDetail = () => {
    ipcMain.handle('insertStreetDetail', async function (event, data) {
        const rs = await cimFunc.streetDetailFunc.insertStreetDetail(data)
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

export const deleteStreetDetailByMrid = () => {
    ipcMain.handle('deleteStreetDetailByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.streetDetailFunc.deleteStreetDetailById(mrid)
            if (rs.success == true) {
                return {
                    success: true,
                    message: rs.message || "Success",
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

export const updateStreetDetailByMrid = () => {
    ipcMain.handle('updateStreetDetailByMrid', async function (event, mrid, data) {
        try {
            const rs = await cimFunc.streetDetailFunc.updateStreetDetailById(mrid, data)
            if (rs.success == true) {
                return {
                    success: true,
                    message: rs.message || "Success",
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
    getStreetDetailByMrid()
    getStreetDetailByLocationId()
    insertStreetDetail()
    updateStreetDetailByMrid()
    deleteStreetDetailByMrid()
}