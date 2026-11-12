import axios from 'axios'
import store from '@/store'
import route from '@/router'
import { afterLogout } from './helper'
import { markRestoreAfterLogin } from '@/utils/workspaceRestore'
import { Loading, Message } from 'element-ui'
import { stripServerIdsDeep } from '@/utils/serverId'
import { markAuthExpiredError } from '@/utils/authError'
import { classifyApiError, formatApiError } from '@/utils/apiError'
import {
    getSsoApiBase,
    getStoredAccessToken,
    getStoredRefreshToken,
    SSO_TOKEN_HEADER,
    persistSsoSession,
    storeSsoTokens
} from '@/utils/sso'

const REFRESH_TIMEOUT_MS = 15000
const API_NOTICE_INTERVAL_MS = 8000
const recentApiNotices = new Map()

const reportApiFailure = error => {
    const failure = classifyApiError(error)
    if (!failure) return
    error.apiFailureKind = failure.kind
    error.message = failure.message
    if (error.config && error.config.suppressGlobalApiError && failure.kind === 'not-found') return

    const config = error.config || {}
    const key = `${failure.kind}:${config.serviceName || 'Server asset'}:${config.baseURL || client.defaults.baseURL || ''}:${failure.kind === 'not-found' ? config.url : ''}`
    const now = Date.now()
    if (now - (recentApiNotices.get(key) || 0) < API_NOTICE_INTERVAL_MS) return
    if (recentApiNotices.size > 100) {
        for (const [oldKey, time] of recentApiNotices) {
            if (now - time >= API_NOTICE_INTERVAL_MS) recentApiNotices.delete(oldKey)
        }
    }
    recentApiNotices.set(key, now)
    error.apiFailureNotified = true
    Message.error({ message: failure.message, showClose: true, duration: 7000 })
}

const client = axios.create({
    withCredentials: false
})

// --- BIẾN TOÀN CỤC ĐỂ QUẢN LÝ REFRESH TOKEN ---
let refreshPromise = null
let expiredSessionHandled = false
let expiredSessionToken = null

const resetExpiredSessionGuard = token => {
    if (token && token !== expiredSessionToken) {
        expiredSessionHandled = false
        expiredSessionToken = null
    }
}

const logoutExpiredSession = (message = 'Session expired. Please sign in again.') => {
    if (expiredSessionHandled) return false

    expiredSessionHandled = true
    expiredSessionToken = getStoredAccessToken()
    Message.error({
        message,
        showClose: true,
        duration: 5000
    })
    markRestoreAfterLogin()
    void afterLogout()
        .catch(error => console.warn('Unable to clear saved desktop session:', error))
        .finally(() => {
            if (route.currentRoute.name !== 'login') {
                route.push({ name: 'login' }).catch(() => {})
            }
        })
    return true
}

// --- HÀM REFRESH TOKEN ---
const refreshToken = () => {
    const refreshTokenValue = getStoredRefreshToken()
    if (!refreshTokenValue) {
        const error = new Error('No refresh token available')
        error.code = 'ERR_NO_REFRESH_TOKEN'
        return Promise.reject(error)
    }

    const apiBase = getSsoApiBase()
    if (!apiBase) return Promise.reject(new Error('Service address is not configured'))

    return axios.get(`${apiBase}/auth/sso/refresh-token`, {
        params: {refreshToken: refreshTokenValue},
        timeout: REFRESH_TIMEOUT_MS,
        serviceName: 'Login server'
    }).then(async response => {
        const body = response.data || {}
        if (body.code !== 1 || !body.data || !body.data.accessToken) {
            const error = new Error(body.message || 'Unable to refresh SSO session')
            if (body.code === 10 || body.code === 15) error.code = 'ERR_REFRESH_TOKEN_REJECTED'
            throw error
        }

        storeSsoTokens(body.data)
        store.dispatch('setToken', body.data.accessToken)
        try {
            await persistSsoSession(store.state.user, body.data.accessToken)
        } catch (error) {
            console.warn('Unable to back up renewed session:', error)
        }
        return body.data.accessToken
    })
}

const isRefreshTokenRejected = error => (
    error.code === 'ERR_NO_REFRESH_TOKEN'
    || error.code === 'ERR_REFRESH_TOKEN_REJECTED'
    || [400, 401, 403].includes(error.response && error.response.status)
)

