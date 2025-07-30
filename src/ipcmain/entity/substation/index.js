'use strict'
import {ipcMain} from 'electron'
import {entityFunc} from "@/function"

export const insertSubstationEntity = () => {
    ipcMain.handle('insertSubstationEntity', async function (event, data) {
        try {
            const rs = await entityFunc.substationEntityFunc.insertSubstationEntity(data)
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
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const getSubstationEntityByMrid = () => {
    ipcMain.handle('getSubstationEntityByMrid', async function (event, mrid, user_id, organisation_id) {
        try {
            const rs = await entityFunc.substationEntityFunc.getSubstationEntityById(mrid, user_id, organisation_id)
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
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const deleteSubstationEntityByMrid = () => {
    ipcMain.handle('deleteSubstationEntityByMrid', async function (event, data) {
        try {
            const rs = await entityFunc.substationEntityFunc.deleteSubstationEntityById(data)
            console.log("Delete substation entity", rs)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data : data
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
    insertSubstationEntity()
    getSubstationEntityByMrid()
    deleteSubstationEntityByMrid()
}