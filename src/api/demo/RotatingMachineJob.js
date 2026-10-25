import client from './jobClient'
import { toServerId } from '@/utils/serverId'

const prefix = 'api/job'

export const createRotatingMachineJob = (data, deviceId) => {
    return client.post(`/${prefix}/upload/rm`, data, {
        params: { deviceId: toServerId(deviceId) }
    })
}

export const getRotatingMachineJobById = (id) => {
    return client.get(`/${prefix}/download/rm/${toServerId(id)}`)
}
