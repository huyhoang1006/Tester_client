'use strict'
import {ipcMain} from 'electron'
import {cimFunc} from "@/function"

export const getPersonRoleByMrid = () => {
    ipcMain.handle('getPersonRoleByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.personRoleFunc.getPersonRoleById(mrid)
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

export const getPersonRoleByPersonId = () => {
    ipcMain.handle('getPersonRoleByPersonId', async function (event, personId   ) {
        try {
            const rs = await cimFunc.personRoleFunc.getPersonRoleByPersonId(personId)
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

export const insertPersonRole = () => {
    ipcMain.handle('insertPersonRole', async function (event, data) {
        const rs = await cimFunc.personRoleFunc.insertPersonRole(data)
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

export const deletePersonRoleByMrid = () => {
    ipcMain.handle('deletePersonRoleByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.personRoleFunc.deletePersonRoleById(mrid)
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

export const updatePersonRoleByMrid = () => {
    ipcMain.handle('updatePersonRoleByMrid', async function (event, mrid, data) {
        try {
            const rs = await cimFunc.personRoleFunc.updatePersonRole(mrid, data)
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
    getPersonRoleByMrid()
    getPersonRoleByPersonId()
    insertPersonRole()
    updatePersonRoleByMrid()
    deletePersonRoleByMrid()
}