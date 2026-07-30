/* eslint-disable */
import client from '@/utils/client'
import { toServerId } from '@/utils/serverId'

export const getOwnerOrganisation = () => {
    // API cũ có số 1 cứng ở cuối, giữ nguyên logic
    return client.get('/api/organisation/get-owner-organisation')
}

export const getChildOrganisation = (organisationId) => {
    return client.get(`/api/organisation/get-child-organisation/${toServerId(organisationId)}`)
}

export const getOrganisationById = (organisationId) => {
    return client.get(`/api/organisation/cim/${toServerId(organisationId)}`)
}

export const getChildSubstation = (organisationId) => {
    return client.get(`/api/substation/get-by-organisation/${toServerId(organisationId)}`)
}

export const getSubstationById = (substationId) => {
    // API endpoint để lấy chi tiết substation đầy đủ
    return client.get(`/api/substation/cim/${toServerId(substationId)}`)
}
export const getVoltageLevelById = (voltageLevelId) => {
    // API endpoint để lấy chi tiết voltage level đầy đủ
    return client.get(`/api/voltage-level/cim/${toServerId(voltageLevelId)}`)
}

export const getTransformerById = (id) => {
    return client.get(`/api/transformer/${toServerId(id)}`)
}

export const getChildBay = (substationId) => {
    return client.get(`/api/bay/get-by-substation/${toServerId(substationId)}`)
}

export const getVoltageLevelBySubstationId = (substationId) => {
    return client.get(`/api/voltage-level/get-by-substation/${toServerId(substationId)}`)
}

export const getBayByVoltageLevel = (voltageLevelId) => {
    return client.get(`/api/bay/get-by-voltage-level/${toServerId(voltageLevelId)}`)
}

export const getBayById = (bayId) => {
    if (!bayId) {
        return Promise.reject(new Error('bayId is required'))
    }
    return client.get(`/api/bay/cim/${toServerId(bayId)}`)
}

export const getAssetById = (assetId, mode) => {
    if (!assetId) {
        return Promise.reject(new Error('assetId is required'))
    } else {
        if (mode == 'PowerCable') {
            return client.get(`/api/power-cable/${toServerId(assetId)}`)
        } else if (mode == 'SurgeArrester') {
            return client.get(`/api/surge-arrester/${toServerId(assetId)}`)
        } else if (mode == 'Disconnector') {
            return client.get(`/api/disconnector/${toServerId(assetId)}`)
        } else if (mode == 'Bushing') {
            return client.get(`/api/bushing/${toServerId(assetId)}`)
        } else if (mode == 'VoltageTransformer') {
            return client.get(`/api/voltage-transformer/${toServerId(assetId)}`)
        } else if (mode == 'CurrentTransformer') {
            return client.get(`/api/current-transformer/${toServerId(assetId)}`)
        } else if (mode == 'CircuitBreaker') {
            return client.get(`/api/circuit-breaker/cim/${toServerId(assetId)}`)
        } else if (mode == 'Transformer') {
            return client.get(`/api/transformer/${toServerId(assetId)}`)
        }
    }
}

export const getAssetByOwner = (ownerId, mode) => {
    // 1. Lấy chuỗi JSON từ Local Storage
    const userString = localStorage.getItem('user')

    // 2. Phân tích cú pháp chuỗi thành đối tượng JavaScript
    // Cần kiểm tra userString có tồn tại không để tránh lỗi
    if (!userString) {
        console.error("Không tìm thấy dữ liệu 'user' trong Local Storage.")
        return Promise.reject(new Error('Missing user data'))
    }

    try {
        const user = JSON.parse(userString)

        // 3. Truy cập thuộc tính user_id

        // 4. Gọi API
        return client.get(`/api/asset/get-by-owner/${toServerId(ownerId)}/${mode}`)
    } catch (e) {
        console.error("Lỗi phân tích cú pháp JSON cho dữ liệu 'user':", e)
        return Promise.reject(new Error('Invalid user data format'))
    }
}

export const createPowerCableCim = (data, ownerId, ownerType) => {
    return client.post(`/api/power-cable/create`, data)
}

export const createSubstation = (data, ownerId) => {
    return client.post(`/api/substation/cim/create`, data, {
        params: {
            ownerId: toServerId(ownerId)
        }
    })
}

export const createVoltageLevel = (data, ownerId) => {
    return client.post(`/api/voltage-level/cim/create`, data, {
        params: {
            ownerId: toServerId(ownerId)
        }
    })
}

export const createBay = (data, ownerId, ownerType) => {
    return client.post(`/api/bay/cim/create`, data, {
        params: {
            ownerId: toServerId(ownerId),
            ownerType: ownerType
        }
    })
}

export const createTransformer = (data) => {
    return client.post(`/api/transformer/cim/create`, data)
}

export const deleteOrganisation = (id) => {
    return client.delete(`/api/organisation/${toServerId(id)}`)
}

export const deleteSubstation = (id) => {
    return client.delete(`/api/substation/${toServerId(id)}`)
}

export const deleteVoltageLevel = (id) => {
    return client.delete(`/api/voltage-level/${toServerId(id)}`)
}

export const deleteBay = (id) => {
    return client.delete(`/api/bay/${toServerId(id)}`)
}

export const deletePowerCable = (id) => {
    return client.delete(`/api/power-cable/${toServerId(id)}`)
}
