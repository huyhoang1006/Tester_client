/* eslint-disable */
import client from '@/utils/client'
const prefix = 'api/circuit-breaker/cim'
export const getCircuitBreakerById = (id) => {
    return client.get(`/${prefix}/${id}`)
}

export const createCircuitBreaker = (data, ownerId, ownerType) => {
    console.log('createCircuitBreaker', JSON.stringify(data))
    return client.post(`/${prefix}/create`, data, {
        params: {
            ownerId,
            ownerType
        }
    })
}