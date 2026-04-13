/* eslint-disable */
import client from '@/utils/client'

export const getOwnerOrganisation = () => {
    // API cũ có số 1 cứng ở cuối, giữ nguyên logic
    return client.get('/api/organisation/get-owner-organisation')
}

export const getChildOrganisation = (organisationId) => {
    return client.get(`/api/organisation/get-child-organisation/${organisationId}`)
}

export const getOrganisationById = (organisationId) => {
    return client.get(`/api/organisation/cim/${organisationId}`)
}

export const getChildSubstation = (organisationId) => {
    return client.get(`/api/substation/get-by-organisation/${organisationId}`)
}

export const getSubstationById = (substationId) => {
    // API endpoint để lấy chi tiết substation đầy đủ
    return client.get(`/api/substation/cim/${substationId}`)
}
export const getVoltageLevelById = (voltageLevelId) => {
    // API endpoint để lấy chi tiết voltage level đầy đủ
    return client.get(`/api/voltage-level/cim/${voltageLevelId}`)
}

export const getTransformerById = (id) => {
    return client.get(`/api/transformer/${id}`)
}

export const getChildBay = (substationId) => {
    return client.get(`/api/bay/get-by-substation/${substationId}`)
}

export const getVoltageLevelBySubstationId = (substationId) => {
    return client.get(`/api/voltage-level/get-by-substation/${substationId}`)
}

export const getBayByVoltageLevel = (voltageLevelId) => {
    return client.get(`/api/bay/get-by-voltage-level/${voltageLevelId}`)
}

export const getBayById = (bayId) => {
    if (!bayId) {
        return Promise.reject(new Error('bayId is required'))
    }
    return client.get(`/api/bay/cim/${bayId}`)
}

export const getAssetById = (assetId, mode) => {
    if (!assetId) {
        return Promise.reject(new Error('assetId is required'))
    } else {
        if (mode == 'PowerCable') {
            return client.get(`/api/cim/power-cable/${assetId}`)
        } else if (mode == 'SurgeArrester') {
            return client.get(`/api/surge-arrester/${assetId}`)
        } else if (mode == 'Disconnector') {
            return client.get(`/api/disconnector/${assetId}`)
        } else if (mode == 'Bushing') {
            return client.get(`/api/bushing/${assetId}`)
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
        return client.get(`/api/asset/get-by-owner/${ownerId}/${mode}`)
    } catch (e) {
        console.error("Lỗi phân tích cú pháp JSON cho dữ liệu 'user':", e)
        return Promise.reject(new Error('Invalid user data format'))
    }
}

export const createPowerCableCim = (data, ownerId, ownerType) => {
    return client.post(`/api/cim/power-cable/create`, data, {
        params: {
            ownerId: ownerId,
            ownerType: ownerType
        }
    })
}

export const createSubstation = (data, ownerId) => {
    return client.post(`/api/substation/cim/create`, data, {
        params: {
            ownerId: ownerId
        }
    })
}

export const createVoltageLevel = (data, ownerId) => {
    return client.post(`/api/voltage-level/cim/create`, data, {
        params: {
            ownerId: ownerId
        }
    })
}

export const createBay = (data, ownerId, ownerType) => {
    return client.post(`/api/bay/cim/create`, data, {
        params: {
            ownerId: ownerId,
            ownerType: ownerType
        }
    })
}

export const createTransformer = (data, ownerId, ownerType) => {
    return client.post(`/api/transformer/cim/create`, data, {
        params: {
            ownerId: ownerId,
            ownerType: ownerType
        }
    })
}
