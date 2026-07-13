/* eslint-disable */
import client from '@/utils/client'

export const getBayById = (bayId) => {
    if (!bayId) {
        return Promise.reject(new Error('bayId is required'))
    }
    return client.get(`/api/bay/cim/${bayId}`)
}

export const createBay = (data, ownerId, ownerType) => {
    return client.post(`/api/bay/cim/create`, data, {
        params: {
            ownerId: ownerId,
            ownerType: ownerType
        }
    })
}