/* eslint-disable */
import client from '@/utils/client'
import { toServerId } from '@/utils/serverId'

export const getAllTestingEquipment = (params = {}) => {
    return client.get('/api/testing-equipment', { params })
}

export const getAccessories = (params = {}) => {
    return client.get('/api/testing-equipment/accessories', { params })
}

export const getTestingEquipmentById = (id) => {
    return client.get(`/api/testing-equipment/${encodeURIComponent(toServerId(id))}`)
}

export const findMatchingTestingEquipment = (serial, manufacturer) => {
    return client.get('/api/testing-equipment/match', { params: { serial, manufacturer } })
}

export const pushTestingEquipment = async (data) => {
    let id = data && (data.mrid || (data.properties && data.properties.mrid))
    if (id) {
        try {
            await getTestingEquipmentById(id)
            return client.put(`/api/testing-equipment/${encodeURIComponent(toServerId(id))}`, data)
        } catch (error) {
            if (!error.response || error.response.status !== 404) throw error
        }
    }
    const properties = data && data.properties
    if (properties && properties.serial_no && properties.manufacturer) {
        const match = await findMatchingTestingEquipment(properties.serial_no, properties.manufacturer)
        if (match && match.mrid) {
            if (String(match.owner_organisation_id) !== String(properties.owner_organisation_id)) {
                throw new Error('Matching equipment belongs to another Owner/Customer organisation')
            }
            id = match.mrid
            const matchedData = {
                ...data,
                mrid: id,
                properties: { ...properties, mrid: id }
            }
            return client.put(`/api/testing-equipment/${encodeURIComponent(toServerId(id))}`, matchedData)
        }
    }
    return client.post('/api/testing-equipment', data)
}

export const deleteTestingEquipment = (id) => {
    return client.delete(`/api/testing-equipment/${encodeURIComponent(toServerId(id))}`)
}
