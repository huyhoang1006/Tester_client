'use strict'
import { ipcMain, dialog } from 'electron'
import fs from 'fs'

const handleImportJSON = () => {
    ipcMain.handle('importJSON', async (event) => {
        try {
            const result = await dialog.showOpenDialog({
                title: 'Select JSON file to import',
                buttonLabel: 'Import',
                filters: [
                    { name: 'JSON Files', extensions: ['json'] }
                ],
                properties: ['openFile']
            })

            if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
                return {
                    success: false,
                    message: 'Import cancelled'
                }
            }

            const filePath = result.filePaths[0]
            const jsonStr = fs.readFileSync(filePath, { encoding: 'utf-8' })
            const data = JSON.parse(jsonStr)

            // Ensure data is an array
            const dtos = Array.isArray(data) ? data : [data]

            return {
                success: true,
                data: dtos,
                message: 'JSON file loaded successfully'
            }
        } catch (error) {
            console.error('Error importing JSON:', error)
            return {
                success: false,
                message: error.message || 'Failed to import JSON file',
                error: error
            }
        }
    })
}

export const active = () => {
    handleImportJSON()
}
