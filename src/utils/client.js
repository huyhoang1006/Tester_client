import axios from 'axios'
import store from '@/store'
import route from '@/router'
import {afterLogout} from './helper'

const client = axios.create({
    withCredentials: false
})

client.interceptors.request.use(
    function (config) {
        if (!store.state.serverAddr) {
            return Promise.reject(new Error('Server address not configured'))
        }
        return config
    },
    function (error) {
        return Promise.reject(error)
    }
)

client.interceptors.response.use(
    function (response) {
        if (!response.data.success) {
            console.error(response.data.message)
            return Promise.reject(new Error(response.data.message))
        }
        return response.data.data
    },
    function (error) {
        if (error.response) {
            // Token hết hạn
            if (error.response.status === 401) {
                afterLogout()
                route.push({name: 'login'})
            }

            // Lỗi code backend
            if (error.response.data?.message) {
                console.error(error.response.data.message)
                return Promise.reject(new Error(error.response.data.message))
            }
        }
        return Promise.reject(error)
    }
)

export default client
