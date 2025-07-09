'use strict'
import {ipcMain} from 'electron'
import {cimFunc} from "@/function"

export const getTownDetailByMrid = () => {
    ipcMain.handle('getTownDetailByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.townDetailFunc.getTownDetailById(mrid)
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

export const getTownDetailByLocationId = () => {
    ipcMain.handle('getTownDetailByLocationId', async function (event, locationId) {
        try {
            const rs = await cimFunc.townDetailFunc.getTownDetailByLocationId(locationId)
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


export const insertTownDetail = () => {
    ipcMain.handle('insertTownDetail', async function (event, data) {
        const rs = await cimFunc.townDetailFunc.insertTownDetail(data)
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

export const deleteTownDetailByMrid = () => {
    ipcMain.handle('deleteTownDetailByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.townDetailFunc.deleteTownDetailById(mrid)
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

export const updateTownDetailByMrid = () => {
    ipcMain.handle('updateTownDetailByMrid', async function (event, mrid, data) {
        try {
            const rs = await cimFunc.townDetailFunc.updateTownDetailById(mrid, data)
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
    getTownDetailByMrid()
    getTownDetailByLocationId()
    insertTownDetail()
    updateTownDetailByMrid()
    deleteTownDetailByMrid()
}