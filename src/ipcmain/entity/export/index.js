'use strict'
import { ipcMain, dialog } from 'electron'
import * as Path from 'path'
import os from 'os'
import fs from 'fs/promises'

// Helper function to save JSON file
const ensureJsonExtension = (filePath) => {
    if (!filePath) return filePath
    return filePath.toLowerCase().endsWith('.json') ? filePath : `${filePath}.json`
}

const isRootDirectory = (dirPath) => {
    if (!dirPath) return false
    const parsed = Path.parse(Path.normalize(dirPath))
    return parsed.dir === parsed.root || parsed.dir === parsed.root.replace(/\\$/, '')
}

const saveJsonFile = async (targetPath, payload) => {
    if (!targetPath) throw new Error('Missing target path for JSON export')
    
    const normalizedPath = ensureJsonExtension(targetPath)
    const dirPath = Path.dirname(normalizedPath)
    
    // Create directory if not root (ignore permission errors)
    if (!isRootDirectory(dirPath)) {
        try {
            await fs.mkdir(dirPath, { recursive: true })
        } catch (error) {
            if (!['EEXIST', 'EPERM'].includes(error.code)) throw error
        }
    }
    
    const jsonContent = typeof payload === 'string' 
        ? payload 
        : JSON.stringify(payload !== null && payload !== undefined ? payload : {}, null, 2)
    
    await fs.writeFile(normalizedPath, jsonContent, 'utf8')
    return { success: true, path: normalizedPath }
}

const buildDialogOptions = (options = {}) => {
    // Get default filename from options
    let defaultFileName = options.defaultFileName || 'export-data.json'
    
    // Ensure filename has .json extension
    if (!defaultFileName.toLowerCase().endsWith('.json')) {
        defaultFileName = `${defaultFileName}.json`
    }
    
    // Build defaultPath - always use full file path (directory + filename)
    // This ensures Windows dialog shows the filename input field
    let defaultPath
    if (options.defaultPath) {
        // If defaultPath is provided, check if it's a directory or file
        const stats = Path.parse(options.defaultPath)
        if (!stats.ext) {
            // It's a directory, append filename
            defaultPath = Path.join(options.defaultPath, defaultFileName)
        } else {
            // It's already a file path
            defaultPath = options.defaultPath
        }
    } else {
        // Use home directory with filename
        defaultPath = Path.join(os.homedir(), defaultFileName)
    }
    
    return {
        title: options.title || 'Save JSON file',
        buttonLabel: options.buttonLabel || 'Save',
        defaultPath: defaultPath,
        filters: [
            { name: 'JSON Files', extensions: ['json'] }
        ],
        properties: []
    }
}

const handleExportJSON = () => {
    ipcMain.handle('exportJSON', async (event, payload = {}, options = {}) => {
        try {
            let targetPath = options.directory
            
            if (!targetPath) {
                const dialogOptions = buildDialogOptions(options)
                const result = await dialog.showSaveDialog(dialogOptions)
                if (result.canceled || !result.filePath) {
                    return { success: false, message: options.cancelMessage || 'Export cancelled' }
                }
                targetPath = result.filePath
            } else {
                // If directory is provided, use defaultFileName
                const filename = options.defaultFileName || 'export-data.json'
                targetPath = Path.join(targetPath, filename)
            }

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

