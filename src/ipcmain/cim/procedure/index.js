'use strict'
import {ipcMain} from 'electron'
import {cimFunc} from "@/function"

export const getProcedureBy = () => {
    ipcMain.handle('getProcedureByGenericAssetModel', async function (event, generic_asset_model, kind) {
        try {
            const rs = await cimFunc.procedureFunc.getProcedureByGenericAssetModel(generic_asset_model, kind)
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

export const getMaintenanceLibrary = () => {
    ipcMain.handle('getMaintenanceActivityLibrary', async function () {
        try {
            return await cimFunc.procedureFunc.getMaintenanceActivityLibrary()
        } catch (error) {
            return { success: false, message: error && error.message ? error.message : 'Get maintenance library failed' }
        }
    })
}

export const active = () => {
    getProcedureBy()
    getMaintenanceLibrary()
}
