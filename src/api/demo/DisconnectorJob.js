import client from '@/utils/client'
import { toServerId } from '@/utils/serverId'
const prefix = 'api/test'

export const createDisconnectorJob = (data, deviceId) => {
    return client.post(`/${prefix}/upload/dc`, data, {
        params: {
            deviceId: toServerId(deviceId)
        }
    })
}

export const getDisconnectorJobById = (id) => {
    return client.get(`/${prefix}/download/dc/${toServerId(id)}`)
}