import axios from 'axios'
import store from '@/store'
import route from '@/router'
import { afterLogout } from './helper'
import { markRestoreAfterLogin } from '@/utils/workspaceRestore'
import { Loading, Message } from 'element-ui'
import { stripServerIdsDeep } from '@/utils/serverId'
import {
    getSsoApiBase,
    getStoredAccessToken,
    getStoredRefreshToken,
    SSO_TOKEN_HEADER,
    storeSsoTokens
} from '@/utils/sso'

const REFRESH_TIMEOUT_MS = 15000

const client = axios.create({
    withCredentials: false
})

// --- BIẾN TOÀN CỤC ĐỂ QUẢN LÝ REFRESH TOKEN ---
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

const logoutExpiredSession = () => {
    markRestoreAfterLogin()
    afterLogout()
    route.push({ name: 'login' }).catch(() => {})
}

// --- HÀM REFRESH TOKEN ---
const refreshToken = () => {
    const refreshTokenValue = getStoredRefreshToken()
    if (!refreshTokenValue) {
        return Promise.reject(new Error('No refresh token available'))
    }

    const apiBase = getSsoApiBase()
    if (!apiBase) return Promise.reject(new Error('Service address is not configured'))

    return axios.get(`${apiBase}/auth/sso/refresh-token`, {
        params: {refreshToken: refreshTokenValue},
        timeout: REFRESH_TIMEOUT_MS
    }).then(response => {
        const body = response.data || {}
        if (body.code !== 1 || !body.data || !body.data.accessToken) {
            throw new Error(body.message || 'Unable to refresh SSO session')
        }

        storeSsoTokens(body.data)
        store.dispatch('setToken', body.data.accessToken)
        return body.data.accessToken
    })
}

const retryRequestWithFreshToken = (originalRequest, sourceError) => {
    if (!originalRequest || originalRequest._retry) {
        logoutExpiredSession()
        return Promise.reject(sourceError || new Error('Session expired'))
    }

    originalRequest._retry = true

    if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({resolve, reject}))
            .then(token => {
                originalRequest.headers = originalRequest.headers || {}
                originalRequest.headers.Authorization = `Bearer ${token}`
                originalRequest.headers[SSO_TOKEN_HEADER] = token
                return client(originalRequest)
            })
    }

    isRefreshing = true
    let refreshLoading = null
    try {
        refreshLoading = Loading.service({
            fullscreen: true,
            lock: true,
            text: 'Session expired — renewing sign-in...',
            background: 'rgba(255, 255, 255, 0.75)'
        })
    } catch (error) { /* Loading is optional during session renewal. */ }

    return refreshToken()
        .then(token => {
            originalRequest.headers = originalRequest.headers || {}
            originalRequest.headers.Authorization = `Bearer ${token}`
            originalRequest.headers[SSO_TOKEN_HEADER] = token
            processQueue(null, token)
            Message.success('Session renewed')
            return client(originalRequest)
        })
        .catch(error => {
            processQueue(error, null)
            const isTimeout = error && (error.code === 'ECONNABORTED' || /timeout/i.test(error.message || ''))
            Message.error(isTimeout
                ? 'Session renewal timed out. Please sign in again.'
                : 'Session expired. Please sign in again.')
            logoutExpiredSession()
            return Promise.reject(error)
        })
        .finally(() => {
            isRefreshing = false
            if (refreshLoading) refreshLoading.close()
        })
}

// --- 1. REQUEST INTERCEPTOR (Gửi đi) ---
client.interceptors.request.use(
    function (config) {
        // Logic cũ: Kiểm tra server address (giữ nguyên nếu bạn cần)
        if (!store.state.serviceAddr && !(config.url || '').startsWith('http')) {
            return Promise.reject(new Error('Server address not configured'))
        }

        // --- ĐOẠN MỚI THÊM VÀO: Tự động gắn Token ---
        const token = getStoredAccessToken()
        if (token) {
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

        if (res && res.code === 10) {
            logoutExpiredSession()
            return Promise.reject(new Error(res.message || 'Not logged in'))
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
                return Promise.reject({ 
                    response: { 
                        status: 401, 
                        data: { message: errorMsg }
                    } 
                })
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
            if (error.response.data && error.response.data.message) {
                console.error(error.response.data.message)
                return Promise.reject(new Error(error.response.data.message))
            }
        }
        return Promise.reject(error)
    }
)

export default client
