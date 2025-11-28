'use strict'
import { ipcMain, dialog } from 'electron'
import * as Path from 'path'
import { saveJsonFile } from '@/function/entity/export/index.js'

const buildDialogOptions = (options = {}) => ({
    title: options.title || 'Select folder for JSON export',
    buttonLabel: options.buttonLabel || 'Save here',
    properties: ['openDirectory']
})

const handleExportJSON = () => {
    ipcMain.handle('exportJSON', async (event, payload = {}, options = {}) => {
        try {
            let targetDir = options.directory
            if (!targetDir) {
                const dialogOptions = buildDialogOptions(options)
                const result = await dialog.showOpenDialog(dialogOptions)
                if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
                    return { success: false, message: options.cancelMessage || 'Export cancelled' }
                }
                targetDir = result.filePaths[0]
            }

            const filename = options.defaultFileName || options.defaultPath || 'export-data.json'
            const targetPath = Path.join(targetDir, filename)
            const saved = await saveJsonFile(targetPath, payload)

            return {
                success: true,
                filePath: saved.path,
                message: options.successMessage || 'JSON exported successfully'
            }
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Export JSON failed',
                err: error
            }
        }
    })
}

export const active = () => {
    handleExportJSON()
}

