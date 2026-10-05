/* eslint-disable */
import store from '@/store'
import client from './client'
import {
    clearSsoTokens,
    getStoredAccessToken,
    storeSsoTokens
} from '@/utils/sso'

let interceptorAuthenticate = null

export const initApp = () => {
    // 1. Khôi phục Server Address
    const serviceAddr = localStorage.getItem('SERVICE_ADDR')
    if (serviceAddr) {
        store.dispatch('setServiceAddr', serviceAddr)
        client.defaults.baseURL = serviceAddr
    }
    const loginAddr = localStorage.getItem('LOGIN_ADDR')
    if (loginAddr) {
        store.dispatch('setLoginAddr', loginAddr)
    }

    // 2. Khôi phục thông tin User & Token từ LocalStorage
    const userStr = localStorage.getItem('user')
    const token = getStoredAccessToken()
    const role = localStorage.getItem('role')
    // const refreshToken = localStorage.getItem('refresh_token') // Nếu sau này cần dùng refresh token

    if (userStr && token) {
        storeSsoTokens({accessToken: token})
        // Parse thông tin user
        const userData = JSON.parse(userStr)

        // Đẩy lại vào Store (Vuex)
        store.dispatch('setUser', userData)
        store.dispatch('setToken', token)
        store.dispatch('setRole', role)
        store.dispatch('setIsAuthenticated', true)

        // Thiết lập Interceptor để tự động gắn Token vào mọi request API tiếp theo
        setupInterceptor(token)
    } else {
        // Nếu thiếu thông tin thì reset
        store.dispatch('setIsAuthenticated', false)
    }
}

export const afterSsoLogin = (ssoToken) => {
    const accessToken = ssoToken && ssoToken.accessToken
    const refreshToken = ssoToken && ssoToken.refreshToken
    const tokenUser = (ssoToken && ssoToken.tokenUser) || {}

    if (!accessToken) throw new Error('SSO response does not contain an access token')

    const username = tokenUser.username || tokenUser.name || tokenUser.sub || 'sso-user'
    const roles = (Array.isArray(tokenUser.roles) ? tokenUser.roles : [])
        .map(role => typeof role === 'string' ? role : (role.coded || role.code || role.name || ''))
        .filter(Boolean)
    const authorities = roles.map(role => role.toUpperCase())
    const roleCode = roles[0] || null
    const userId = tokenUser.id ?? tokenUser.userId ?? tokenUser.user_id ?? username
    const user = {
        user_id: userId,
        name: username,
        username,
        email: tokenUser.email || '',
        roles,
        authorities,
        role: roleCode,
        token_type: 'Bearer',
        access_token: accessToken,
        refresh_token: refreshToken || null,
        exp: ssoToken.expiresIn || ssoToken.expires_in || null
    }

    storeSsoTokens({accessToken, refreshToken})
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('role', roleCode || '')
    localStorage.setItem('authInfo', JSON.stringify(ssoToken))

    store.dispatch('setUser', user)
    store.dispatch('setToken', accessToken)
    store.dispatch('setRole', roleCode)
    store.dispatch('setIsAuthenticated', true)
    setupInterceptor(accessToken)

    return user
}

export const afterLogout = () => {
    // Xóa sạch LocalStorage
    localStorage.removeItem('user')
    clearSsoTokens()
    localStorage.removeItem('role')
    localStorage.removeItem('authInfo')

    // Reset Store
    store.dispatch('setUser', null)
    store.dispatch('setToken', null)
    store.dispatch('setRole', null)
    store.dispatch('setIsAuthenticated', false)

    // Gỡ bỏ Interceptor
    if (interceptorAuthenticate !== null) {
        client.interceptors.request.eject(interceptorAuthenticate)
        interceptorAuthenticate = null
    }
}

export const setServerAddr = ({loginDomain, serviceDomain}) => {
    localStorage.setItem('LOGIN_ADDR', loginDomain)
    localStorage.setItem('SERVICE_ADDR', serviceDomain)
    store.dispatch('setLoginAddr', loginDomain)
    store.dispatch('setServiceAddr', serviceDomain)
    client.defaults.baseURL = serviceDomain
}

// Hàm phụ để cài đặt Interceptor (tránh lặp code giữa initApp và afterSsoLogin)
function setupInterceptor(token) {
    // Xóa interceptor cũ nếu tồn tại để tránh bị duplicate header
    if (interceptorAuthenticate !== null) {
        client.interceptors.request.eject(interceptorAuthenticate)
    }

    interceptorAuthenticate = client.interceptors.request.use(
        function (config) {
            // Gắn Bearer Token vào Header Authorization
            config.headers.Authorization = `Bearer ${token}`
            return config
        },
        function (err) {
            return Promise.reject(err)
        }
    )
}
