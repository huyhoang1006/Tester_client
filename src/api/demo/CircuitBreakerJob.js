import client from '@/utils/client'
const prefix = 'api/test'

export const createCircuitBreakerJob = (data, deviceId) => {
    return client.post(`/${prefix}/upload/cb`, data, {
        params: {
            deviceId
        }
    })
}

export const getCircuitBreakerJobById = (id) => {
    return client.get(`/${prefix}/download/cb/${id}`)
}