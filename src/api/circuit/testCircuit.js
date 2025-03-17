import client from '@/utils/client'

const API_PREFIX = 'api/v1'
const RESOURCE = 'circuit/test'

export const deleteAll = (testList) => {
    return client.post(`${API_PREFIX}/${RESOURCE}/delete`, testList)
}

export const save = (testList) => {
    return client.post(`${API_PREFIX}/${RESOURCE}/insert`, testList)
}

export const findAllTestByJobId = (job_id) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/findAllTestByJobId/${job_id}`)
}
