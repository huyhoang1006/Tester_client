'use strict'
import {ipcMain} from 'electron'
import {cimFunc} from "@/function"

export const getVoltageLevelByMrid = () => {
    ipcMain.handle('getVoltageLevelByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.voltageLevelFunc.getVoltageLevelById(mrid)
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

export const getVoltageLevelBySubstationId = () => {
    ipcMain.handle('getVoltageLevelBySubstationId', async function (event, substationId) {
        try {
            const rs = await cimFunc.voltageLevelFunc.getVoltageLevelsBySubstationId(substationId)
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

export const insertVoltageLevel = () => {
    ipcMain.handle('insertVoltageLevel', async function (event, data) {
        const rs = await cimFunc.voltageLevelFunc.insertVoltageLevel(data)
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


export const updateVoltageLevelByMrid = () => {
    ipcMain.handle('updateVoltageLevelByMrid', async function (event, mrid, data) {
        try {
            const rs = await cimFunc.voltageLevelFunc.updateVoltageLevelById(mrid, data)
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

export const deleteVoltageLevelByMrid = () => {
    ipcMain.handle('deleteVoltageLevelByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.voltageLevelFunc.deleteVoltageLevelById(mrid)
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
    getVoltageLevelByMrid()
    getVoltageLevelBySubstationId()
    insertVoltageLevel()
    updateVoltageLevelByMrid()
    deleteVoltageLevelByMrid()
}