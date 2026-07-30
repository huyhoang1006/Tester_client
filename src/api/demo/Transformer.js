/* eslint-disable */
import client from '@/utils/client'
import { toServerId } from '@/utils/serverId'
const prefix = 'api/transformer'
export const getTransformerById = (id) => {
    return client.get(`/${prefix}/${toServerId(id)}`)
}

export const createTransformer = (data) => {
    console.log('createTransformer', JSON.stringify(data))
    return client.post(`/${prefix}/create`, data)
}

export const deleteTransformer = (id) => {
    return client.delete(`/${prefix}/${toServerId(id)}`)
}
