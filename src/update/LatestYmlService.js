/**
 * LatestYmlService
 * Đọc và parse latest.yml từ GitLab release
 */

import https from 'https'
import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import yaml from 'js-yaml'

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
        console.warn('[LatestYml] Could not load config:', e.message)
    }
    return {}
}

export class LatestYmlService {
    constructor() {
        this.gitlabUrl = 'gitlab.com'
        this.gitlabPort = '443'
        this.projectId = 'nguyenhoainam2724%2Ftest'
        
        const config = loadAppConfig()
        this.gitlabToken = config.gitlabToken || 'glpat-GkQHNzOpR9_hrjMdT230L286MQp1Omt1em5lCw.01.121ayklxz'
        this.cacheFile = path.join(app.getPath('userData'), 'latest-yml-cache.json')
    }

    /**
     * Lấy thông tin latest.yml từ GitLab release mới nhất
     */
    async getLatestYml() {
        try {
            const releaseInfo = await this.fetchLatestRelease()
            if (!releaseInfo) {
                throw new Error('No release found')
            }

            const latestYmlAsset = releaseInfo.assets && releaseInfo.assets.links 
                ? releaseInfo.assets.links.find(asset => asset.name === 'latest.yml')
                : undefined

            if (!latestYmlAsset) {
                console.warn('[LatestYml] No latest.yml found in release, falling back to API')
                return this.getLatestFromApi(releaseInfo)
            }

            const ymlContent = await this.downloadYmlContent(latestYmlAsset.url)
            const ymlData = yaml.load(ymlContent)

            const result = this.parseYmlData(ymlData, releaseInfo)
            
            this.cacheYmlData(result)
            
            return result

        } catch (error) {
            console.error('[LatestYml] Failed to get latest.yml:', error.message)
            const cached = this.getCachedData()
            if (cached) {
                console.log('[LatestYml] Using cached data')
                return cached
            }
            throw error
        }
    }

    /**
     * Fallback: Lấy version từ release API nếu không có latest.yml
     */
    async getLatestFromApi(releaseInfo) {
        const version = this.extractVersion(releaseInfo.name || releaseInfo.tag_name)
        
        const assetsLinks = releaseInfo.assets && releaseInfo.assets.links ? releaseInfo.assets.links : []
        
        const exeAsset = assetsLinks.find(asset =>
            asset.name.endsWith('.exe') || 
            asset.name.includes('Setup') ||
            asset.name.includes('Installer')
        )

        const blockmapAsset = assetsLinks.find(asset =>
            asset.name.endsWith('.blockmap')
        )

        const result = {
            version: version,
            releaseDate: releaseInfo.released_at || releaseInfo.created_at,
            releaseNotes: releaseInfo.description || '',
            files: {
                installer: {
                    url: exeAsset ? exeAsset.url : '',
                    name: exeAsset ? exeAsset.name : ''
                },
                blockmap: {
                    url: blockmapAsset ? blockmapAsset.url : '',
                    name: blockmapAsset ? blockmapAsset.name : ''
                }
            },
            tagName: releaseInfo.tag_name,
            fromYml: false
        }

        this.cacheYmlData(result)
        return result
    }

    /**
     * Download nội dung latest.yml
     */
    downloadYmlContent(url) {
        return new Promise((resolve, reject) => {
            const parsedUrl = new URL(url)
            
            const headers = {}
            if (this.gitlabToken) {
                headers['PRIVATE-TOKEN'] = this.gitlabToken
            }

            const req = https.get({
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || '443',
                path: parsedUrl.pathname + parsedUrl.search,
                headers: headers
            }, (res) => {
                let data = ''
                res.on('data', chunk => data += chunk)
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve(data)
                    } else {
                        reject(new Error(`Failed to download latest.yml: ${res.statusCode}`))
                    }
                })
            })

            req.on('error', reject)
            req.setTimeout(10000, () => {
                req.destroy()
                reject(new Error('Download timeout'))
            })
        })
    }

    /**
     * Parse dữ liệu từ latest.yml
     */
    parseYmlData(ymlData, releaseInfo) {
        const result = {
            version: ymlData.version || this.extractVersion(releaseInfo.name || releaseInfo.tag_name),
            releaseDate: ymlData.releaseDate || releaseInfo.released_at || releaseInfo.created_at,
            releaseNotes: ymlData.releaseNotes || releaseInfo.description || '',
            files: {
                installer: {
                    url: '',
                    name: '',
                    sha512: '',
                    size: 0
                },
                blockmap: {
                    url: '',
                    name: '',
                    sha512: '',
                    size: 0
                }
            },
            tagName: releaseInfo.tag_name,
            fromYml: true
        }

        if (ymlData.files && Array.isArray(ymlData.files)) {
            for (const file of ymlData.files) {
                if (file.url) {
                    if (file.url.endsWith('.exe') || file.url.includes('Setup') || file.url.includes('Installer')) {
                        result.files.installer = {
                            url: file.url,
                            name: file.path || file.url.split('/').pop(),
                            sha512: file.sha512 || '',
                            size: file.size || 0
                        }
                    } else if (file.url.endsWith('.blockmap')) {
                        result.files.blockmap = {
                            url: file.url,
                            name: file.path || file.url.split('/').pop(),
                            sha512: file.sha512 || '',
                            size: file.size || 0
                        }
                    }
                }
            }
        }

        return result
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
            
            const req = https.get({
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
            
            https.get({
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
                            resolve({
                                tag_name: tags[0].name,
                                name: tags[0].name,
                                description: tags[0].message || 'No description',
                                created_at: tags[0].commit && tags[0].commit.created_at ? tags[0].commit.created_at : null,
                                assets: { links: [] }
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
     * Cache dữ liệu latest.yml
     */
    cacheYmlData(data) {
        try {
            const cacheData = {
                data: data,
                timestamp: Date.now()
            }
            fs.writeFileSync(this.cacheFile, JSON.stringify(cacheData, null, 2))
        } catch (error) {
            console.warn('[LatestYml] Failed to cache:', error.message)
        }
    }

    /**
     * Lấy dữ liệu cache
     */
    getCachedData() {
        try {
            if (fs.existsSync(this.cacheFile)) {
                return JSON.parse(fs.readFileSync(this.cacheFile, 'utf-8')).data
            }
        } catch (e) {
            return null
        }
        return null
    }

    /**
     * Xóa cache
     */
    clearCache() {
        try {
            if (fs.existsSync(this.cacheFile)) {
                fs.unlinkSync(this.cacheFile)
            }
        } catch (e) {
            console.warn('[LatestYml] Failed to clear cache:', e.message)
        }
    }
}

export default LatestYmlService
