'use strict'
import {ipcMain} from 'electron'
import {cimFunc} from "@/function"

export const getPersonByMrid = () => {
    ipcMain.handle('getPersonByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.personFunc.getPersonById(mrid)
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

export const getPersonByOrganisationId = () => {
    ipcMain.handle('getPersonByOrganisationId', async function (event, organisationId) {
        try {
            const rs = await cimFunc.personFunc.getPersonByOrganisationId(organisationId)
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

export const insertPerson = () => {
    ipcMain.handle('insertPerson', async function (event, data) {
        const rs = await cimFunc.personFunc.insertPerson(data)
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

export const deletePersonByMrid = () => {
    ipcMain.handle('deletePersonByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.personFunc.deletePersonById(mrid)
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

export const updatePersonByMrid = () => {
    ipcMain.handle('updatePersonByMrid', async function (event, mrid, data) {
        try {
            const rs = await cimFunc.personFunc.updatePersonById(mrid, data)
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
    getPersonByMrid()
    getPersonByOrganisationId()
    insertPerson()
    updatePersonByMrid()
    deletePersonByMrid()
}