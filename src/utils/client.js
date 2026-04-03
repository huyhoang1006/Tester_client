import axios from 'axios'
import store from '@/store'
import route from '@/router'
import { afterLogout } from './helper'
import qs from 'qs'

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

// --- HÀM REFRESH TOKEN ---
const refreshToken = () => {
    const refreshTokenValue = localStorage.getItem('refresh_token')
    if (!refreshTokenValue) {
        return Promise.reject(new Error('No refresh token available'))
    }

    const domain = localStorage.getItem('LOGIN_ADDR') || ''
    const refreshUrl = domain ? `${domain.replace(/\/$/, '')}/oauth/token` : '/oauth/token'
    const basicAuth = 'Basic ' + btoa('tester-client:tester-client')

    return axios.post(refreshUrl, qs.stringify({
        refresh_token: refreshTokenValue,
        grant_type: 'refresh_token'
    }), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': basicAuth
        }
    }).then(response => {
        const { access_token, refresh_token } = response.data
        
        // Cập nhật token mới vào localStorage
        localStorage.setItem('token', access_token)
        localStorage.setItem('refresh_token', refresh_token)
        
        // Cập nhật store
        store.dispatch('setToken', access_token)
        
        return access_token
    })
}

// --- 1. REQUEST INTERCEPTOR (Gửi đi) ---
client.interceptors.request.use(
    function (config) {
        // Logic cũ: Kiểm tra server address (giữ nguyên nếu bạn cần)
        if (!store.state.serviceAddr && !config.url.startsWith('http')) {
            return Promise.reject(new Error('Server address not configured'))
        }

        // --- ĐOẠN MỚI THÊM VÀO: Tự động gắn Token ---
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        // -------------------------------------------

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

                // Nếu request đã là refresh token, không thể refresh tiếp -> logout
                if (originalRequest.url.includes('/oauth/token')) {
                    afterLogout()
                    route.push({name: 'login'}).catch(()=>{})
                    return Promise.reject(error)
                }

                // Nếu chưa có originalRequest._retry, đánh dấu để tránh infinite loop
                if (!originalRequest._retry) {
                    originalRequest._retry = true

                    // Nếu đang refresh token, đưa request vào queue
                    if (isRefreshing) {
                        return new Promise((resolve, reject) => {
                            failedQueue.push({ resolve, reject })
                        })
                        .then(token => {
                            originalRequest.headers.Authorization = `Bearer ${token}`
                            return client(originalRequest)
                        })
                        .catch(err => {
                            return Promise.reject(err)
                        })
                    }

                    // Bắt đầu refresh token
                    isRefreshing = true

                    return refreshToken()
                        .then(token => {
                            // Cập nhật header cho request gốc
                            originalRequest.headers.Authorization = `Bearer ${token}`
                            
                            // Giải quyết tất cả request trong queue
                            processQueue(null, token)
                            
                            // Thực hiện lại request gốc
                            return client(originalRequest)
                        })
                        .catch(err => {
                            // Refresh token thất bại -> Xóa queue và logout
                            processQueue(err, null)
                            afterLogout()
                            route.push({name: 'login'}).catch(()=>{})
                            return Promise.reject(err)
                        })
                        .finally(() => {
                            isRefreshing = false
                        })
                } else {
                    // Đã retry rồi mà vẫn lỗi -> logout
                    afterLogout()
                    route.push({name: 'login'}).catch(()=>{})
                }
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