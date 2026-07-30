import client from '@/utils/client'
import { toServerId } from '@/utils/serverId'
const prefix = 'api/test'

export const createSurgeArresterJob = (data, deviceId) => {
    return client.post(`/${prefix}/upload/sa`, data, {
        params: {
            deviceId: toServerId(deviceId)
        }
    })
}

export const getSurgeArresterJobById = (id) => {
    return client.get(`/${prefix}/download/sa/${toServerId(id)}`)
}