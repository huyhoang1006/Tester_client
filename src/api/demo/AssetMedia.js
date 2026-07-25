/* eslint-disable */
import client from '@/utils/client'
import store from '@/store'

const prefix = 'api/assets'

export const getAssetMedia = (assetType, assetId) => {
    return client.get(`/${prefix}/${assetType}/${assetId}/media`)
}

export const uploadAssetMedia = (assetType, assetId, formData, options = {}) => {
    return client.post(`/${prefix}/${assetType}/${assetId}/media`, formData, {
        params: {
            deleteAttachmentIds: options.deleteAttachmentIds || undefined,
            removeNameplate: options.removeNameplate || undefined,
        },
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
}

export const downloadAssetMedia = (assetType, assetId, mediaId) => {
    return client.get(`/${prefix}/${assetType}/${assetId}/media/${mediaId}/download`, {
        responseType: 'blob',
    })
}

export const getAssetMediaDownloadUrl = (assetType, assetId, mediaId) => {
    const base = store.state.serviceAddr ? String(store.state.serviceAddr).replace(/\/$/, '') : ''
    return `${base}/${prefix}/${assetType}/${assetId}/media/${mediaId}/download`
}

export const deleteAssetMedia = (assetType, assetId, mediaId) => {
    return client.delete(`/${prefix}/${assetType}/${assetId}/media/${mediaId}`)
}
