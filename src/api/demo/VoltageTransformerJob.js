import client from '@/utils/client'
const prefix = 'api/test'

export const createVoltageTransformerJob = (data, deviceId) => {
    return client.post(`/${prefix}/upload/vt`, data, {
        params: {
            deviceId
        }
    })
}

export const getVoltageTransformerJobById = (id) => {
    return client.get(`/${prefix}/download/vt/${id}`)
}