'use strict'
import { ipcMain } from 'electron'
import {entityFunc} from "@/function"

const checkForStartupUpdate = () => {
    ipcMain.handle('checkForStartupUpdate', async (_event, serviceDomain) => {
        try {
            await entityFunc.updateEntityFunc.checkForStartupUpdate(serviceDomain)
            return {
                success: true,
                message: 'Startup update check completed'
            }
        } catch (error) {
            console.error('Error checking for startup update:', error)
            return {
                success: false,
                message: error.message || 'Failed to check for startup update',
                error: error.message || String(error)
            }
        }
    })
}

const downloadUpdate = () => {
    ipcMain.handle('downloadUpdate', async () => {
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
                error: error.message || String(error)
            }
        }
    })
}


export const active = () => {
    checkForStartupUpdate()
    downloadUpdate()
}
