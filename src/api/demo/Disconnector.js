/* eslint-disable */
import client from '@/utils/client'
const prefix = 'api/disconnector'
export const getDisconnectorById = (id) => {
    return client.get(`/${prefix}/${id}`)
}