'use strict'
import {ipcMain} from 'electron'
import {updateManuFunc} from "@/function"

export const getManufacturerByType = () => {
    ipcMain.handle('getManufacturerByType', async function (event, type) {
        const rs = await updateManuFunc.getManufacturerByType(type)
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
    })
}

export const getManufacturerByTypeAndName = () => {
    ipcMain.handle('getManufacturerByTypeAndName', async function (event, type, name) {
        const rs = await updateManuFunc.getManufacturerByTypeAndName(type, name)
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
    })
}

export const getManufacturerByName = () => {
    ipcMain.handle('getManufacturerByName', async function (event, name) {
        const rs = await updateManuFunc.getManufacturerByName(name)
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
    })
}

export const insertManufacturer = () => {
    ipcMain.handle('insertManufacturer', async function (event, name, type) {
        const rs = await updateManuFunc.insertManufacturer(name, type)
        if (rs.success == true) {
            return {
                success: true,
                message: "Success",
                data : rs.id
            }
        }
        else {
            return {
                success: false,
                message: "fail",
            }
        }
    })
}

export const updateManufacturerByName = () => {
    ipcMain.handle('updateManufacturerByName', async function (event, name, data) {
        const rs = await updateManuFunc.updateManufacturerByName(name, data)
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
    })
}

export const updateManufacturerById = () => {
    ipcMain.handle('updateManufacturerById', async function (event, id, data) {
        const rs = await updateManuFunc.updateManufacturerById(id, data)
        if (rs.success == true) {
            return {
                success: true,
                message: "Success",
                name : rs.name
            }
        }
        else {
            return {
                success: false,
                message: "fail",
            }
        }
    })
}

export const deleteManufacturerByName = () => {
    ipcMain.handle('deleteManufacturerByName', async function (event, name) {
        const rs = await updateManuFunc.deleteManufacturerByName(name)
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
    })
}

export const deleteManufacturerById = () => {
    ipcMain.handle('deleteManufacturerById', async function (event, id) {
        const rs = await updateManuFunc.deleteManufacturerById(id)
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
    })
}

export const active = () => {
    getManufacturerByName()
    getManufacturerByType()
    getManufacturerByTypeAndName()
    insertManufacturer()
    updateManufacturerByName()
    updateManufacturerById()
    deleteManufacturerByName()
    deleteManufacturerById()
}