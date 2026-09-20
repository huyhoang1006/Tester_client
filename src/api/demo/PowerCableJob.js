import client from '@/utils/client'
import { toServerId } from '@/utils/serverId'

const prefix = 'api/job'

export const createPowerCableJob = (data, deviceId) => client.post(`/${prefix}/upload/pc`, data, {
    params: { deviceId: toServerId(deviceId) }
})

export const getPowerCableJobById = (id) => client.get(`/${prefix}/download/pc/${toServerId(id)}`)
