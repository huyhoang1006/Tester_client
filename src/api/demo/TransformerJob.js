import client from '@/utils/client'
const prefix = 'api/test'

export const createTransformerJob = (data, deviceId) => {
    return client.post(`/${prefix}/upload/transformer`, data, {
        params: {
            deviceId
        }
    })
}

export const getTransformerJobById = (id) => {
    return client.get(`/${prefix}/download/transformer/${id}`)
}