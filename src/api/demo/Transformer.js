/* eslint-disable */
import client from '@/utils/client'
const prefix = 'api/transformer'
export const getTransformerById = (id) => {
    return client.get(`/${prefix}/${id}`)
}

export const createTransformer = (data) => {
    console.log('createTransformer', JSON.stringify(data))
    return client.post(`/${prefix}/create`, data)
}

export const deleteTransformer = (id) => {
    return client.delete(`/${prefix}/${id}`)
}
