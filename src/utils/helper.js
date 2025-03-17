import store from '@/store'
import client from './client'

let interceptorAuthenticate = null

export const initApp = () => {
    // server address
    const serverAddr = localStorage.getItem('SERVER_ADDR')
    if (serverAddr) {
        store.dispatch('setServerAddr', serverAddr)
        client.defaults.baseURL = serverAddr
    }

    // xác thực
    const userStr = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (userStr && token) {
        store.dispatch('setUser', JSON.parse(userStr))
        store.dispatch('setToken', token)
        store.dispatch('setRole', role)
        store.dispatch('setIsAuthenticated', true)

        interceptorAuthenticate = client.interceptors.request.use(
            function (config) {
                config.headers.Authorization = `Bearer ${token}`
                return config
            },
            function (err) {
                return Promise.reject(err)
            }
        )
    } else {
        store.dispatch('setIsAuthenticated', false)
    }
}

export const afterLogin = (remember, user) => {
    const userStr = JSON.stringify(user)
    const token = user.access_token
    const role = user.role

    if (remember) {
        localStorage.setItem('user', userStr)
        localStorage.setItem('token', token)
        localStorage.setItem('role', role)
    }

    store.dispatch('setUser', user)
    store.dispatch('setToken', token)
    store.dispatch('setRole', role)
    store.dispatch('setIsAuthenticated', true)

    interceptorAuthenticate = client.interceptors.request.use(
        function (config) {
            config.headers.Authorization = `Bearer ${token}`
            return config
        },
        function (err) {
            return Promise.reject(err)
        }
    )
}

export const afterLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('role')

    store.dispatch('setUser', null)
    store.dispatch('setToken', null)
    store.dispatch('setRole', null)
    store.dispatch('setIsAuthenticated', false)

    client.interceptors.request.eject(interceptorAuthenticate)
}

export const setServerAddr = (domain) => {
    localStorage.setItem('SERVER_ADDR', domain)
    store.dispatch('setServerAddr', domain)
    client.defaults.baseURL = domain
}
