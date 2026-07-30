/* eslint-disable */
import client from '@/utils/client'
import { toServerId } from '@/utils/serverId'
const prefix = 'api/circuit-breaker'
export const getCircuitBreakerById = (id) => {
    return client.get(`/${prefix}/${toServerId(id)}`)
}

export const createCircuitBreaker = (data, ownerId, ownerType) => {
    return client.post(`/${prefix}/create`, data, {
        params: {
            ownerId: toServerId(ownerId),
            ownerType
        }
    })
}

export const deleteCircuitBreaker = (id) => {
    return client.delete(`/${prefix}/${toServerId(id)}`)
}
