import client from '@/utils/client'
import { toServerId } from '@/utils/serverId'
const prefix = 'api/job'

export const createTransformerJob = (data, deviceId) => {
    return client.post(`/${prefix}/upload/transformer`, data, {
        params: {
            deviceId: toServerId(deviceId)
        }
    })
}

export const getTransformerJobById = (id) => {
    return client.get(`/${prefix}/download/transformer/${toServerId(id)}`)
}