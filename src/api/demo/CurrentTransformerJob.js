import client from '@/utils/client'
import { toServerId } from '@/utils/serverId'
const prefix = 'api/job'

export const createCurrentTransformerJob = (data, deviceId) => {
    return client.post(`/${prefix}/upload/ct`, data, {
        params: {
            deviceId: toServerId(deviceId)
        }
    })
}

export const getCurrentTransformerJobById = (id) => {
    return client.get(`/${prefix}/download/ct/${toServerId(id)}`)
}