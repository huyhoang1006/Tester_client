/* eslint-disable */
import client from '@/utils/client'
import { toServerId } from '@/utils/serverId'
const prefix = 'api/voltage-transformer'
export const getVoltageTransformerById = (id) => {
    return client.get(`/${prefix}/${toServerId(id)}`)
}

export const createVoltageTransformer = (data, ownerId, ownerType) => {
    return client.post(`/${prefix}/create`, data, {
        params: {
            ownerId: toServerId(ownerId),
            ownerType
        }
    })
}

export const deleteVoltageTransformer = (id) => {
    return client.delete(`/${prefix}/${toServerId(id)}`)
}
