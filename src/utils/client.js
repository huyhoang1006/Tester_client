import axios from 'axios'
import store from '@/store'
import route from '@/router'
import { afterLogout } from './helper'

const client = axios.create({
    withCredentials: false
})

// --- 1. REQUEST INTERCEPTOR (Gửi đi) ---
client.interceptors.request.use(
    function (config) {
        // Logic cũ: Kiểm tra server address (giữ nguyên nếu bạn cần)
        if (!store.state.serverAddr && !config.url.startsWith('http')) {
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

        // Mặc định trả về toàn bộ data nhận được
        return res
    },
    function (error) {
        if (error.response) {
            // Token hết hạn hoặc không hợp lệ (401)
            if (error.response.status === 401) {
                afterLogout()
                route.push({name: 'login'}).catch(()=>{})
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