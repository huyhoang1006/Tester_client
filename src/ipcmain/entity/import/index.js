'use strict'
import { ipcMain, dialog, app } from 'electron'
import fs from 'fs'
import fsPromises from 'fs/promises'
import Path from 'path'
import { v4 as newUuid } from 'uuid'
const { extractTreePackage } = require('../treePackage')

const TREE_IMPORT_STAGING_DIR = 'tree-import-staging'
const STAGING_MAX_AGE_MS = 24 * 60 * 60 * 1000

const getStagingRoot = () => Path.join(app.getPath('userData'), TREE_IMPORT_STAGING_DIR)

const isValidStagingId = (stagingId) => /^[0-9a-f-]{36}$/i.test(String(stagingId || ''))

const cleanupStaging = async (stagingId) => {
    if (!isValidStagingId(stagingId)) return false
    await fsPromises.rm(Path.join(getStagingRoot(), stagingId), { recursive: true, force: true })
    return true
}

const cleanupExpiredStaging = async () => {
    const root = getStagingRoot()
    await fsPromises.mkdir(root, { recursive: true })
    const entries = await fsPromises.readdir(root, { withFileTypes: true })
    const now = Date.now()
    await Promise.all(entries
        .filter(entry => entry.isDirectory() && isValidStagingId(entry.name))
        .map(async entry => {
            const directory = Path.join(root, entry.name)
            const stat = await fsPromises.stat(directory)
            if (now - stat.mtimeMs > STAGING_MAX_AGE_MS) {
                await fsPromises.rm(directory, { recursive: true, force: true })
            }
        }))
}

const handleImportJSON = () => {
    ipcMain.handle('importJSON', async () => {
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

const handleImportTreePackage = () => {
    ipcMain.handle('importTreePackage', async () => {
        let stagingId = null
        try {
            await cleanupExpiredStaging()
            const result = await dialog.showOpenDialog({
                title: 'Select tree package to import',
                buttonLabel: 'Import',
                filters: [
                    { name: 'Tree package', extensions: ['zip'] },
                    { name: 'Legacy tree JSON', extensions: ['json'] },
                ],
                properties: ['openFile'],
            })
            if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
                return { success: false, message: 'Import cancelled' }
            }

            const filePath = result.filePaths[0]
            if (Path.extname(filePath).toLowerCase() === '.json') {
                const data = JSON.parse(await fsPromises.readFile(filePath, 'utf8'))
                return {
                    success: true,
                    data,
                    stagingId: null,
                    legacy: true,
                    message: 'Legacy JSON file loaded successfully',
                }
            }

            stagingId = newUuid()
            const stagingDir = Path.join(getStagingRoot(), stagingId)
            const data = await extractTreePackage(filePath, stagingDir)
            return {
                success: true,
                data,
                stagingId,
                legacy: false,
                message: 'Tree package loaded successfully',
            }
        } catch (error) {
            if (stagingId) await cleanupStaging(stagingId).catch(() => {})
            console.error('Error importing tree package:', error)
            return {
                success: false,
                message: error.message || 'Failed to import tree package',
                error,
            }
        }
    })

    ipcMain.handle('cleanupTreeImport', async (event, stagingId) => {
        try {
            return { success: await cleanupStaging(stagingId) }
        } catch (error) {
            return { success: false, message: error.message }
        }
    })
}

export const active = () => {
    handleImportJSON()
    handleImportTreePackage()
}
