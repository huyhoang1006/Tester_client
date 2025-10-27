'use strict'
import { ipcMain } from 'electron'
import { entityFunc } from "@/function"

export const insertTestTypeRotatingMachine = () => {
    ipcMain.handle('insertTestTypeRotatingMachine', async function (event, data) {
        try {
            const rs = await entityFunc.TestTypeFunc.rotatingMachineTestTypeFunc.insertTestTypeRotatingMachine(data)
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

export const getTestTypeRotatingMachineByMrid = () => {
    ipcMain.handle('getTestTypeRotatingMachineByMrid', async function (event, mrid) {
        try {
            const rs = await entityFunc.TestTypeFunc.rotatingMachineTestTypeFunc.getTestTypeRotatingMachineByMrid(mrid)
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

export const getAllTestTypeRotatingMachine = () => {
    ipcMain.handle('getAllTestTypeRotatingMachine', async function (event) {
        try {
            const rs = await entityFunc.TestTypeFunc.rotatingMachineTestTypeFunc.getAllTestTypeRotatingMachine()
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

export const updateTestTypeRotatingMachineByMrid = () => {
    ipcMain.handle('updateTestTypeRotatingMachineByMrid', async function (event, mrid, data) {
        try {
            const rs = await entityFunc.TestTypeFunc.rotatingMachineTestTypeFunc.updateTestTypeRotatingMachineById(mrid, data)
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

export const deleteTestTypeRotatingMachineByMrid = () => {
    ipcMain.handle('deleteTestTypeRotatingMachineByMrid', async function (event, mrid) {
        try {
            const rs = await entityFunc.TestTypeFunc.rotatingMachineTestTypeFunc.deleteTestTypeRotatingMachineById(mrid)
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
    insertTestTypeRotatingMachine()
    getTestTypeRotatingMachineByMrid()
    getAllTestTypeRotatingMachine()
    updateTestTypeRotatingMachineByMrid()
    deleteTestTypeRotatingMachineByMrid()
}