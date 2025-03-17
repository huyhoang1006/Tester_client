'use strict'
import {ipcMain} from 'electron'
import {ownerFunc} from "@/function"
import { conditionFunc, attachmentFunc } from '@/function'

export const getOwnerByName = () => {
    ipcMain.handle('getOwnerByName', async function (event, name) {
        const rs = await ownerFunc.getOwnerByName(name)
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

export const getOwnerByPhone = () => {
    ipcMain.handle('getOwnerByPhone', async function (event, phone) {
        const rs = await ownerFunc.getOwnerByPhone(phone)
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

export const getOwnerById = () => {
    ipcMain.handle('getOwnerById', async function (event, id) {
        const rs = await ownerFunc.getOwnerById(id)
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

export const getOwnerByUserId = () => {
    ipcMain.handle('getOwnerByUserId', async function (event, user_id) {
        const rs = await ownerFunc.getOwnerByUserId(user_id)
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

export const getOwnerByRefId = () => {
    ipcMain.handle('getOwnerByRefId', async function (event, id) {
        const rs = await ownerFunc.getOwnerByRefId(id)
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

export const insertOwner = () => {
    ipcMain.handle('insertOwner', async function (event, data) {
        const rs = await ownerFunc.insertOwner(data)
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

export const updateOwnerById = () => {
    ipcMain.handle('updateOwnerById', async function (event, id, data) {
        const rs = await ownerFunc.updateOwnerById(id, data)
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


export const deleteOwnerById = () => {
    ipcMain.handle('deleteOwnerById', async function (event, id) {
        const rs = await ownerFunc.deleteOwnerById(id)
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

export const deleteOwner = () => {
    ipcMain.handle('deleteOwner', async function (event, ids) {
        try {
            ids.forEach(async (id) => {
                await ownerFunc.deleteOwnerById(id)
                const atm = await attachmentFunc.getAllAttachment(id, "owner")
                const condi = await conditionFunc.getTestingCondition(id)
                if(atm.length !== 0) {
                    atm.forEach(element => {
                        JSON.parse(element.name).forEach((e) => {
                            fs.unlinkSync(path.join(pathUpload, `/${e.path}`))
                        })
                    })
                    await deleteAttachment(id)
                }
                if(condi.length !== 0) {
                    await deleteTestingCondition(id)
                }

            })
            return {
                success: true,
                message: "",
                data: null
            }
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            }
        }
    })
}

export const active = () => {
    getOwnerByRefId()
    getOwnerById()
    getOwnerByName()
    getOwnerByPhone()
    insertOwner()
    updateOwnerById()
    deleteOwnerById()
    getOwnerByUserId()
    deleteOwner()
}