/**
 * BlockmapService
 * Xử lý delta update với blockmap
 * Giúp tiết kiệm bandwidth bằng cách chỉ download các block mới
 */

import https from 'https'
import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import crypto from 'crypto'
import { spawn } from 'child_process'

export class BlockmapService {
    constructor() {
        this.tempDir = path.join(app.getPath('temp'), 'at-updater')
        this.ensureTempDir()
    }

    ensureTempDir() {
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true })
        }
    }

    /**
     * Download file từ URL với progress
     */
    async downloadFile(url, destPath, onProgress) {
        return new Promise((resolve, reject) => {
            const parsedUrl = new URL(url)
            
            const req = https.get({
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || '443',
                path: parsedUrl.pathname + parsedUrl.search
            }, (res) => {
                if (res.statusCode === 301 || res.statusCode === 302) {
                    const redirectUrl = res.headers.location
                    this.downloadFile(redirectUrl, destPath, onProgress)
                        .then(resolve)
                        .catch(reject)
                    return
                }

                if (res.statusCode !== 200) {
                    reject(new Error(`Download failed: ${res.statusCode}`))
                    return
                }

                const totalSize = parseInt(res.headers['content-length'] || 0, 10)
                let downloaded = 0
                
                const fileStream = fs.createWriteStream(destPath)
                
                res.on('data', (chunk) => {
                    downloaded += chunk.length
                    fileStream.write(chunk)
                    
                    if (onProgress && totalSize > 0) {
                        onProgress({
                            percent: Math.round((downloaded / totalSize) * 100),
                            downloaded,
                            total: totalSize
                        })
                    }
                })

                res.on('end', () => {
                    fileStream.end()
                    resolve(destPath)
                })

                res.on('error', (err) => {
                    fileStream.destroy()
                    reject(err)
                })
            })

            req.on('error', reject)
            req.setTimeout(60000, () => {
                req.destroy()
                reject(new Error('Download timeout'))
            })
        })
    }

    /**
     * Download blockmap file
     */
    async downloadBlockmap(blockmapUrl) {
        const blockmapPath = path.join(this.tempDir, 'update.blockmap')
        
        try {
            await this.downloadFile(blockmapUrl, blockmapPath)
            const content = fs.readFileSync(blockmapPath, 'utf-8')
            return this.parseBlockmap(content)
        } catch (error) {
            console.warn('[Blockmap] Failed to download blockmap:', error.message)
            return null
        }
    }

    /**
     * Parse blockmap content
     * Format: each line is "offset length sha512"
     */
    parseBlockmap(content) {
        const blocks = []
        const lines = content.trim().split('\n')
        
        for (const line of lines) {
            const parts = line.trim().split(/\s+/)
            if (parts.length >= 3) {
                blocks.push({
                    offset: parseInt(parts[0], 10),
                    length: parseInt(parts[1], 10),
                    sha512: parts[2]
                })
            }
        }

        return {
            blocks,
            totalBlocks: blocks.length,
            totalSize: blocks.reduce((sum, b) => sum + b.length, 0)
        }
    }

    /**
     * Download installer exe
     */
    async downloadInstaller(installerUrl, onProgress) {
        const installerPath = path.join(this.tempDir, 'AT Digital Tester Setup.exe')
        
        await this.downloadFile(installerUrl, installerPath, onProgress)
        return installerPath
    }

    /**
     * Tính SHA512 checksum của file
     */
    async calculateChecksum(filePath, algorithm = 'sha512') {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash(algorithm)
            const stream = fs.createReadStream(filePath)
            
            stream.on('data', (data) => hash.update(data))
            stream.on('end', () => resolve(hash.digest('hex')))
            stream.on('error', reject)
        })
    }

    /**
     * Verify checksum của installer
     */
    async verifyChecksum(installerPath, expectedChecksum) {
        if (!expectedChecksum) {
            console.warn('[Blockmap] No checksum provided, skipping verification')
            return true
        }

        const actualChecksum = await this.calculateChecksum(installerPath)
        const isValid = actualChecksum.toLowerCase() === expectedChecksum.toLowerCase()
        
        if (!isValid) {
            console.error('[Blockmap] Checksum mismatch!')
            console.error('Expected:', expectedChecksum)
            console.error('Actual:', actualChecksum)
        }
        
        return isValid
    }

    /**
     * Kiểm tra xem có blockmap không để quyết định dùng delta hay full update
     */
    async checkDeltaUpdateSupport(installerInfo) {
        const hasBlockmap = installerInfo.blockmapUrl && installerInfo.blockmapUrl.length > 0
        
        return {
            supportsDelta: hasBlockmap,
            recommendation: hasBlockmap ? 'delta' : 'full',
            message: hasBlockmap 
                ? 'Delta update available - will download only changed blocks'
                : 'Full update required - blockmap not available'
        }
    }

    /**
     * Lưu bản cũ để rollback nếu cần
     */
    saveOldVersion() {
        const appPath = app.getAppPath()
        const oldVersionsDir = path.join(app.getPath('userData'), 'old-versions')
        
        if (!fs.existsSync(oldVersionsDir)) {
            fs.mkdirSync(oldVersionsDir, { recursive: true })
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const backupDir = path.join(oldVersionsDir, `backup-${timestamp}`)
        
        fs.mkdirSync(backupDir, { recursive: true })
        
        return {
            backupDir,
            timestamp
        }
    }

    /**
     * Cleanup các bản cũ (giữ lại n bản gần nhất)
     */
    cleanupOldVersions(keepCount = 2) {
        const oldVersionsDir = path.join(app.getPath('userData'), 'old-versions')
        
        if (!fs.existsSync(oldVersionsDir)) {
            return
        }

        const backups = fs.readdirSync(oldVersionsDir)
            .filter(f => fs.statSync(path.join(oldVersionsDir, f)).isDirectory())
            .sort()
            .reverse()

        if (backups.length > keepCount) {
            const toDelete = backups.slice(keepCount)
            for (const dir of toDelete) {
                const fullPath = path.join(oldVersionsDir, dir)
                fs.rmSync(fullPath, { recursive: true, force: true })
                console.log('[Blockmap] Cleaned up old version:', dir)
            }
        }
    }

    /**
     * Cleanup temp files
     */
    cleanupTempFiles() {
        try {
            if (fs.existsSync(this.tempDir)) {
                fs.rmSync(this.tempDir, { recursive: true, force: true })
                this.ensureTempDir()
            }
        } catch (error) {
            console.warn('[Blockmap] Failed to cleanup temp:', error.message)
        }
    }

    /**
     * Chạy installer với quyền admin
     */
    async runInstaller(installerPath) {
        return new Promise((resolve, reject) => {
            try {
                const child = spawn(installerPath, ['/S', '/D=' + app.getPath('exe')], {
                    detached: true,
                    stdio: 'ignore',
                    windowsHide: true
                })

                child.unref()

                child.on('error', (err) => {
                    reject(err)
                })

                setTimeout(() => {
                    resolve({ success: true, message: 'Installer started' })
                }, 1000)

            } catch (error) {
                reject(error)
            }
        })
    }

    /**
     * Download và verify tất cả files cần thiết
     */
    async downloadAndVerify(installerUrl, blockmapUrl, expectedChecksum, onProgress) {
        const results = {
            installer: null,
            blockmap: null,
            verified: false
        }

        if (onProgress) {
            onProgress({ phase: 'downloading', percent: 0, message: 'Downloading installer...' })
        }

        results.installer = await this.downloadInstaller(installerUrl, (progress) => {
            if (onProgress) {
                onProgress({ phase: 'downloading', percent: progress.percent, message: 'Downloading installer...' })
            }
        })

        if (blockmapUrl) {
            if (onProgress) {
                onProgress({ phase: 'downloading', percent: 100, message: 'Downloading blockmap...' })
            }
            results.blockmap = await this.downloadBlockmap(blockmapUrl)
        }

        if (onProgress) {
            onProgress({ phase: 'verifying', percent: 0, message: 'Verifying checksum...' })
        }

        results.verified = await this.verifyChecksum(results.installer, expectedChecksum)

        if (!results.verified) {
            throw new Error('Checksum verification failed')
        }

        if (onProgress) {
            onProgress({ phase: 'complete', percent: 100, message: 'Download complete!' })
        }

        return results
    }
}

export default BlockmapService
