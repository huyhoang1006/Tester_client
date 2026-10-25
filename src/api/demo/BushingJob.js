import client from './jobClient'
import { toServerId } from '@/utils/serverId'

const prefix = 'api/job'

export const createBushingJob = (data, deviceId) => client.post(`/${prefix}/upload/bushing`, data, {
    params: { deviceId: toServerId(deviceId) }
})

export const getBushingJobById = (id) => client.get(`/${prefix}/download/bushing/${toServerId(id)}`)
