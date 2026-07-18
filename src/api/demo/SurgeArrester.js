/* eslint-disable */
import client from '@/utils/client'
const prefix = 'api/surge-arrester'
export const getSurgeArresterById = (id) => {
    return client.get(`/${prefix}/${id}`)
}

export const createSurgeArrester = (data) => {
    return client.post(`/${prefix}/create`, data)
}

export const deleteSurgeArrester = (id) => {
    return client.delete(`/${prefix}/${id}`)
}
