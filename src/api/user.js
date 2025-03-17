import client from "@/utils/client"

const API_PREFIX = 'api/v1'
const RESOURCE = 'users'

export const login = (data) => {
    return client.post('auth/login', data)
}

export const signup = (data) => {
    return client.post('signup', data)
}

export const changePass = (data) => {
    return client.put('account/password', data)
}

export const getAll = () => {
    return client.get(`${API_PREFIX}/${RESOURCE}`)
}