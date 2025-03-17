import client from '@/utils/client'

const API_PREFIX = 'api/v1'
const RESOURCE = 'jobs'

export const getAll = () => {
    return client.get(`${API_PREFIX}/${RESOURCE}/all`)
}

export const lock = (locked, listId) => {
    const data = {
        listId
    }
    const api = locked ? 'lock' : 'unlock'
    return client.put(`${API_PREFIX}/${RESOURCE}/${api}`, data)
}

export const download = (listId) => {
    // const data = {
    //     listId
    // }
    // return client.post(`${API_PREFIX}/${RESOURCE}/download`, data)
    return client.get(`${API_PREFIX}/${RESOURCE}/download?listId=${listId.join(',')}`)
}

export const upload = (listLocation, listAsset, listJob) => {
    const data = {
        listLocation,
        listAsset,
        listJob
    }
    return client.post(`${API_PREFIX}/${RESOURCE}/upload`, data)
}

export const deleteMultiple = (listId) => {
    // const data = {
    //     listId
    // }
    // return client.post(`${API_PREFIX}/${RESOURCE}/download`, data)
    return client.delete(`${API_PREFIX}/${RESOURCE}/delete-multiple?listId=${listId.join(',')}`)
}

export const getById = (id) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/${id}`)
}

export const collab = (id, listId) => {
    const data = {
        listId
    }

    return client.put(`${API_PREFIX}/${RESOURCE}/${id}/updateCollabs`, data)
}

export const getJobByAsset = (assetId) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/jobsByAssetId/` + assetId)
}

export const findJobByAssetId = (assetId, stt, sl) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/findJobByAssetId/` + assetId + "/" + stt + "/" + sl)
}

export const countJobByAssetId = (assetId) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/countJobByAssetId/` + assetId)
}