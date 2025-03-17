'use strict'
import {ipcMain} from 'electron'
const { shell } = require('electron')
const { dialog } = require('electron')
import {attachmentFunc} from "@/function"
var Path = require('path');
import * as upath from 'upath';
const pathUpload = Path.join(__dirname, `/../attachment`)
import fs from 'fs'
const FormData = require('form-data');

export const openFile = () => {
    ipcMain.handle('openFile', function (event, path) {
        try {
            const file_Path = Path.join(pathUpload, `/${path}`)
            shell.openExternal(file_Path);
        } catch(err) {
            next(err)
        }
    })
}
export const readFileData = () => {
    ipcMain.handle('readFileData', async function (event, file_Path) {
        return new Promise((resolve, reject) => {
            fs.readFile(Path.join(pathUpload, `/${file_Path}`),(err, inputD) => {
                if(err) {
                    reject(err)
                } else {
                    resolve(inputD)
                }
            })
        })
        
    })
}

export const downloadFileData = () => {
    ipcMain.handle('downloadFileData', async function (event, base64, dirFile) {
        fs.writeFile(Path.join(pathUpload,`/${dirFile}`), base64, {encoding: 'base64'}, function(err) {
        });
    })
}

export const downloadFile = () => {
    ipcMain.handle('downloadFile', async function (event, path) {
        
        const rs = await dialog.showOpenDialog({
            title: 'Select the file to be downloaded',
            buttonLabel: 'Save',
            filters: [
            ],
            properties: ['openDirectory']
        })
        if (!rs.canceled) {
            let nameFile = path
            const dest = Path.join(rs.filePaths[0], nameFile)
           const message = await attachmentFunc.downloadFile(Path.join(pathUpload, `/${nameFile}`), dest)
            return message
        } else {
            return {
                success: false,
                message: 'Download cancelled',
            }
        }
    })
}

export const getAttachmentpath = () => {
    ipcMain.handle('getAttachmentpath', async function (event) {
        let fileRead = require('fs')
        const rs = await dialog.showOpenDialog({
            title: 'Select the file to be uploaded',
            buttonLabel: 'Upload',
            filters: [
            ],
            properties: ['openFile']
        })

        if (!rs.canceled) {
            let time = new Date().getTime()
            let pathArr = rs.filePaths.toString().split("\\")
            let nameFileArr = pathArr[pathArr.length - 1].split(".")
            nameFileArr[0] = nameFileArr[0] + "+"  + time.toString()
            let nameFile = nameFileArr.join(".")
            pathArr[pathArr.length-1] = nameFile
            const uploadFile = Path.join(pathUpload, `/${nameFile}`)
            await attachmentFunc.uploadF(rs.filePaths.toString(), uploadFile, fileRead)
            return {
                success: true,
                message: '',
                path: upath.toUnix(nameFile)
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
