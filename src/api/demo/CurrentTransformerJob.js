import client from '@/utils/client'
const prefix = 'api/test'

export const createCurrentTransformerJob = (data, deviceId) => {
    return client.post(`/${prefix}/upload/ct`, data, {
        params: {
            deviceId
        }
    })
}

export const getCurrentTransformerJobById = (id) => {
    return client.get(`/${prefix}/download/ct/${id}`)
}