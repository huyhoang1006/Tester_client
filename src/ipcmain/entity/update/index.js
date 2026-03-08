'use strict'
import { ipcMain } from 'electron'
import {entityFunc} from "@/function"

const checkForUpdate = () => {
    ipcMain.handle('checkForUpdate', async (event) => {
        try {
            const data = await entityFunc.updateEntityFunc.checkForUpdates()
            return {
                success: true,
                data: data,
                message: 'check for update successfully'
            }
        } catch (error) {
            console.error('Error checking for update:', error)
            return {
                success: false,
                message: error.message || 'Failed to check for update',
                error: error
            }
        }
    })
}

const downloadUpdate = () => {
    ipcMain.handle('downloadUpdate', async (event) => {
        try {
            const data = await entityFunc.updateEntityFunc.downloadUpdate()
            return {
                success: true,
                data: data,
                message: 'download update successfully'
            }
        } catch (error) {
            console.error('Error downloading update:', error)
            return {
                success: false,
                message: error.message || 'Failed to download update',
                error: error
            }
        }
    })
}


export const active = () => {
    checkForUpdate()
    downloadUpdate()
}
