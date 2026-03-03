/**
 * 🏗️ ENTERPRISE VERSION ARCHITECTURE
 * 
 * Tách biệt hoàn toàn:
 * 1. App Version (Semantic Versioning)
 * 2. Database Schema Version (Migration)
 */

import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import semver from 'semver'
import http from 'http'

let appConfig = null

function loadAppConfig() {
    if (appConfig) return appConfig
    try {
        const appPath = app.getAppPath()
        
        const possiblePaths = [
            path.join(appPath, 'src/config/app-config.json'),
            path.join(appPath, 'config/app-config.json'),
            path.join(appPath, 'app-config.json'),
            path.join(__dirname, '../config/app-config.json'),
            path.join(__dirname, '../../src/config/app-config.json')
        ]
        
        for (const configPath of possiblePaths) {
            if (fs.existsSync(configPath)) {
                appConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
                return appConfig
            }
        }
    } catch (e) {
        console.warn('[Version] Could not load config:', e.message)
    }
    return {}
}

// ================================
// 1️⃣ APP VERSION MANAGEMENT
// ================================

export class AppVersionManager {
    constructor() {
        this.cacheFile = path.join(app.getPath('userData'), 'version-cache.json')
        this.cacheDuration = 6 * 60 * 60 * 1000 // 6 hours
    }

    /**
     * Lấy app version hiện tại (local)
     */
    getCurrentAppVersion() {
        try {
            const appPath = app.getAppPath()
            
            const packagePath = path.join(appPath, 'package.json')
            if (fs.existsSync(packagePath)) {
                const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf-8'))
                return packageData.version
            }
            
            const versionPath = path.join(appPath, 'version.json')
            if (fs.existsSync(versionPath)) {
                const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf-8'))
                return versionData.version
            }
            
            return '0.0.0'
        } catch (err) {
            console.error('[Version] Error reading version:', err.message)
            return '0.0.0'
        }
    }

    /**
     * Lấy latest version từ GitLab với caching
     */
    async getLatestAppVersion() {
        try {
            const version = await this.fetchFromGitLab()
            this.updateCache(version)
            return version
        } catch (error) {
            console.error('[Version] Failed to get latest version:', error.message)
            return this.getCurrentAppVersion()
        }
    }

    /**
     * Fetch từ GitLab API với timeout & retry (dùng http module thay vì fetch)
     */
    fetchFromGitLab(retryCount = 3) {
        const gitlabUrl = '103.163.118.212'
        const gitlabPort = '30151'
        const projectId = 'tester-ied%2Ftester%2FTester_client'
        
        const config = loadAppConfig()
        const gitlabToken = config.gitlabToken || 'glpat-GZZM7eNvv1YTIufyVpLzKm86MQp1OnAH.01.0w1efsib7'
        
        return new Promise((resolve, reject) => {
            const headers = { 'Accept': 'application/json' }
            if (gitlabToken) {
                headers['PRIVATE-TOKEN'] = gitlabToken
            }
            
            const attemptRequest = (attempt) => {
                const apiPath = `/api/v4/projects/${projectId}/releases`
                
                const req = http.get({
                    hostname: gitlabUrl,
                    port: gitlabPort,
                    path: apiPath,
                    headers: headers
                }, (res) => {
                    let data = ''
                    res.on('data', chunk => data += chunk)
                    res.on('end', () => {
                        if (res.statusCode === 200) {
                            try {
                                const releases = JSON.parse(data)
                                
                                if (!releases || releases.length === 0) {
                                    this.fetchFromGitLabTags(gitlabUrl, gitlabPort, projectId)
                                        .then(resolve)
                                        .catch(reject)
                                    return
                                }
                                
                                const latestRelease = releases[0]
                                const versionMatch = latestRelease.name.match(/v?(\d+\.\d+\.\d+)/)
                                if (versionMatch) {
                                    resolve(versionMatch[1])
                                } else {
                                    resolve(latestRelease.tag_name || latestRelease.name)
                                }
                            } catch (e) {
                                reject(e)
                            }
                        } else if (res.statusCode === 404) {
                            this.fetchFromGitLabTags(gitlabUrl, gitlabPort, projectId)
                                .then(resolve)
                                .catch(reject)
                        } else {
                            reject(new Error(`GitLab API error: ${res.statusCode}`))
                        }
                    })
                })
                
                req.on('error', (err) => {
                    if (attempt < retryCount) {
                        setTimeout(() => attemptRequest(attempt + 1), 1000 * attempt)
                    } else {
                        reject(err)
                    }
                })
                
                req.setTimeout(5000, () => {
                    req.destroy()
                    if (attempt < retryCount) {
                        setTimeout(() => attemptRequest(attempt + 1), 1000 * attempt)
                    } else {
                        reject(new Error('Request timeout'))
                    }
                })
            }
            
            attemptRequest(1)
        })
    }
    
