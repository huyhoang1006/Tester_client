/* eslint-disable */
import client from '@/utils/client'
const prefix = 'api/voltage-transformer'
export const getVoltageTransformerById = (id) => {
    return client.get(`/${prefix}/${id}`)
}