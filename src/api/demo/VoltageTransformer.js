/* eslint-disable */
import client from '@/utils/client'
import constant from '@/utils/constant'
const prefix = 'voltage-transformer'
export const getVoltageTransformerById = (id) => {
    return client.get(`${constant.API_BASE_URL}${prefix}/${id}`)
}