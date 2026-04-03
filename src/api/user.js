/* eslint-disable */
import axios from 'axios'
import client from "@/utils/client"
import qs from 'qs'
import store from '@/store'

// Logic cũ: Set base URL cho client (Dùng cho các hàm getAll, signup...)
const loginAddr = localStorage.getItem('LOGIN_ADDR')
if (loginAddr) {
    store.dispatch('setLoginAddr', loginAddr)
    client.defaults.baseURL = loginAddr
}

const CLIENT_ID = 'tester-client'
const CLIENT_SECRET = 'tester-client'

const API_PREFIX = 'api/v1'
const RESOURCE = 'users'

// --- HÀM LOGIN (ĐÃ SỬA) ---
export const login = (data) => {
    // 1. Lấy Server Address trực tiếp tại thời điểm Login
    let domain = localStorage.getItem('LOGIN_ADDR') || ''

    // Xử lý bỏ dấu gạch chéo cuối nếu có (để tránh thành //oauth)
    if (domain.endsWith('/')) {
        domain = domain.slice(0, -1)
    }

    // 2. Tạo URL đầy đủ
    // Nếu có domain -> http://103.../oauth/token
    // Nếu không có -> /oauth/token (chạy qua Proxy localhost)
    const loginUrl = domain ? `${domain}/oauth/token` : '/oauth/token'

    // 3. Tạo Basic Auth
    const basicAuth = 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)

    const formData = {
        username: data.username,
        password: data.password,
        grant_type: 'password'
    }

    // Sử dụng axios gốc (để tránh interceptor của client)
    return axios.post(loginUrl, qs.stringify(formData), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': basicAuth
        }
    }).then(response => {
        return response.data
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