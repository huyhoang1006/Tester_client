/* eslint-disable */
import client from '@/utils/client'
import { toServerId } from '@/utils/serverId'
const prefix = 'api/power-cable'
export const getPowerCableById = (id) => {
    return client.get(`/${prefix}/${toServerId(id)}`)
}

export const createPowerCable = (data) => {
    console.log('createPowerCable', JSON.stringify(data))
    return client.post(`/${prefix}/create`, data)
}

export const deletePowerCable = (id) => {
    return client.delete(`/${prefix}/${toServerId(id)}`)
}
