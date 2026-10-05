'use strict'

const Path = require('path')
const fs = require('fs')
const fsPromises = require('fs/promises')
const archiver = require('archiver')
const unzipper = require('unzipper')

const PACKAGE_URI_PREFIX = 'tree-package://'
const TREE_FILE_NAME = 'tree.json'
const MANIFEST_FILE_NAME = 'manifest.json'
const ATTACHMENT_DIR_NAME = 'attachments'

const safeArchiveFileName = (value) => {
    const cleaned = String(value || 'file')
        .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_')
        .trim()
    return cleaned || 'file'
}

const isExistingFile = (filePath) => {
    try {
        return fs.statSync(filePath).isFile()
    } catch (_) {
        return false
    }
}

const looksLikeJsonWithPaths = (value) => {
    if (typeof value !== 'string') return false
    const trimmed = value.trim()
    return (trimmed.startsWith('[') || trimmed.startsWith('{')) && trimmed.includes('"path"')
}

/**
 * Replace local file paths in a tree payload with portable package URIs.
 *
 * Attachment rows store their file list as a JSON string, while job DTOs also
 * expose normal arrays such as attachmentData. The walk intentionally handles
 * both representations and any future nameplate object containing a local
 * absolute path.
 */
const prepareTreePackagePayload = (payload) => {
    const files = []
    const missingFiles = []
    const archivePathBySource = new Map()

    const packagePathFor = (sourcePath) => {
        const absolutePath = Path.resolve(sourcePath)
        const cached = archivePathBySource.get(absolutePath)
        if (cached) return `${PACKAGE_URI_PREFIX}${cached}`

        if (!isExistingFile(absolutePath)) {
            if (!missingFiles.includes(absolutePath)) missingFiles.push(absolutePath)
            return sourcePath
        }

        const index = String(files.length + 1).padStart(6, '0')
        const archivePath = `${ATTACHMENT_DIR_NAME}/${index}/${safeArchiveFileName(Path.basename(absolutePath))}`
        archivePathBySource.set(absolutePath, archivePath)
        files.push({ sourcePath: absolutePath, archivePath })
        return `${PACKAGE_URI_PREFIX}${archivePath}`
    }

    const walk = (value) => {
        if (Array.isArray(value)) {
            for (let index = 0; index < value.length; index += 1) {
                const current = value[index]
                if (typeof current === 'string') value[index] = transformString(current)
                else if (current && typeof current === 'object') walk(current)
            }
            return
        }
        if (!value || typeof value !== 'object') return

        for (const key of Object.keys(value)) {
            const current = value[key]
            if (typeof current === 'string') value[key] = transformString(current)
            else if (current && typeof current === 'object') walk(current)
        }
    }

    const transformString = (value) => {
        if (!value || value.startsWith(PACKAGE_URI_PREFIX)) return value

        if (looksLikeJsonWithPaths(value)) {
            try {
                const parsed = JSON.parse(value)
                walk(parsed)
                return JSON.stringify(parsed)
            } catch (_) {
                // Not an attachment JSON value; treat it as an ordinary string.
            }
        }

        if (Path.isAbsolute(value)) return packagePathFor(value)
        return value
    }

    walk(payload)
    return { payload, files, missingFiles }
}

const ensureInsideDirectory = (rootDir, candidatePath) => {
    const root = Path.resolve(rootDir)
    const candidate = Path.resolve(candidatePath)
    const relative = Path.relative(root, candidate)
    if (!relative || (!relative.startsWith('..') && !Path.isAbsolute(relative))) return candidate
    throw new Error('Tree package contains an unsafe file path')
}

const normalizeArchivePath = (entryPath) => {
    const normalized = String(entryPath || '').replace(/\\/g, '/')
    if (!normalized || normalized.startsWith('/') || /^[A-Za-z]:/.test(normalized)) {
        throw new Error('Tree package contains an invalid file path')
    }
    const parts = normalized.split('/')
    if (parts.some(part => !part || part === '.' || part === '..')) {
        throw new Error('Tree package contains an unsafe file path')
    }
    return parts.join('/')
}

const writeZipEntry = (entry, destination) => new Promise((resolve, reject) => {
    const input = entry.stream()
    const output = fs.createWriteStream(destination)
    input.on('error', reject)
    output.on('error', reject)
    output.on('finish', resolve)
    input.pipe(output)
})

