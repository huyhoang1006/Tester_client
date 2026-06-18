import client from '@/utils/client'
const prefix = 'api/test'

export const createSurgeArresterJob = (data, deviceId) => {
    return client.post(`/${prefix}/upload/sa`, data, {
        params: {
            deviceId
        }
    })
}

export const getSurgeArresterJobById = (id) => {
    return client.get(`/${prefix}/download/sa/${id}`)
}