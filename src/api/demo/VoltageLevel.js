/* eslint-disable */
import client from '@/utils/client'
import { toServerId } from '@/utils/serverId'

export const getVoltageLevelById = (voltageLevelId) => {
    // API endpoint để lấy chi tiết voltage level đầy đủ
    return client.get(`/api/voltage-level/cim/${toServerId(voltageLevelId)}`)
}

export const createVoltageLevel = (data, ownerId) => {
    return client.post(`/api/voltage-level/cim/create`, data, {
        params: {
            ownerId: toServerId(ownerId)
        }
    })
}