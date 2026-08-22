/* eslint-disable */
import client from '@/utils/client'
import { toServerId } from '@/utils/serverId'
import store from '@/store'

const mediaPath = (assetType, assetId) => {
    const id = toServerId(assetId)
    if (assetType === 'organisation') return `api/organisations/${id}/media`
    if (assetType === 'substation') return `api/substations/${id}/media`
    return `api/assets/${assetType}/${id}/media`
}

const genericMediaPath = (assetType, assetId) =>
    `api/assets/${assetType}/${toServerId(assetId)}/media`

const requestWithGenericFallback = async (assetType, request) => {
    try {
        return await request(mediaPath(assetType.assetType, assetType.assetId))
    } catch (error) {
        if (!['organisation', 'substation'].includes(assetType.assetType)) throw error
        return request(genericMediaPath(assetType.assetType, assetType.assetId))
    }
}

export const getAssetMedia = (assetType, assetId) => requestWithGenericFallback(
    { assetType, assetId },
    path => client.get(`/${path}`)
)

export const uploadAssetMedia = (assetType, assetId, formData, options = {}) => {
    return client.post(`/${mediaPath(assetType, assetId)}`, formData, {
        params: {
            deleteAttachmentIds: options.deleteAttachmentIds || undefined,
            removeNameplate: options.removeNameplate || undefined,
        },
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
}

export const downloadAssetMedia = (assetType, assetId, mediaId) => requestWithGenericFallback(
    { assetType, assetId },
    path => client.get(`/${path}/${toServerId(mediaId)}/download`, {
        responseType: 'blob',
    })
)

export const getAssetMediaDownloadUrl = (assetType, assetId, mediaId) => {
    const base = store.state.serviceAddr ? String(store.state.serviceAddr).replace(/\/$/, '') : ''
    return `${base}/${mediaPath(assetType, assetId)}/${toServerId(mediaId)}/download`
}

export const deleteAssetMedia = (assetType, assetId, mediaId) => {
    return client.delete(`/${mediaPath(assetType, assetId)}/${toServerId(mediaId)}`)
}
