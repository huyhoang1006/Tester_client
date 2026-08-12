import client from '@/utils/client'
import { toServerId } from '@/utils/serverId'
const prefix = 'api/job'

export const createVoltageTransformerJob = (data, deviceId) => {
    return client.post(`/${prefix}/upload/vt`, data, {
        params: {
            deviceId: toServerId(deviceId)
        }
    })
}

export const getVoltageTransformerJobById = (id) => {
    return client.get(`/${prefix}/download/vt/${toServerId(id)}`)
}