    /**
     * 🔄 Alternative: Fetch từ GitLab Tags
     */
    fetchFromGitLabTags(gitlabUrl, gitlabPort, projectId) {
        const config = loadAppConfig()
        const gitlabToken = config.gitlabToken || 'glpat-GZZM7eNvv1YTIufyVpLzKm86MQp1OnAH.01.0w1efsib7'
        
        const headers = { 'Accept': 'application/json' }
        if (gitlabToken) {
            headers['PRIVATE-TOKEN'] = gitlabToken
        }
        
        return new Promise((resolve, reject) => {
            const apiPath = `/api/v4/projects/${projectId}/repository/tags?per_page=1`
            
            http.get({
                hostname: gitlabUrl,
                port: gitlabPort,
                path: apiPath,
                headers: headers
            }, (res) => {
                let data = ''
                res.on('data', chunk => data += chunk)
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            const tags = JSON.parse(data)
                            
                            if (!tags || tags.length === 0) {
                                reject(new Error('No tags found'))
                                return
                            }
                            
                            const latestTag = tags[0]
                            const versionMatch = latestTag.name.match(/v?(\d+\.\d+\.\d+)/)
                            if (versionMatch) {
                                resolve(versionMatch[1])
                            } else {
                                resolve(latestTag.name)
                            }
                        } catch (e) {
                            reject(e)
                        }
                    } else {
                        reject(new Error(`Tags API error: ${res.statusCode}`))
                    }
                })
            }).on('error', reject)
        })
    }

    /**
     * 🛠️ Development Mode: Get latest commit hash
     */
    async fetchLatestCommit(gitlabUrl, projectId) {
        try {
            const response = await fetch(
                `${gitlabUrl}/api/v4/projects/${encodeURIComponent(projectId)}/repository/commits?per_page=1`,
                { headers: { 'Accept': 'application/json' } }
            )
            
            if (response.ok) {
                const commits = await response.json()
                const latestCommit = commits[0]
                return latestCommit.id.substring(0, 8) // Short hash: "a1b2c3d4"
            }
            
            throw new Error('No commits found')
        } catch (error) {
            console.warn('GitLab Commits API failed:', error.message)
            throw error
        }
    }

    /**
     * So sánh version bằng semver
     */
    async needsUpdate() {
        try {
            const current = this.getCurrentAppVersion()
            const latest = await this.getLatestAppVersion()
            
            const currentParsed = semver.parse(current)
            const latestParsed = semver.parse(latest)
            
            let needsUpdate = false
            if (currentParsed && latestParsed) {
                needsUpdate = semver.gt(latestParsed, currentParsed)
            } else {
                needsUpdate = latest !== current
            }
            
            return {
                needsUpdate: needsUpdate,
                currentVersion: current,
                latestVersion: latest,
                updateType: this.getUpdateType(current, latest)
            }
        } catch (error) {
            console.error('[Version] needsUpdate error:', error.message)
            return null
        }
    }

    /**
     * Xác định loại update: major, minor, patch
     */
    getUpdateType(current, latest) {
        if (!semver.gt(latest, current)) return null
        
        const currentParsed = semver.parse(current)
        const latestParsed = semver.parse(latest)
        
        if (latestParsed.major > currentParsed.major) return 'major'
        if (latestParsed.minor > currentParsed.minor) return 'minor'
        return 'patch'
    }

    // ================================
    // CACHE MANAGEMENT
    // ================================

    getCachedVersion() {
        try {
            if (fs.existsSync(this.cacheFile)) {
                return JSON.parse(fs.readFileSync(this.cacheFile, 'utf-8'))
            }
        } catch {
            return null
        }
    }

    isCacheExpired(cached) {
        return Date.now() - cached.timestamp > this.cacheDuration
    }

    updateCache(version) {
        try {
            const cacheData = {
                version,
                timestamp: Date.now()
            }
            fs.writeFileSync(this.cacheFile, JSON.stringify(cacheData, null, 2))
        } catch (error) {
            console.warn('Failed to update version cache:', error)
        }
    }
}

