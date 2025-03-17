import client from '@/utils/client'

const API_PREFIX = 'api/v1'
const RESOURCE = 'fmeca'

export const get = () => {
    return client.get(`${API_PREFIX}/${RESOURCE}/GetOrInit`)
}

export const update = (id, data) => {
    return client.put(`${API_PREFIX}/${RESOURCE}/${id}`, data)
}