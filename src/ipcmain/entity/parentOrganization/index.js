'use strict'
import {ipcMain} from 'electron'
import {entityFunc} from "@/function"

export const insertParentOrganizationEntity = () => {
    ipcMain.handle('insertParentOrganizationEntity', async function (event, data) {
        const rs = await entityFunc.parentOrganizationEntityFunc.insertOrganisationEntity(data)
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

export const active = () => {
    insertParentOrganizationEntity()
}