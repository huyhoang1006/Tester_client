import client from '@/utils/client'

const API_PREFIX = 'api/v1'
const RESOURCE = 'owner'

export const findOwnerParentById = (stt, sl) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/findOwnerParentById/page/` + stt + "/" + sl)
}

export const countOwnerPre = () => {
    return client.get(`${API_PREFIX}/${RESOURCE}/count`)
}

export const countOwnerByRef = (userId, createdBy) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/countByRef/${userId}/${createdBy}`)
}

export const getOwnerByRefAndCreated = (userId, createdBy, stt, sl) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/getOwnerByRefAndCreated/${userId}/${createdBy}/${stt}/${sl}`)
}

export const findByRef = (ref_id, stt, sl) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/findByRef/${ref_id}/${stt}/${sl}`)
}

export const getOwnerByParentId = (id) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/getOwnerByParentId/${id}`)
}

export const countOwnerByRole = (role) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/countOwnerByRole/${role}`)
}

export const getOwnerByRole = (role, stt, sl) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/getOwnerByRole/${role}/${stt}/${sl}`)
}