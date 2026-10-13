const fs = require('fs')
const path = require('path')

const SERVER_CONFIG_FILE_NAME = 'server-config.json'

const normalizeServerDomain = (value) => {
    if (typeof value !== 'string') throw new Error('Server domain must be a string')

    const normalized = value.trim().replace(/\/+$/, '')
    const parsed = new URL(normalized)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Server domain must use HTTP or HTTPS')
    }
    return normalized
}

const normalizeServerConfig = (config = {}) => ({
    loginDomain: normalizeServerDomain(config.loginDomain),
    serviceDomain: normalizeServerDomain(config.serviceDomain)
})

const createServerConfigStore = (userDataPath) => {
    const configPath = path.join(userDataPath, SERVER_CONFIG_FILE_NAME)

    return {
        configPath,
        async read() {
            try {
                const rawConfig = await fs.promises.readFile(configPath, 'utf8')
                return normalizeServerConfig(JSON.parse(rawConfig))
            } catch (error) {
                if (error && error.code === 'ENOENT') return null
                console.warn('Unable to read persisted server configuration:', error.message)
                return null
            }
        },
        async write(config) {
            const normalizedConfig = normalizeServerConfig(config)
            await fs.promises.mkdir(userDataPath, {recursive: true})
            await fs.promises.writeFile(configPath, JSON.stringify(normalizedConfig, null, 2), 'utf8')
            return normalizedConfig
        }
    }
}

module.exports = {
    createServerConfigStore,
    normalizeServerConfig,
    normalizeServerDomain
}
