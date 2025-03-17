'use strict'
import {ipcMain} from 'electron'
import { NIL as EMPTY } from 'uuid'
import { uploadFunc } from '../../function';
const { dialog } = require('electron')
import { locationUploadFunc } from '../../function';
const fs = require('fs')

export const uploadCustom = () => {
    ipcMain.handle('uploadCustom', async function (event, name) {
        const rs = await dialog.showOpenDialog({
            title: 'Select the file to be uploaded',
            buttonLabel: 'Upload',
            filters: [
                {
                    name: 'xlsx',
                    extensions: ['xlsx']
                },
                {
                    name: 'docx',
                    extensions: ['docx']
                }
            ],
            properties: ['openFile']
        })
        if (!rs.canceled) {
            var path_name = await uploadFunc.uploadCustom(rs.filePaths.toString(), name)
            return {
                success: true,
                message: '',
                path: path_name
            }
        }
        else {
            return {
                success: false,
                message: ""
            }
        }
    })
}

export const getNameTemplate = () => {
    ipcMain.handle('getNameTemplate', async function (event) {
        try {
            const nameTemp = await uploadFunc.getNameTemplate()

            return {
                success: true,
                message: "",
                data: {
                    nameTemp
                }
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

export const uploadReport = () => {
    ipcMain.handle('uploadReport', async function (event, name, asset, location, job, user_id) {
        const rs = await dialog.showOpenDialog({
            title: 'Select the file to be uploaded',
            buttonLabel: 'Import',
            properties: ['openFile']
        })
        if (!rs.canceled) {
            await uploadFunc.uploadReport(rs.filePaths.toString(), name, asset, location, job, user_id)
            return {
                success: true,
                message: '',
            }
        }
        else {
            return {
                success: false,
                message: ""
            }
        }
    })
}

export const getTemplateByName = () => {
    ipcMain.handle('getTemplateByName', async function (event, name) {
        try {
            const temp = await uploadFunc.getTemplateByName(name)

            return {
                success: true,
                message: "",
                data: {
                    temp
                }
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

export const deleteTempByName = () => {
    ipcMain.handle('deleteTempByName', async function (event, name) {
        try {
            await uploadFunc.deleteTempByName(name)
            return {
                success: true,
                message: "",
                data : null
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

export const updateTempByName = () => {
    ipcMain.handle('updateTempByName', async function (event, data) {
        try {
            let pathParse = data.path.split('.')
            if(pathParse[pathParse.length - 1] == 'xlsx') {
                data.var = await locationUploadFunc.handleDataLocation(data.path, data.var)
            } else {
                data.var = await locationUploadFunc.handleDataWord(data.path, data.var)
            }
            await uploadFunc.updateTemplateByName(data)
            return {
                success: true,
                message: "",
                data : null
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: error,
                data: null
            }
        }
    })
}

export const getColumnByName = () => {
    ipcMain.handle('getColumnByName', async function (event, name) {
        try {
            let data_column = await uploadFunc.getColumnByName(name)
            return {
                success: true,
                message: "",
                data: {
                    data_column
                }
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

export const saveTemplate = () => {
    ipcMain.handle('saveTemplate', async function (event, data) {
        try {
            let pathParse = data.path.split(".")
            if(pathParse[pathParse.length - 1] == 'xlsx') {
                data.var = await locationUploadFunc.handleDataLocation(data.path, data.var)
                await uploadFunc.saveTemplate(data)
            } else if(pathParse[pathParse.length - 1] == 'docx') {
                data.var = await locationUploadFunc.handleDataWord(data.path, data.var)
                await uploadFunc.saveTemplate(data)
            }
            return {
                success: true,
                message: "Success"
            }
        }catch (error) {
            return {
                success: false,
                message: error
            }
        }
    })
}

export const checkNameExist = () => {
    ipcMain.handle('checkNameTemplateExist', async function (event, name) {
        try {
            let data = await uploadFunc.getTemplateByName(name)
            if(data == undefined) {
                return {
                    success: true,
                    message: "Success",
                    data : false
                }
            } else {
                return {
                    success: true,
                    message: "Success",
                    data : true
                }
            }
        }catch (error) {
            return {
                success: false,
                message: error
            }
        }
    })
}

export const getVariableFromJson = () => {
    ipcMain.handle('getVariableFromJson', async function (event) {
        const rs = await dialog.showOpenDialog({
            title: 'Select the file to be uploaded',
            buttonLabel: 'Upload',
            filters: [
                {
                    name: 'json',
                    extensions: ['json']
                }
            ],
            properties: ['openFile']
        })
        if (!rs.canceled) {
            var data = await uploadFunc.readVarFromJson(rs.filePaths.toString())
            return {
                success: true,
                message: '',
                data: data
            }
        }
        else {
            return {
                success: false,
                message: ""
            }
        }
    })
}

export const exportVariableToJon = () => {
    ipcMain.handle('exportVariableToJon', async function (event, data) {
        const rs = await dialog.showSaveDialog({
            title: 'Select the file path to save',
            buttonLabel: 'Save',
            filters: [
                { name: 'json', extensions: ['json'] }
            ],
            properties: []
        })
        if (!rs.canceled) {
            fs.writeFileSync(rs.filePath.toString(), JSON.stringify(data))
            return {
                success: true,
                message: ''
            }
        } else {
            return {
                success: false,
                message: 'cancel'
            }
        }
    })
}

export const exportReport = () => {
    ipcMain.handle('exportReport', async function (event,file, location, assetType, asset, job, test, user_id, bushing, tap_changer) {
        let rs = ''
        if(file.typeExport == 'EXCEL') {
            rs = await dialog.showSaveDialog({
                title: 'Select the file to be export',
                buttonLabel: 'Save',
                filters: [
                    { name: 'xlsx', extensions: ['xlsx'] }
                ],
                properties: []
            })
        } else if(file.typeExport == 'PDF') {
            rs = await dialog.showSaveDialog({
                title: 'Select the file to be export',
                buttonLabel: 'Save',
                filters: [
                    { name: 'pdf', extensions: ['pdf'] }
                ],
                properties: []
            })
        }

        if(rs != '') {
            if (!rs.canceled) {
                if(file.typeExport == 'EXCEL') {
                    let variable = await locationUploadFunc.handleDataLocation(file.path, file.var)
                    file.var = variable
                    await uploadFunc.exportReport(file, rs.filePath.toString(), location, assetType, asset, job, test, user_id, bushing, tap_changer)
                } else if(file.typeExport == 'PDF') {
                    let variable = await locationUploadFunc.handleDataLocation(file.path, file.var)
                    file.var = variable
                    await uploadFunc.exportReport(file, rs.filePath.toString(), location, assetType, asset, job, test, user_id, bushing, tap_changer)
                }
                return {
                    success: true,
                    message: '',
                }
            } else {
                return {
                    success: false,
                    message: ""
                }
            }
        } else {
            return {
                success: false,
                message: "Export path cannot be null"
            }
        }
    })
}


export const active = () => {
    uploadCustom()
    getNameTemplate()
    uploadReport()
    getTemplateByName()
    deleteTempByName()
    updateTempByName()
    getColumnByName()
    saveTemplate()
    checkNameExist()
    getVariableFromJson()
    exportVariableToJon()
    exportReport()
}