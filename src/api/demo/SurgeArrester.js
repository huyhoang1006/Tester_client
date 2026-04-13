/* eslint-disable */
import client from '@/utils/client'
const prefix = 'api/surge-arrester'
export const getSurgeArresterById = (id) => {
    return client.get(`/${prefix}/${id}`)
}