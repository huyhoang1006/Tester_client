/* eslint-disable */
import client from '@/utils/client'

const API_PREFIX = 'api/v1'
const RESOURCE = 'attachment'

export const upload = async(data) => {
    return client.post(`${API_PREFIX}/${RESOURCE}/upload`, data)
}

export const deleteAttachment = async(data) => {
    return client.post(`${API_PREFIX}/${RESOURCE}/delete`, data)
}

export const getDataAttachment = async(data) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/getAll/`+ data)
}
export const getNameAttachment = async(data) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/getName/`+ data)
}