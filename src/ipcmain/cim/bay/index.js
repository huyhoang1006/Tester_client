'use strict'
import {ipcMain} from 'electron'
import {cimFunc} from "@/function"

export const getBayByMrid = () => {
    ipcMain.handle('getBayByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.bayFunc.getBayById(mrid)
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

export const getBayByVoltageBySubstationId = () => {
    ipcMain.handle('getBayByVoltageBySubstationId', async function (event, voltage_level, substationId) {
        try {
            const rs = await cimFunc.bayFunc.getBayByVoltageLevelOrSubstation(voltage_level, substationId)
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

export const insertBay = () => {
    ipcMain.handle('insertBay', async function (event, data) {
        const rs = await cimFunc.bayFunc.insertBay(data)
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
            console.log(error)
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}


export const updateBayByMrid = () => {
    ipcMain.handle('updateBayByMrid', async function (event, mrid, data) {
        try {
            const rs = await cimFunc.bayFunc.updateBayById(mrid, data)
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

export const deleteBayByMrid = () => {
    ipcMain.handle('deleteBayByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.bayFunc.deleteBayById(mrid)
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

export const active = () => {
    getBayByMrid()
    getBayByVoltageBySubstationId()
    insertBay()
    updateBayByMrid()
    deleteBayByMrid()
}