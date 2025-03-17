import client from '@/utils/client'

const API_PREFIX = 'api/v1'
const RESOURCE = 'locations'

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

export const deleteMultiple = (listId) => {
    // const data = {
    //     listId
    // }
    // return client.post(`${API_PREFIX}/${RESOURCE}/download`, data)
    return client.delete(`${API_PREFIX}/${RESOURCE}/delete-multiple?listId=${listId.join(',')}`)
}

export const upload = (listLocation) => {
    const data = {
        listLocation
    }
    return client.post(`${API_PREFIX}/${RESOURCE}/upload`, data)
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

export const findLocationByRefIdAndUser = (ref_id, stt, sl) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/findLocationByRefIdAndUser/${ref_id}/${stt}/${sl}`)
}

export const countLocationByRefIdAndUser = (ref_id) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/countLocationByRefIdAndUser/${ref_id}`)
}

export const findAllLocationByRefId = (ref_id) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/findAllLocationByRefId/${ref_id}`)
}