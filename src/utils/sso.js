import {v4 as uuid} from 'uuid'
import {getLoginDomain} from '@/config/server'

export const SSO_CLIENT_ID = '1005'
export const SSO_TOKEN_HEADER = `smart-sso-token-${SSO_CLIENT_ID}`
export const SSO_ACCESS_TOKEN_KEY = `accessToken${SSO_CLIENT_ID}`
export const SSO_REFRESH_TOKEN_KEY = `refreshToken${SSO_CLIENT_ID}`
export const SSO_REDIRECT_URI = 'http://127.0.0.1:43821/oauth2/callback'
export const createSsoRedirectUri = () => `${SSO_REDIRECT_URI}?attempt=${uuid()}`

export const requireSsoReauthentication = (targetUrl) => {
    const url = new URL(targetUrl)
    url.searchParams.set('prompt', 'login')
    url.searchParams.set('max_age', '0')
    return url.toString()
}

export const toApiBase = (address) => {
    if (!address) return ''
    const base = String(address).trim().replace(/\/+$/, '')
    return base.toLowerCase().endsWith('/api') ? base : `${base}/api`
}

export const getSsoApiBase = () => {
    return toApiBase(getLoginDomain())
}

export const getStoredAccessToken = () => (
    localStorage.getItem(SSO_ACCESS_TOKEN_KEY) || localStorage.getItem('token')
)

export const getStoredRefreshToken = () => (
    localStorage.getItem(SSO_REFRESH_TOKEN_KEY) || localStorage.getItem('refresh_token')
)

export const storeSsoTokens = ({accessToken, refreshToken}) => {
    if (accessToken) {
        localStorage.setItem(SSO_ACCESS_TOKEN_KEY, accessToken)
        localStorage.setItem('token', accessToken)
    }
    if (refreshToken) {
        localStorage.setItem(SSO_REFRESH_TOKEN_KEY, refreshToken)
        localStorage.setItem('refresh_token', refreshToken)
    }
}

export const clearSsoTokens = () => {
    localStorage.removeItem(SSO_ACCESS_TOKEN_KEY)
    localStorage.removeItem(SSO_REFRESH_TOKEN_KEY)
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
}
