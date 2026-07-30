/* eslint-disable */
import client from '@/utils/client'
import { toServerId } from '@/utils/serverId'
const prefix = 'api/disconnector'
export const getDisconnectorById = (id) => {
    return client.get(`/${prefix}/${toServerId(id)}`)
}

export const createDisconnector = (data) => {
    return client.post(`/${prefix}/create`, data)
}

export const deleteDisconnector = (id) => {
    return client.delete(`/${prefix}/${toServerId(id)}`)
}
