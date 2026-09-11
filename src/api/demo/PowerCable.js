/* eslint-disable */
import client from '@/utils/client'
import { toServerId } from '@/utils/serverId'
const prefix = 'api/power-cable'
export const getPowerCableById = async (id) => {
    const serverId = toServerId(id)
    try {
        return await client.get(`/api/cim/power-cable/${serverId}`)
    } catch (error) {
        return client.get(`/${prefix}/${serverId}`)
    }
}

export const createPowerCable = (data, ownerId, ownerType) => {
    console.log('createPowerCable', JSON.stringify(data))
    return client.post('/api/cim/power-cable/create', data, {
        params: {
            ownerId: toServerId(ownerId),
            ownerType
        }
    })
}

export const deletePowerCable = (id) => {
    return client.delete(`/${prefix}/${toServerId(id)}`)
}
