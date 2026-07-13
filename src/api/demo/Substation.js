/* eslint-disable */
import client from '@/utils/client'

export const getSubstationById = (substationId) => {
    // API endpoint để lấy chi tiết substation đầy đủ
    return client.get(`/api/substation/cim/${substationId}`)
}

export const createSubstation = (data, ownerId) => {
    return client.post(`/api/substation/cim/create`, data, {
        params: {
            ownerId: ownerId
        }
    })
}