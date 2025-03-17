import client from '@/utils/client'

const API_PREFIX = 'api/v1'
const RESOURCE = 'assets'

export const getAll = () => {
    return client.get(`${API_PREFIX}/${RESOURCE}`)
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

export const upload = (listLocation, listAsset) => {
    const data = {
        listLocation,
        listAsset
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

export const getAssetByLocation = (locationId) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/getAssetByLocation/` + locationId)
}

export const findAssetByLocationId = (locationId, stt, sl) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/findAssetByLocationId/` + locationId + "/" + stt + "/" + sl)
}

export const countAssetByLocationId = (locationId) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/countAssetByLocationId/` + locationId)
}