const retryRequestWithFreshToken = (originalRequest, sourceError) => {
    if (!originalRequest || originalRequest._retry) {
        const authError = markAuthExpiredError(sourceError)
        logoutExpiredSession()
        return Promise.reject(authError)
    }

    originalRequest._retry = true

    if (!refreshPromise) {
        let refreshLoading = null
        try {
            refreshLoading = Loading.service({
                fullscreen: true,
                lock: true,
                text: 'Session expired — renewing sign-in...',
                background: 'rgba(255, 255, 255, 0.75)'
            })
        } catch (error) { /* Loading is optional during session renewal. */ }

        refreshPromise = refreshToken()
            .then(token => {
                resetExpiredSessionGuard(token)
                Message.success('Session renewed')
                return token
            })
            .catch(error => {
                if (isRefreshTokenRejected(error)) {
                    const authError = markAuthExpiredError(error)
                    logoutExpiredSession()
                    throw authError
                }

                Message.error({
                    message: `Unable to renew sign-in: ${formatApiError(error)} Your session was kept; please retry when the server is available.`,
                    showClose: true,
                    duration: 7000
                })
                throw error
            })
            .finally(() => {
                refreshPromise = null
                if (refreshLoading) refreshLoading.close()
            })
    }

    return refreshPromise.then(token => {
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${token}`
        originalRequest.headers[SSO_TOKEN_HEADER] = token
        return client(originalRequest)
    })
}

// --- 1. REQUEST INTERCEPTOR (Gửi đi) ---
client.interceptors.request.use(
    function (config) {
        config.serviceName = config.serviceName || 'Server asset'
        config.headers = config.headers || {}
        config.headers['X-Requested-With'] = 'XMLHttpRequest'
        // Logic cũ: Kiểm tra server address (giữ nguyên nếu bạn cần)
        if (!store.state.serviceAddr && !(config.url || '').startsWith('http')) {
            const error = new Error('Server address not configured')
            error.code = 'ERR_SERVER_NOT_CONFIGURED'
            error.config = config
            reportApiFailure(error)
            return Promise.reject(error)
        }

        // --- ĐOẠN MỚI THÊM VÀO: Tự động gắn Token ---
        const token = getStoredAccessToken()
        if (token) {
            resetExpiredSessionGuard(token)
            config.headers = config.headers || {}
            config.headers.Authorization = `Bearer ${token}`
            config.headers[SSO_TOKEN_HEADER] = token
        }
        // -------------------------------------------

        // mrid local có dạng "<id server>@<loại node>" (xem utils/serverId.js).
        // Cắt hậu tố ở mọi trường định danh trong body trước khi gửi — chốt chặn
        // cuối cùng cho những chỗ payload được mapper dựng sẵn, không đi qua api/demo.
        if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
            stripServerIdsDeep(config.data)
        }

        return config
    },
    function (error) {
        return Promise.reject(error)
    }
)

// --- 2. RESPONSE INTERCEPTOR (Nhận về) ---
client.interceptors.response.use(
    function (response) {
        // Logic cũ: Check response.data.success
        // LƯU Ý: API mới của bạn có thể trả về dữ liệu trực tiếp (không có field success).
        // Tôi sửa lại logic: Nếu có data.data thì trả về data.data, không thì trả về toàn bộ body.
        
        const res = response.data

        if (typeof res === 'string' && /^\s*(?:<!doctype\s+html|<html\b)/i.test(res)) {
            const error = new Error('API returned HTML instead of JSON')
            error.code = 'ERR_UNEXPECTED_HTML'
            error.config = response.config
            error.response = response
            reportApiFailure(error)
            return Promise.reject(error)
        }

        if (res && res.code === 10) {
            return retryRequestWithFreshToken(response.config, new Error(res.message || 'Token expired'))
        }

        if (res && res.code === 15) {
            return retryRequestWithFreshToken(response.config, new Error(res.message || 'Token expired'))
        }

        if (res && res.code === 20) {
            return Promise.reject(new Error(res.message || 'No permission'))
        }
        
        // Nếu cấu trúc cũ: { success: true, data: [...] }
        if (res && res.success === true) {
            return res.data
        }
        
        // Nếu cấu trúc mới: [...] (Trả thẳng dữ liệu)
        // Hoặc nếu backend trả về lỗi logic mà vẫn để status 200
        if (res && res.success === false) {
             console.error(res.message)
             return Promise.reject(new Error(res.message))
        }

        // Xử lý lỗi token không hợp lệ từ OAuth server (status 200 nhưng có error field)
        if (res && res.error) {
            const errorMsg = res.error_description || res.error
            console.error(errorMsg)
            // Nếu là lỗi token (invalid hoặc expired)
            if (res.error === 'invalid_token' || res.error === 'token_expired') {
                const authError = new Error(errorMsg)
                authError.response = {
                    status: 401,
                    data: { message: errorMsg }
                }
                return retryRequestWithFreshToken(response.config, authError)
            }
            return Promise.reject(new Error(errorMsg))
        }

        // Mặc định trả về toàn bộ data nhận được
        return res
    },
    function (error) {
        if (error.response) {
            // Token hết hạn hoặc không hợp lệ (401)
            if (error.response.status === 401) {
                const originalRequest = error.config
                return retryRequestWithFreshToken(originalRequest, error)
            }

            // Lỗi code backend (có message)
            if (error.response.data && error.response.data.message && error.response.status < 500 && error.response.status !== 404) {
                console.error(error.response.data.message)
                error.message = error.response.data.message
                return Promise.reject(error)
            }
        }
        reportApiFailure(error)
        return Promise.reject(error)
    }
)

export default client
