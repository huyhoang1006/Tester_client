'use strict'
import {ipcMain} from 'electron'
import {entityFunc} from "@/function"

export const getEntitySnapshotByMrid = () => {
    ipcMain.handle('getEntitySnapshotByMrid', async function (event, mrid, type) {
        try {
            const rs = await entityFunc.entitySnapshotFunc.getSnapshot(mrid, type)
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

export const insertEntitySnapshot = () => {
    ipcMain.handle('insertEntitySnapshot', async function (event, data) {
        const rs = await entityFunc.entitySnapshotFunc.saveSnapshot(data.mrid, data.type, data.snapshot)
        try {
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

export const deleteEntitySnapshotByMrid = () => {
    ipcMain.handle('deleteEntitySnapshotByMrid', async function (event, mrid, type) {
        try {
            const rs = await entityFunc.entitySnapshotFunc.deleteSnapshot(mrid, type)
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

export const active = () => {
    getEntitySnapshotByMrid()
    insertEntitySnapshot()
    deleteEntitySnapshotByMrid()
}