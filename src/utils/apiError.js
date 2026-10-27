const requestTarget = error => {
    const config = (error && error.config) || {}
    const service = config.serviceName || 'Server asset'
    const method = String(config.method || 'get').toUpperCase()
    const rawUrl = config.url || ''
    try {
        const base = config.baseURL || 'http://localhost/'
        const url = new URL(rawUrl, base.endsWith('/') ? base : `${base}/`)
        return { service, method, endpoint: url.pathname, host: url.host }
    } catch (_) {
        return { service, method, endpoint: rawUrl || 'API', host: '' }
    }
}

export const classifyApiError = (error, online = typeof navigator === 'undefined' ? true : navigator.onLine) => {
    if (!error || error.code === 'ERR_CANCELED') return null
    if (!error.config && !error.response) return null
    const status = error.response && error.response.status
    const target = requestTarget(error)
    const request = `${target.method} ${target.endpoint}`
    const destination = `${target.service}${target.host ? ` (${target.host})` : ''}`

    if (error.code === 'ERR_SERVER_NOT_CONFIGURED') {
        return { kind: 'configuration', message: `${target.service} address is not configured.` }
    }

    if (status === 404) {
        return {
            kind: 'not-found',
            message: `${destination} returned HTTP 404 for ${request}. The endpoint or resource was not found.`
        }
    }
    if (status === 502 || status === 503 || status === 504) {
        return {
            kind: 'unavailable',
            message: `${destination} is unavailable (HTTP ${status}) for ${request}. Check the service or gateway.`
        }
    }
    if (status >= 500) {
        return {
            kind: 'server-error',
            message: `${destination} failed (HTTP ${status}) for ${request}. Check the server logs.`
        }
    }
    if (status) return null

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || /timeout/i.test(error.message || '')) {
        return { kind: 'timeout', message: `${destination} did not respond in time for ${request}.` }
    }
    if (online === false) {
        return { kind: 'offline', message: `This computer is offline. Reconnect the network before calling ${destination}.` }
    }
    return {
        kind: 'connection',
        message: `Cannot connect to ${destination} for ${request}. Check the server address, network, DNS or VPN.`
    }
}

export const formatApiError = error => {
    const failure = classifyApiError(error)
    return failure ? failure.message : ((error && error.message) || 'API request failed')
}
