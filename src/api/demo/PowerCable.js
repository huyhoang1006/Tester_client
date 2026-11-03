/* eslint-disable */
import client from '@/utils/client'
import { toServerId } from '@/utils/serverId'
const prefix = 'api/power-cable'
export const getPowerCableById = async (id) => {
    const serverId = toServerId(id)
    return /^\d+$/.test(String(serverId))
        ? client.get(`/${prefix}/${serverId}`)
        : client.get(`/api/cim/power-cable/${serverId}`)
}

export const createPowerCable = (data, ownerId, ownerType) => {
    if (data?.assetData) {
        return client.post('/api/cim/power-cable/create', data, {
            params: { ownerId: toServerId(ownerId), ownerType }
        })
    }
    return client.post(`/${prefix}/create`, data)
}

export const deletePowerCable = (id) => {
    const serverId = toServerId(id)
    return /^\d+$/.test(String(serverId))
        ? client.delete(`/${prefix}/${serverId}`)
        : client.delete(`/api/cim/power-cable/${serverId}`)
}
