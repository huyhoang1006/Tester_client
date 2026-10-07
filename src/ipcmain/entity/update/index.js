'use strict'
import { ipcMain } from 'electron'
import {entityFunc} from "@/function"

const checkForStartupUpdate = () => {
    ipcMain.handle('checkForStartupUpdate', async (_event, serviceDomain) => {
        try {
            const data = await entityFunc.updateEntityFunc.checkForStartupUpdate(serviceDomain)
            return {
                success: true,
                data,
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

const checkForBackgroundUpdate = () => {
    ipcMain.handle('checkForBackgroundUpdate', async (_event, serviceDomain) => {
        try {
            const data = await entityFunc.updateEntityFunc.checkForBackgroundUpdate(serviceDomain)
            return {success: true, data, message: 'Background update check completed'}
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to check for updates',
                error: error.message || String(error)
            }
        }
    })
}

const downloadUpdate = () => {
    ipcMain.handle('downloadUpdate', async (_event, serviceDomain) => {
        try {
            const data = await entityFunc.updateEntityFunc.downloadUpdate(serviceDomain)
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
    checkForBackgroundUpdate()
    downloadUpdate()
}
