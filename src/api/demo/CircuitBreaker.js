/* eslint-disable */
import client from '@/utils/client'
const prefix = 'api/circuit-breaker'
export const getCircuitBreakerById = (id) => {
    return client.get(`/${prefix}/${id}`)
}

export const createCircuitBreaker = (data, ownerId, ownerType) => {
    return client.post(`/${prefix}/create`, data, {
        params: {
            ownerId,
            ownerType
        }
    })
}

export const deleteCircuitBreaker = (id) => {
    return client.delete(`/${prefix}/${id}`)
}
