import client from '@/utils/client'

const API_PREFIX = 'api/v1'
const RESOURCE = 'tests'

export const getTestsByJobId = (jobId) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/testsByJobId/${jobId}`)
}
