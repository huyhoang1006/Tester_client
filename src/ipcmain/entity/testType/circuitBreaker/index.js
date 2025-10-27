'use strict'
import { ipcMain } from 'electron'
import { entityFunc } from "@/function"

export const insertTestTypeCircuitBreaker = () => {
    ipcMain.handle('insertTestTypeCircuitBreaker', async function (event, data) {
        try {
            const rs = await entityFunc.TestTypeFunc.circuitBreakerTestTypeFunc.insertTestTypeCircuitBreaker(data)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data: rs.data
                }
            }
            else {
                return {
                    success: false,
                    message: "fail",
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

export const getTestTypeCircuitBreakerByMrid = () => {
    ipcMain.handle('getTestTypeCircuitBreakerByMrid', async function (event, mrid) {
        try {
            const rs = await entityFunc.TestTypeFunc.circuitBreakerTestTypeFunc.getTestTypeCircuitBreakerByMrid(mrid)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data: rs.data
                }
            }
            else {
                return {
                    success: false,
                    message: "fail",
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

export const getAllTestTypeCircuitBreaker = () => {
    ipcMain.handle('getAllTestTypeCircuitBreaker', async function (event) {
        try {
            const rs = await entityFunc.TestTypeFunc.circuitBreakerTestTypeFunc.getAllTestTypeCircuitBreaker()
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data: rs.data
                }
            }
            else {
                return {
                    success: false,
                    message: "fail",
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

export const updateTestTypeCircuitBreakerByMrid = () => {
    ipcMain.handle('updateTestTypeCircuitBreakerByMrid', async function (event, mrid, data) {
        try {
            const rs = await entityFunc.TestTypeFunc.circuitBreakerTestTypeFunc.updateTestTypeCircuitBreakerById(mrid, data)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data: rs.data
                }
            }
            else {
                return {
                    success: false,
                    message: "fail",
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

export const deleteTestTypeCircuitBreakerByMrid = () => {
    ipcMain.handle('deleteTestTypeCircuitBreakerByMrid', async function (event, mrid) {
        try {
            const rs = await entityFunc.TestTypeFunc.circuitBreakerTestTypeFunc.deleteTestTypeCircuitBreakerById(mrid)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data: rs.data
                }
            }
            else {
                return {
                    success: false,
                    message: "fail",
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
    insertTestTypeCircuitBreaker()
    getTestTypeCircuitBreakerByMrid()
    getAllTestTypeCircuitBreaker()
    updateTestTypeCircuitBreakerByMrid()
    deleteTestTypeCircuitBreakerByMrid()
}