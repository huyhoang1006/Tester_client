/* eslint-disable */
import client from '@/utils/client'
import { toServerId } from '@/utils/serverId'

export const getSubstationById = (substationId) => {
    // API endpoint để lấy chi tiết substation đầy đủ
    return client.get(`/api/substation/cim/${toServerId(substationId)}`)
}

export const createSubstation = (data, ownerId) => {
    return client.post(`/api/substation/cim/create`, data, {
        params: {
            ownerId: toServerId(ownerId)
        }
    })
}