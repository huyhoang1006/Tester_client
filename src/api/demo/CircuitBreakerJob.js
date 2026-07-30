import client from '@/utils/client'
import { toServerId } from '@/utils/serverId'
const prefix = 'api/test'

export const createCircuitBreakerJob = (data, deviceId) => {
    return client.post(`/${prefix}/upload/cb`, data, {
        params: {
            deviceId: toServerId(deviceId)
        }
    })
}

export const getCircuitBreakerJobById = (id) => {
    return client.get(`/${prefix}/download/cb/${toServerId(id)}`)
}