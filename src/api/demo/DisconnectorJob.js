import client from '@/utils/client'
const prefix = 'api/test'

export const createDisconnectorJob = (data, deviceId) => {
    return client.post(`/${prefix}/upload/dc`, data, {
        params: {
            deviceId
        }
    })
}

export const getDisconnectorJobById = (id) => {
    return client.get(`/${prefix}/download/dc/${id}`)
}