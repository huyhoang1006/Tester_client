/* eslint-disable */
import client from '@/utils/client'
const prefix = 'api/current-transformer'
export const getCurrentTransformerById = (id) => {
    return client.get(`/${prefix}/${id}`)
}

export const createCurrentTransformer = (data, ownerId, ownerType) => {
    return client.post(`/${prefix}/create`, data, {
        params: {
            ownerId,
            ownerType
        }
    })
}

export const deleteCurrentTransformer = (id) => {
    return client.delete(`/${prefix}/${id}`)
}
