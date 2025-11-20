/* eslint-disable */
import store from '@/store'
import client from './client'

let interceptorAuthenticate = null

export const initApp = () => {
    // 1. Khôi phục Server Address
    const serverAddr = localStorage.getItem('SERVER_ADDR')
    if (serverAddr) {
        store.dispatch('setServerAddr', serverAddr)
        client.defaults.baseURL = serverAddr
    }

    // 2. Khôi phục thông tin User & Token từ LocalStorage
    const userStr = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    // const refreshToken = localStorage.getItem('refresh_token') // Nếu sau này cần dùng refresh token

    if (userStr && token) {
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

export const afterLogin = (remember, response) => {
    // response chính là cục JSON bạn cung cấp

    // 1. Trích xuất dữ liệu từ Response mới
    const accessToken = response.access_token
    const refreshToken = response.refresh_token

    // Thông tin user nằm trong object 'actionUser'
    const userInfo = response.actionUser

    // Role nằm trong mảng 'usersGroups'. Lấy role đầu tiên hoặc xử lý theo logic dự án
    let roleCode = ''
    if (userInfo && userInfo.usersGroups && userInfo.usersGroups.length > 0) {
        roleCode = userInfo.usersGroups[0].coded // Ví dụ: "ROLE_TESTER"
    }

    // 2. Lưu vào LocalStorage (Nếu user chọn Remember hoặc mặc định lưu để F5 không mất session)
    // Lưu ý: Token luôn cần lưu để F5 không bị logout, biến 'remember' thường chỉ dùng để quyết định thời gian lưu cookie, 
    // nhưng với localStorage thì ta cứ lưu, logout thì xóa.

    /**
     * {"createdAt":1759506292729,"is_active":1,"usersGroups":[{"id":4,"named":"Role Tester","coded":"ROLE_TESTER"
     * ,"namedDescription":"Role For Tester Client","isActive":1,"created_at":"03-10-2025 03:44:52"}],
     * "id":5,"is_verified":1,"email":"evn@mail.com","username":"EVN_HCM"}
     */

    localStorage.setItem('token', accessToken)
    localStorage.setItem('refresh_token', refreshToken) // Lưu cái này để làm tính năng refresh token sau này
    localStorage.setItem('user', JSON.stringify({
        user_id: userInfo.id,
        name: userInfo.username,
        email: userInfo.email,
        role: roleCode,
        token_type: response.token_type,
        refresh_token: refreshToken,
        access_token: accessToken,
        exp: response.expires_in,
        name: userInfo.username
    })) // Chỉ lưu phần info user, không lưu cả cục response to
    localStorage.setItem('role', roleCode)


    // 3. Cập nhật vào Store (Vuex)
    store.dispatch('setUser', {
        user_id: userInfo.id,
        name: userInfo.username,
        email: userInfo.email,
        role: roleCode,
        token_type: response.token_type,
        refresh_token: refreshToken,
        access_token: accessToken,
        exp: response.expires_in,
        name: userInfo.username
    })
    store.dispatch('setToken', accessToken)
    store.dispatch('setRole', roleCode)
    store.dispatch('setIsAuthenticated', true)

    // 4. Thiết lập Interceptor cho axios client
    setupInterceptor(accessToken)
}

export const afterLogout = () => {
    // Xóa sạch LocalStorage
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('role')

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

export const setServerAddr = (domain) => {
    localStorage.setItem('SERVER_ADDR', domain)
    store.dispatch('setServerAddr', domain)
    client.defaults.baseURL = domain
}

// Hàm phụ để cài đặt Interceptor (tránh lặp code giữa initApp và afterLogin)
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