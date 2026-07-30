/* eslint-disable */
import client from '@/utils/client'
import { toServerId } from '@/utils/serverId'

const prefix = 'api/bushing'

export const getBushingById = (id) => {
    return client.get(`/${prefix}/${toServerId(id)}`)
}

export const createBushing = (data) => {
    return client.post(`/${prefix}/create`, data)
}

export const deleteBushing = (id) => {
    return client.delete(`/${prefix}/${toServerId(id)}`)
}
