'use strict'
import {ipcMain} from 'electron'
import {cimFunc} from "@/function"

export const getParentOrganizationByMrid = () => {
    ipcMain.handle('getParentOrganizationByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.parentOrganizationFunc.getParentOrganizationById(mrid)
            if (rs.success === true) {
                rs.data.mode = 'organisation';
                return {
                    success: true,
                    message: "Success",
                    data: rs.data
                }
            } else {
                return {
                    success: false,
                    message: "fail",
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

export const getParentOrganizationByParentMrid = () => {
    ipcMain.handle('getParentOrganizationByParentMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.parentOrganizationFunc.getParentOrganizationByParentId(mrid)
            if (rs.success === true) {
                rs.data = rs.data.map(item => ({
                    ...item,
                    mode: 'organisation'
                }));
                return {
                    success: true,
                    message: "Success",
                    data : rs.data
                }
            }
            else {
                return {
                    success: false,
                    message: "fail",
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

export const insertParentOrganization = () => {
    ipcMain.handle('insertParentOrganization', async function (event, data) {
        const rs = await cimFunc.parentOrganizationFunc.insertParentOrganisation(data)
        try {
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data : rs.data
                }
            }
            else {
                return {
                    success: false,
                    message: "fail",
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

export const updateParentOrganizationByMrid = () => {
    ipcMain.handle('updateParentOrganizationByMrid', async function (event, mrid, data) {
        try {
            const rs = await cimFunc.parentOrganizationFunc.updateParentOrganizationById(mrid, data)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                }
            }
            else {
                return {
                    success: false,
                    message: "fail",
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

export const deleteParentOrganizationByMrid = () => {
    ipcMain.handle('deleteParentOrganizationByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.parentOrganizationFunc.deleteParentOrganizationById(mrid)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                }
            }
            else {
                return {
                    success: false,
                    message: "fail",
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
    getParentOrganizationByMrid()
    getParentOrganizationByParentMrid()
    insertParentOrganization()
    updateParentOrganizationByMrid()
    deleteParentOrganizationByMrid()
}