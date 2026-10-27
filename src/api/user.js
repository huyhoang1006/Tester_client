/* eslint-disable */
import axios from 'axios'
import client from "@/utils/client"
import store from '@/store'
import { formatApiError } from '@/utils/apiError'
import {
    getSsoApiBase,
    getStoredAccessToken,
    SSO_TOKEN_HEADER
} from '@/utils/sso'

// Logic cũ: Set base URL cho client (Dùng cho các hàm getAll, signup...)
const loginAddr = localStorage.getItem('LOGIN_ADDR')
if (loginAddr) {
    store.dispatch('setLoginAddr', loginAddr)
    client.defaults.baseURL = loginAddr
}

const API_PREFIX = 'api/v1'
const RESOURCE = 'users'

// Timeout mặc định cho login (ms)
export const LOGIN_TIMEOUT_MS = 20000

const requireSsoApiBase = () => {
    const baseUrl = getSsoApiBase()
    if (!baseUrl) throw new Error('Login address is not configured')
    return baseUrl
}

const ssoGet = (url, config) => axios.get(url, {
    ...config,
    serviceName: 'Login server'
}).then(response => response.data).catch(error => {
    error.message = formatApiError(error)
    throw error
})

export const getSsoLoginUrl = (redirectUri, options = {}) => {
    const params = {redirectUri}
    if (options.forceLogin) {
        params.prompt = 'login'
        params.maxAge = 0
    }
    return ssoGet(`${requireSsoApiBase()}/auth/sso/login_url`, {
        params,
        timeout: options.timeout || LOGIN_TIMEOUT_MS
    })
}

export const exchangeSsoCode = (code, options = {}) => {
    return ssoGet(`${requireSsoApiBase()}/auth/sso/access-token`, {
        params: {code},
        timeout: options.timeout || LOGIN_TIMEOUT_MS
    })
}

export const getSsoLogoutUrl = (redirectUri, options = {}) => {
    const accessToken = getStoredAccessToken()
    return ssoGet(`${requireSsoApiBase()}/auth/sso/logout_url`, {
        params: {redirectUri},
        headers: accessToken ? {[SSO_TOKEN_HEADER]: accessToken} : {},
        timeout: options.timeout || LOGIN_TIMEOUT_MS
    })
}

// --- CÁC HÀM KHÁC DÙNG CLIENT (Đã tự nhận baseURL ở trên) ---
export const signup = (data) => {
    return client.post('signup', data)
}

export const changePass = (data) => {
    return client.put('account/password', data)
}

export const getAll = () => {
    return client.get(`${API_PREFIX}/${RESOURCE}`)
}
