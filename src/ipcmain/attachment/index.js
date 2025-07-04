'use strict'
import { ipcMain } from 'electron'
const { shell } = require('electron')
const { dialog } = require('electron')
import { attachmentFunc } from "@/function"
import * as fileFunc from "@/function/entity/file"
var Path = require('path');
import * as upath from 'upath';
import * as attachmentContext from "@/function/attachmentcontext"
const pathUpload = attachmentContext.getAttachmentDir()
import fs from 'fs'

export const openFile = () => {
    ipcMain.handle('openFile', async function (event, path) {
        try {
            await shell.openExternal(path)
            return { success: true }
        } catch (err) {
            return { success: false, message: 'Open file failed', err }
        }
    })
}

export const readFileData = () => {
    ipcMain.handle('readFileData', async function (event, file_Path) {
        try {
            const data = await fs.promises.readFile(Path.join(pathUpload, `/${file_Path}`))
            return data
        } catch (err) {
            return { success: false, message: 'Read file failed', err }
        }
    })
}

export const downloadFileData = () => {
    ipcMain.handle('downloadFileData', async function (event, base64, dirFile) {
        try {
            await fs.promises.writeFile(Path.join(pathUpload, `/${dirFile}`), base64, { encoding: 'base64' })
            return { success: true }
        } catch (err) {
            return { success: false, message: 'Download file data failed', err }
        }
    })
}

export const downloadFile = () => {
    ipcMain.handle('downloadFile', async function (event, path) {
        try {
            const rs = await dialog.showOpenDialog({
                title: 'Select the file to be downloaded',
                buttonLabel: 'Save',
                filters: [],
                properties: ['openDirectory']
            })
            if (!rs.canceled) {
                let nameFile = path.split(/[/\\]/).pop()
                const dest = Path.join(rs.filePaths[0], nameFile)
                const message = await fileFunc.downloadFile(path, dest)
                return message
            } else {
                return {
                    success: false,
                    message: 'Download cancelled',
                }
            }
        } catch (err) {
            return { success: false, message: 'Download file failed', err }
        }
    })
}

export const getAttachmentpath = () => {
    ipcMain.handle('getAttachmentpath', async function (event) {
        try {
            const rs = await dialog.showOpenDialog({
                title: 'Select the file to be uploaded',
                buttonLabel: 'Upload',
                filters: [],
                properties: ['openFile']
            })
            if (!rs.canceled) {
                let nameFileArr = rs.filePaths.toString()
                return {
                    success: true,
                    message: '',
                    path: upath.toUnix(nameFileArr)
                }
            } else {
                return {
                    success: false,
                    message: ""
                }
            }
        } catch (err) {
            return { success: false, message: 'Get attachment path failed', err }
        }
    })
}

export const insertAttachment = () => {
    ipcMain.handle('insertAttachment', async function (event, attachment) {
        try {
            const rs = await attachmentFunc.uploadAttachment(attachment)
            return rs
        } catch (err) {
            return { success: false, err: err, message: 'Insert attachment failed' }
        }
    })
}

export const deleteAttachmentById = () => {
    ipcMain.handle('deleteAttachmentById', async function (event, id) {
        try {
            const rs = await attachmentFunc.deleteAttachmentById(id)
            return rs
        } catch (err) {
            return { success: false, err: err, message: 'Delete attachment failed' }
        }
    })
}

export const updateAttachmentById = () => {
    ipcMain.handle('updateAttachmentById', async function (event, id, attachment) {
        try {
            const rs = await attachmentFunc.updateAttachmentById(id, attachment)
            return rs
        } catch (err) {
            return { success: false, err: err, message: 'Update attachment failed' }
        }
    })
}

export const getAttachmentById = () => {
    ipcMain.handle('getAttachmentById', async function (event, id) {
        try {
            const rs = await attachmentFunc.getAttachmentById(id)
            return rs
        } catch (err) {
            return { success: false, err: err, message: 'Get attachment by id failed' }
        }
    })
}

export const getAttachmentByIdForeignAndType = () => {
    ipcMain.handle('getAttachmentByIdForeignAndType', async function (event, id_foreign, type) {
        try {
            const rs = await attachmentFunc.getAttachmentByForeignIdAndType(id_foreign, type)
            return rs
        } catch (err) {
            return { success: false, err: err, message: 'Get attachment by foreign id failed' }
        }
    })
}

export const active = () => {
    openFile()
    readFileData()
    downloadFileData()
    downloadFile()
    getAttachmentpath()
    insertAttachment()
    deleteAttachmentById()
    updateAttachmentById()
    getAttachmentById()
    getAttachmentByIdForeignAndType()
}