// ================================
// 2️⃣ DATABASE SCHEMA VERSION MANAGEMENT
// ================================

export class DatabaseSchemaManager {
    constructor(db) {
        this.db = db
    }

    /**
     * Lấy database schema version hiện tại
     */
    async getCurrentSchemaVersion() {
        return new Promise((resolve, reject) => {
            this.db.get('PRAGMA user_version', (err, row) => {
                if (err) reject(err)
                else resolve(row.user_version)
            })
        })
    }

    /**
     * Cập nhật schema version
     */
    async setSchemaVersion(version) {
        return new Promise((resolve, reject) => {
            this.db.run(`PRAGMA user_version = ${version}`, (err) => {
                if (err) reject(err)
                else resolve(version)
            })
        })
    }

    /**
     * Chạy migration nếu cần
     */
    async runMigrations() {
        const currentVersion = await this.getCurrentSchemaVersion()
        const targetVersion = this.getTargetSchemaVersion()
        
        if (currentVersion < targetVersion) {
            await this.executeMigrations(currentVersion, targetVersion)
            await this.setSchemaVersion(targetVersion)
            return { success: true, from: currentVersion, to: targetVersion }
        }
        
        return { success: true, message: 'No migration needed', version: currentVersion }
    }

    /**
     * Version schema mục tiêu (hardcoded)
     */
    getTargetSchemaVersion() {
        return 1 // Tăng lên khi có schema change
    }

    /**
     * Execute migration scripts
     */
    async executeMigrations(fromVersion, toVersion) {
        const migrations = {
            1: 'CREATE TABLE IF NOT EXISTS notification (mrid TEXT PRIMARY KEY, name TEXT, message TEXT, type TEXT, status TEXT, created_at TEXT)',
            2: 'ALTER TABLE assets ADD COLUMN updated_at TEXT',
            3: 'CREATE INDEX IF NOT EXISTS idx_notification_status ON notification(status)',
            // Thêm migration scripts ở đây
        }
        
        for (let version = fromVersion + 1; version <= toVersion; version++) {
            if (migrations[version]) {
                await this.runMigration(migrations[version])
            }
        }
    }

    async runMigration(sql) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, (err) => {
                if (err) reject(err)
                else resolve()
            })
        })
    }
}

// ================================
// 3️⃣ UNIFIED VERSION SERVICE
// ================================

export class VersionService {
    constructor(db) {
        this.appVersionManager = new AppVersionManager()
        this.schemaManager = new DatabaseSchemaManager(db)
    }

    /**
     * Initialize toàn bộ version system
     */
    async initialize() {
        try {
            const appVersionCheck = await this.checkAppUpdate()
            const migrationResult = await this.schemaManager.runMigrations()

            return {
                appUpdate: appVersionCheck,
                migration: migrationResult
            }
        } catch (error) {
            console.error('[VersionService] Initialization failed:', error)
            throw error
        }
    }

    /**
     * Chỉ check app update
     */
    async checkAppUpdate() {
        try {
            return await this.appVersionManager.needsUpdate()
        } catch (error) {
            console.error('[Version] Check app update failed:', error)
            return null
        }
    }

    /**
     * Lấy current app version
     */
    getCurrentAppVersion() {
        return this.appVersionManager.getCurrentAppVersion()
    }

    /**
     * Lấy current schema version
     */
    async getCurrentSchemaVersion() {
        return await this.schemaManager.getCurrentSchemaVersion()
    }
}

// Export singleton instance
export default VersionService
