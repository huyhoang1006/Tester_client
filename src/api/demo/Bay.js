/* eslint-disable */
import client from '@/utils/client'
import { toServerId } from '@/utils/serverId'

export const getBayById = (bayId) => {
    if (!bayId) {
        return Promise.reject(new Error('bayId is required'))
    }
    return client.get(`/api/bay/cim/${toServerId(bayId)}`)
}

export const createBay = (data, ownerId, ownerType) => {
    return client.post(`/api/bay/cim/create`, data, {
        params: {
            ownerId: toServerId(ownerId),
            ownerType: ownerType
        }
    })
}