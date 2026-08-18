'use strict'
import { ipcMain } from 'electron'
import { entityFunc } from "@/function"
import { describeFailure } from '@/ipcmain/failureMessage'

export const insertReactorEntity = () => {
    ipcMain.handle('insertReactorEntity', async function (event, old_data, data) {
        try {
            const rs = await entityFunc.reactorEntityFunc.insertReactorEntity(old_data, data)
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

export const getReactorEntityByMrid = () => {
    ipcMain.handle('getReactorEntityByMrid', async function (event, mrid, psrId) {
        try {
            const rs = await entityFunc.reactorEntityFunc.getReactorEntity(mrid, psrId)
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
            console.error("Error retrieving Reactor entity by MRID:", error);
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}


export const deleteReactorEntity = () => {
    ipcMain.handle('deleteReactorEntity', async function (event, data) {
        try {
            const rs = await entityFunc.reactorEntityFunc.deleteReactorEntity(data)
            console.log("Delete reactor entity", rs)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data: data
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


export const active = () => {
    insertReactorEntity()
    getReactorEntityByMrid()
    deleteReactorEntity()
}
