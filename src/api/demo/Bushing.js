/* eslint-disable */
import client from '@/utils/client'

const prefix = 'api/bushing'

export const getBushingById = (id) => {
    return client.get(`/${prefix}/${id}`)
}

export const createBushing = (data) => {
    return client.post(`/${prefix}/create`, data)
}
