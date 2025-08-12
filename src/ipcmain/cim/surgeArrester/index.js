'use strict'
import {ipcMain} from 'electron'
import {cimFunc} from "@/function"

export const getSurgeArresterByMrid = () => {
    ipcMain.handle('getSurgeArresterByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.surgeArresterFunc.getSurgeArresterById(mrid)
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

export const insertSurgeArrester = () => {
    ipcMain.handle('insertSurgeArrester', async function (event, data) {
        try {
            const rs = await cimFunc.surgeArresterFunc.insertSurgeArrester(data)
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


export const updateSurgeArresterByMrid = () => {
    ipcMain.handle('updateSurgeArresterByMrid', async function (event, mrid, data) {
        try {
            const rs = await cimFunc.surgeArresterFunc.updateSurgeArrester(mrid, data)
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

export const deleteSurgeArresterByMrid = () => {
    ipcMain.handle('deleteSurgeArresterByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.surgeArresterFunc.deleteSurgeArresterById(mrid)
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

export const getSurgeArresterByPsrId = () => {
    ipcMain.handle('getSurgeArresterByPsrId', async function (event, psrId) {
        try {
            const rs = await cimFunc.surgeArresterFunc.getSurgeArresterByPsrId(psrId)
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
    getSurgeArresterByMrid()
    getSurgeArresterByPsrId()
    insertSurgeArrester()
    updateSurgeArresterByMrid()
    deleteSurgeArresterByMrid()
}