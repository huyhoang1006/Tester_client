import fs from 'fs/promises'
import path from 'path'

const ensureJsonExtension = (filePath) => {
    if (!filePath) return filePath
    const ext = path.extname(filePath).toLowerCase()
    return ext === '.json' ? filePath : `${filePath}.json`
}

/**
 * Save the provided payload as a JSON file. Creates directories if needed.
 * @param {string} targetPath
 * @param {*} payload
 */
export const saveJsonFile = async (targetPath, payload) => {
    if (!targetPath) throw new Error('Missing target path for JSON export')
    const normalizedPath = ensureJsonExtension(targetPath)
    await fs.mkdir(path.dirname(normalizedPath), { recursive: true })
    const safePayload = payload !== null && payload !== undefined ? payload : {}
    const jsonContent = typeof safePayload === 'string'
        ? safePayload
        : JSON.stringify(safePayload, null, 2)
    await fs.writeFile(normalizedPath, jsonContent, 'utf8')
    return { success: true, path: normalizedPath }
}

