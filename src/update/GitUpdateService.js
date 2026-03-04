/**
 * Git Update Service
 * Xử lý việc pull code mới từ GitLab
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import { app } from 'electron'
import http from 'http'
import fs from 'fs'

const execAsync = promisify(exec)

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
        console.warn('[GitUpdate] Could not load config:', e.message)
    }
    return {}
}

export class GitUpdateService {
    constructor() {
        this.gitlabUrl = '103.163.118.212'
        this.gitlabPort = '30151'
        this.projectId = 'tester-ied%2Ftester%2FTester_client'
        
        const config = loadAppConfig()
        this.gitlabToken = config.gitlabToken || 'glpat-GZZM7eNvv1YTIufyVpLzKm86MQp1OnAH.01.0w1efsib7'
    }

    /**
     * Lấy thông tin release mới nhất từ GitLab
     */
    async getLatestReleaseInfo() {
        try {
            const release = await this.fetchLatestRelease()
            
            if (!release) {
                throw new Error('No release found')
            }

            return {
                version: this.extractVersion(release.name || release.tag_name),
                releaseNotes: release.description || 'No release notes available',
                tagName: release.tag_name,
                releasedAt: release.released_at || release.created_at,
                assets: release.assets && release.assets.links ? release.assets.links : []
            }
        } catch (error) {
            console.error('[GitUpdate] Failed to get release info:', error)
            throw error
        }
    }

    /**
     * Fetch latest release từ GitLab API
     */
    fetchLatestRelease() {
        return new Promise((resolve, reject) => {
            const headers = { 'Accept': 'application/json' }
            if (this.gitlabToken) {
                headers['PRIVATE-TOKEN'] = this.gitlabToken
            }

            const apiPath = `/api/v4/projects/${this.projectId}/releases`
            
            const req = http.get({
                hostname: this.gitlabUrl,
                port: this.gitlabPort,
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
                                // Fallback to tags if no releases
                                this.fetchLatestTag()
                                    .then(resolve)
                                    .catch(reject)
                                return
                            }
                            
                            resolve(releases[0])
                        } catch (e) {
                            reject(e)
                        }
                    } else if (res.statusCode === 404) {
                        // Fallback to tags
                        this.fetchLatestTag()
                            .then(resolve)
                            .catch(reject)
                    } else {
                        reject(new Error(`GitLab API error: ${res.statusCode}`))
                    }
                })
            })

            req.on('error', reject)
            req.setTimeout(10000, () => {
                req.destroy()
                reject(new Error('Request timeout'))
            })
        })
    }

    /**
     * Fallback: Fetch từ tags nếu không có releases
     */
    fetchLatestTag() {
        return new Promise((resolve, reject) => {
            const headers = { 'Accept': 'application/json' }
            if (this.gitlabToken) {
                headers['PRIVATE-TOKEN'] = this.gitlabToken
            }

            const apiPath = `/api/v4/projects/${this.projectId}/repository/tags?per_page=1`
            
            http.get({
                hostname: this.gitlabUrl,
                port: this.gitlabPort,
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
                            // Convert tag to release format
                            resolve({
                                name: latestTag.name,
                                tag_name: latestTag.name,
                                description: latestTag.message || 'No description available',
                                created_at: latestTag.commit && latestTag.commit.created_at ? latestTag.commit.created_at : null,
                                assets: []
                            })
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
     * Extract version từ tag name
     */
    extractVersion(tagName) {
        if (!tagName) return '0.0.0'
        
        const versionMatch = tagName.match(/v?(\d+\.\d+\.\d+)/)
        if (versionMatch) {
            return versionMatch[1]
        }
        
        return tagName
    }

    /**
     * Thực hiện update bằng cách download installer mới từ GitLab
     * Thay vì git pull (không hoạt động với .exe đã build)
     */
    async performUpdate() {
        try {
            const { shell } = require('electron')
            
            // Get latest release info
            const releaseInfo = await this.getLatestReleaseInfo()
            
            // Find Windows installer asset
            const windowsAsset = releaseInfo.assets.find(asset => 
                asset.name.endsWith('.exe') || 
                asset.name.includes('Setup') ||
                asset.name.includes('Installer')
            )
            
            if (!windowsAsset) {
                // Nếu không có asset, mở trang releases để user download thủ công
                const releasesUrl = `http://${this.gitlabUrl}:${this.gitlabPort}/tester-ied/tester/Tester_client/-/releases`
                await shell.openExternal(releasesUrl)
                
                return {
                    success: true,
                    manual: true,
                    message: 'Please download and install the latest version manually',
                    url: releasesUrl
                }
            }
            
            // Open download link in browser
            await shell.openExternal(windowsAsset.url)
            
            return {
                success: true,
                message: 'Download started. Please install the new version after download completes.',
                downloadUrl: windowsAsset.url,
                fileName: windowsAsset.name
            }
        } catch (error) {
            console.error('[GitUpdate] Update failed:', error)
            return {
                success: false,
                message: error.message,
                error: error
            }
        }
    }

    /**
     * DEPRECATED: Git pull chỉ hoạt động với development mode
     * Không dùng cho production .exe
     */
    async performGitPull() {
        try {
            const appPath = app.getAppPath()
            
            // Check if git is available
            await execAsync('git --version')
            
            // Stash any local changes
            try {
                await execAsync('git stash', { cwd: appPath })
            } catch (e) {
                console.warn('[GitUpdate] No changes to stash')
            }

            // Fetch latest changes
            const { stdout: fetchOutput } = await execAsync('git fetch origin', { cwd: appPath })
            console.log('[GitUpdate] Fetch output:', fetchOutput)

            // Pull latest changes
            const { stdout: pullOutput } = await execAsync('git pull origin main', { cwd: appPath })
            console.log('[GitUpdate] Pull output:', pullOutput)

            return {
                success: true,
                message: 'Update completed successfully',
                output: pullOutput
            }
        } catch (error) {
            console.error('[GitUpdate] Update failed:', error)
            return {
                success: false,
                message: error.message,
                error: error
            }
        }
    }

    /**
     * Check git status
     */
    async checkGitStatus() {
        try {
            const appPath = app.getAppPath()
            const { stdout } = await execAsync('git status --porcelain', { cwd: appPath })
            
            return {
                hasChanges: stdout.trim().length > 0,
                changes: stdout
            }
        } catch (error) {
            console.error('[GitUpdate] Failed to check git status:', error)
            return {
                hasChanges: false,
                error: error.message
            }
        }
    }

    /**
     * Get current branch
     */
    async getCurrentBranch() {
        try {
            const appPath = app.getAppPath()
            const { stdout } = await execAsync('git branch --show-current', { cwd: appPath })
            return stdout.trim()
        } catch (error) {
            console.error('[GitUpdate] Failed to get current branch:', error)
            return 'unknown'
        }
    }
}

export default GitUpdateService
