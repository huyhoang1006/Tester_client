'use strict'
import {ipcMain} from 'electron'
import {entityFunc} from "@/function"

export const insertTransformerEntity = () => {
    ipcMain.handle('insertTransformerEntity', async function (event, old_data, data) {
        try {
            const rs = await entityFunc.transformerEntityFunc.insertTransformerEntity(old_data, data)
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

export const getTransformerEntityByMrid = () => {
    ipcMain.handle('getTransformerEntityByMrid', async function (event, mrid, psrId) {
        try {
            const rs = await entityFunc.surgeArresterEntityFunc.getSurgeArresterEntityById(mrid, psrId)
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
            console.error("Error retrieving Surge Arrester entity by MRID:", error);
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}


export const active = () => {
    insertTransformerEntity()
    getTransformerEntityByMrid()
}