/* eslint-disable */
import client from '@/utils/client'
const prefix = 'api/transformer'
export const getTransformerById = (id) => {
    return client.get(`/${prefix}/${id}`)
}

export const createTransformer = (data) => {
    return client.post(`/${prefix}/create`, data)
}