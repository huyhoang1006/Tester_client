/* eslint-disable */
import client from '@/utils/client'
const prefix = 'api/voltage-transformer'
export const getVoltageTransformerById = (id) => {
    return client.get(`/${prefix}/${id}`)
}

export const createVoltageTransformer = (data, ownerId, ownerType) => {
    return client.post(`/${prefix}/create`, data, {
        params: {
            ownerId,
            ownerType
        }
    })
}