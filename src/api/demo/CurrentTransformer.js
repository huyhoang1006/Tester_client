/* eslint-disable */
import client from '@/utils/client'
const prefix = 'api/current-transformer/cim'
export const getCurrentTransformerById = (id) => {
    return client.get(`/${prefix}/${id}`)
}