const createTreePackage = async (targetPath, payload) => {
    const prepared = prepareTreePackagePayload(payload)
    await fsPromises.mkdir(Path.dirname(targetPath), { recursive: true })

    const output = fs.createWriteStream(targetPath)
    const archive = archiver('zip', { zlib: { level: 9 } })
    const completed = new Promise((resolve, reject) => {
        output.on('close', resolve)
        output.on('error', reject)
        archive.on('error', reject)
        archive.on('warning', warning => {
            if (warning && warning.code !== 'ENOENT') reject(warning)
        })
    })

    archive.pipe(output)
    for (const file of prepared.files) {
        archive.file(file.sourcePath, { name: file.archivePath })
    }
    archive.append(JSON.stringify(prepared.payload, null, 2), { name: TREE_FILE_NAME })
    archive.append(JSON.stringify({
        format: 'tester-tree-package-v1',
        createdAt: new Date().toISOString(),
        treeFile: TREE_FILE_NAME,
        attachmentCount: prepared.files.length,
        missingAttachmentCount: prepared.missingFiles.length,
    }, null, 2), { name: MANIFEST_FILE_NAME })

    try {
        await archive.finalize()
        await completed
    } catch (error) {
        output.destroy()
        await fsPromises.rm(targetPath, { force: true }).catch(() => {})
        throw error
    }

    return {
        filePath: targetPath,
        attachmentCount: prepared.files.length,
        missingFiles: prepared.missingFiles,
    }
}

const resolveTreePackagePaths = (payload, stagingDir) => {
    const resolvePackageUri = (value) => {
        const archivePath = normalizeArchivePath(value.slice(PACKAGE_URI_PREFIX.length))
        if (!archivePath.startsWith(`${ATTACHMENT_DIR_NAME}/`)) {
            throw new Error('Tree package references an invalid attachment path')
        }
        const localPath = ensureInsideDirectory(stagingDir, Path.join(stagingDir, ...archivePath.split('/')))
        if (!isExistingFile(localPath)) throw new Error(`Tree package is missing attachment: ${archivePath}`)
        return localPath
    }

    const walk = (value) => {
        if (Array.isArray(value)) {
            for (let index = 0; index < value.length; index += 1) {
                const current = value[index]
                if (typeof current === 'string') value[index] = transformString(current)
                else if (current && typeof current === 'object') walk(current)
            }
            return
        }
        if (!value || typeof value !== 'object') return
        for (const key of Object.keys(value)) {
            const current = value[key]
            if (typeof current === 'string') value[key] = transformString(current)
            else if (current && typeof current === 'object') walk(current)
        }
    }

    const transformString = (value) => {
        if (value.startsWith(PACKAGE_URI_PREFIX)) return resolvePackageUri(value)
        if (looksLikeJsonWithPaths(value) && value.includes(PACKAGE_URI_PREFIX)) {
            const parsed = JSON.parse(value)
            walk(parsed)
            return JSON.stringify(parsed)
        }
        return value
    }

    walk(payload)
    return payload
}

const extractTreePackage = async (packagePath, stagingDir) => {
    const directory = await unzipper.Open.file(packagePath)
    const entries = directory.files.map(entry => ({
        entry,
        path: normalizeArchivePath(entry.path),
    }))
    const treeEntries = entries.filter(item => item.path === TREE_FILE_NAME && item.entry.type === 'File')
    if (treeEntries.length !== 1) throw new Error(`Tree package must contain exactly one ${TREE_FILE_NAME}`)

    const allowedFiles = entries.filter(item => item.entry.type === 'File')
    for (const item of allowedFiles) {
        if (item.path !== TREE_FILE_NAME && item.path !== MANIFEST_FILE_NAME && !item.path.startsWith(`${ATTACHMENT_DIR_NAME}/`)) {
            throw new Error(`Unexpected file in tree package: ${item.path}`)
        }
    }

    await fsPromises.mkdir(stagingDir, { recursive: true })
    for (const item of allowedFiles) {
        if (!item.path.startsWith(`${ATTACHMENT_DIR_NAME}/`)) continue
        const destination = ensureInsideDirectory(stagingDir, Path.join(stagingDir, ...item.path.split('/')))
        await fsPromises.mkdir(Path.dirname(destination), { recursive: true })
        await writeZipEntry(item.entry, destination)
    }

    const treeBuffer = await treeEntries[0].entry.buffer()
    const payload = JSON.parse(treeBuffer.toString('utf8'))
    return resolveTreePackagePaths(payload, stagingDir)
}

module.exports = {
    PACKAGE_URI_PREFIX,
    createTreePackage,
    extractTreePackage,
    prepareTreePackagePayload,
    resolveTreePackagePaths,
}
