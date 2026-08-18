'use strict'
import {ipcMain} from 'electron'
import {entityFunc} from "@/function"
import { describeFailure } from '@/ipcmain/failureMessage'

export const insertTransformerEntity = () => {
    ipcMain.handle('insertTransformerEntity', async function (event, old_data, data) {
        try {
            const rs = await entityFunc.transformerEntityFunc.insertTransformerEntity(old_data, data)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data: rs.data,
                    changed: rs.changed
                }
            }
            else {
                return {
                    success: false,
                    message: describeFailure(rs),
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
            const rs = await entityFunc.transformerEntityFunc.getTransformerEntityById(mrid, psrId)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data: rs.data,
                    changed: rs.changed
                }
            }
            else {
                return {
                    success: false,
                    message: describeFailure(rs),
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

export const deleteTransformerEntity = () => {
    ipcMain.handle('deleteTransformerEntity', async function (event, data) {
        try {
            const rs = await entityFunc.transformerEntityFunc.deleteTransformerEntity(data)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data: rs.data,
                    changed: rs.changed
                }
            }
            else {
                return {
                    success: false,
                    message: describeFailure(rs),
                }
            }
        } catch (error) {
            console.error("Error retrieving Transformer entity by MRID:", error);
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
    deleteTransformerEntity()
}