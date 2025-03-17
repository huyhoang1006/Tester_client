import client from '@/utils/client'

const API_PREFIX = 'api/v1'
const RESOURCE = 'voltage/job'

export const deleteAll = (jobList) => {
    return client.post(`${API_PREFIX}/${RESOURCE}/delete`, jobList)
}

export const save = (voltageList) => {
    return client.post(`${API_PREFIX}/${RESOURCE}/save`, voltageList)
}

export const findAllJobByAssetId = (asset_id) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/findAllJobByAssetId/${asset_id}`)
}

export const collab = (jobId, listUserId) => {
    return client.post(`${API_PREFIX}/${RESOURCE}/share/${jobId}`, listUserId)
}

export const findJobByAssetId = (assetId, stt, sl) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/findJobByAssetId/` + assetId + "/" + stt + "/" + sl)
}

export const countJobByAssetId = (assetId) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/countJobByAssetId/` + assetId)
}