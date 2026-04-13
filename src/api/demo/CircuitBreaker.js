/* eslint-disable */
import client from '@/utils/client'
const prefix = 'api/circuit-breaker/cim'
export const getCircuitBreakerById = (id) => {
    return client.get(`/${prefix}/${id}`)
}