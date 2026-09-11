/* eslint-disable */
import * as AssetMediaAPI from '@/api/demo/AssetMedia.js'

export const ASSET_MEDIA_TYPES = {
    Organisation: 'organisation',
    Substation: 'substation',
    Transformer: 'transformer',
    Bushing: 'bushing',
    'Surge arrester': 'surge-arrester',
    'Circuit breaker': 'circuit-breaker',
    'Current transformer': 'current-transformer',
    'Voltage transformer': 'voltage-transformer',
    'Power cable': 'power-cable',
    Disconnector: 'disconnector',
    Capacitor: 'capacitor',
    Reactor: 'reactor',
    'Rotating machine': 'rotating-machine',
}

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp']

export const uploadAssetMediaFromAttachmentData = async (assetTypeLabel, assetId, attachmentData = [], previousAttachmentData = []) => {
    const assetType = resolveAssetMediaType(assetTypeLabel)
    if (!assetType || !assetId) return null

    const nameplateFormData = new FormData()
    const attachmentsFormData = new FormData()
    let hasNameplate = false
    let attachmentCount = 0

    for (const item of attachmentData) {
        if (!item || !item.path || item.remote || isRemotePath(item.path)) continue
        const file = await localPathToFile(item.path)
        if (!file) continue
        const uploadName = item.name || file.name

        if (item.role === 'nameplate') {
            nameplateFormData.append('nameplate', file, uploadName)
            hasNameplate = true
        } else {
            attachmentsFormData.append('attachments', file, uploadName)
            attachmentCount += 1
        }
    }

    const deleteAttachmentIds = resolveDeletedAttachmentIds(previousAttachmentData, attachmentData)
    const removeNameplate = shouldRemoveNameplate(previousAttachmentData, attachmentData)

    if (!hasNameplate && attachmentCount === 0 && deleteAttachmentIds.length === 0 && !removeNameplate) return null

    const result = {
        nameplate: null,
        attachments: null,
        deleted: null,
    }

    if (hasNameplate) {
        result.nameplate = await AssetMediaAPI.uploadAssetMedia(assetType, assetId, nameplateFormData)
    }
    if (attachmentCount > 0) {
        result.attachments = await AssetMediaAPI.uploadAssetMedia(assetType, assetId, attachmentsFormData)
    }
    if (removeNameplate) {
        result.deleted = await AssetMediaAPI.uploadAssetMedia(assetType, assetId, new FormData(), {
            removeNameplate,
        })
    }
    if (deleteAttachmentIds.length > 0) {
        result.deletedAttachments = await Promise.all(
            deleteAttachmentIds.map(mediaId => AssetMediaAPI.deleteAssetMedia(assetType, assetId, mediaId))
        )
    }

    console.log('[asset-media] Uploaded media:', { assetTypeLabel, assetType, assetId, hasNameplate, attachmentCount, deleteAttachmentIds, removeNameplate, result })
    return result
}

export const downloadAssetMediaToAttachmentData = async (assetTypeLabel, assetId) => {
    if (!assetId) return []

    const { assetType, media } = await getAssetMediaWithFallback(assetTypeLabel, assetId)
    if (!assetType) return []
    const items = normalizeAssetMediaResponse(media)
    console.log('[asset-media] Loaded media:', { assetTypeLabel, assetType, assetId, media, items })
    const output = []

    for (const item of items) {
        const mediaId = item.mediaId || item.id || item.mrid || item.mRID
        const name = item.fileName || item.filename || item.name || item.originalFileName || `asset-media-${mediaId || Date.now()}`
        const role = resolveMediaRole(item)
        const serverDownloadUrl = item.downloadUrl || item.url || item.path

        if (!mediaId) {
            if (serverDownloadUrl) {
                output.push({ path: serverDownloadUrl, name, role })
            }
            continue
        }

        output.push({
            path: serverDownloadUrl || AssetMediaAPI.getAssetMediaDownloadUrl(assetType, assetId, mediaId),
            name,
            role,
            serverDownloadUrl,
            serverMediaId: mediaId,
            serverAssetType: assetType,
            serverAssetId: assetId,
            remote: true,
        })
    }

    return output
}

export const materializeServerMediaItem = async (item, refreshStaleMetadata = true) => {
    if (!item || !item.serverAssetType || !item.serverAssetId || !item.serverMediaId) return item

    const downloaded = await downloadServerMediaBlob(item, refreshStaleMetadata)
    const resolvedItem = downloaded.item
    const blob = downloaded.blob

    const base64 = await blobToBase64(blob)
    const canWriteLocal = window.electronAPI
        && typeof window.electronAPI.writeAttachmentFileData === 'function'
    const saved = canWriteLocal
        ? await window.electronAPI.writeAttachmentFileData(
            base64,
            buildLocalMediaName(
                resolvedItem.serverAssetType,
                resolvedItem.serverAssetId,
                resolvedItem.serverMediaId,
                resolvedItem.name
            )
        )
        : null

    return {
        ...resolvedItem,
        path: saved && saved.success && saved.path ? saved.path : URL.createObjectURL(blob),
        downloadFailed: false,
    }
}

export const createServerMediaPreviewUrl = async (item) => {
    const downloaded = await downloadServerMediaBlob(item)
    return URL.createObjectURL(downloaded.blob)
}

const downloadServerMediaBlob = async (item, refreshStaleMetadata = true) => {
    let response
    try {
        response = item.serverDownloadUrl
            ? await AssetMediaAPI.downloadAssetMediaUrl(item.serverDownloadUrl)
            : await AssetMediaAPI.downloadAssetMedia(
                item.serverAssetType,
                item.serverAssetId,
                item.serverMediaId
            )
    } catch (error) {
        if (item.serverDownloadUrl) {
            try {
                response = await AssetMediaAPI.downloadAssetMedia(
                    item.serverAssetType,
                    item.serverAssetId,
                    item.serverMediaId
                )
            } catch (fallbackError) {
                error = fallbackError
            }
        }
        if (response) {
            return buildDownloadedMedia(response, item)
        }
        if (!refreshStaleMetadata) throw error

        const { assetType, media } = await getAssetMediaWithFallback(item.serverAssetType, item.serverAssetId)
        const latestItem = normalizeAssetMediaResponse(media).find(candidate => {
            const candidateName = candidate.fileName || candidate.filename || candidate.name || candidate.originalFileName
            return candidateName === item.name && resolveMediaRole(candidate) === item.role
        })
        const latestMediaId = latestItem && (latestItem.mediaId || latestItem.id || latestItem.mrid || latestItem.mRID)
        if (!latestMediaId || String(latestMediaId) === String(item.serverMediaId)) throw error

        return downloadServerMediaBlob({
            ...item,
            path: latestItem.downloadUrl || AssetMediaAPI.getAssetMediaDownloadUrl(assetType, item.serverAssetId, latestMediaId),
            serverDownloadUrl: latestItem.downloadUrl || latestItem.url || latestItem.path,
            serverAssetType: assetType,
            serverMediaId: latestMediaId,
        }, false)
    }

    return buildDownloadedMedia(response, item)
}

const buildDownloadedMedia = (response, item) => {
    const blob = toMediaBlob(unwrapResponseData(response), item.name)
    if (!blob) throw new TypeError(`Media ${item.serverMediaId} did not return binary content`)

    return {
        blob,
        item,
    }
}

const toMediaBlob = (value, name) => {
    const mimeType = imageMimeType(name)
    if (value instanceof Blob) {
        return value.type || !mimeType
            ? value
            : new Blob([value], { type: mimeType })
    }
    if (value instanceof ArrayBuffer) {
        return new Blob([value], { type: mimeType || 'application/octet-stream' })
    }
    if (ArrayBuffer.isView(value)) {
        return new Blob([value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength)], {
            type: mimeType || 'application/octet-stream',
        })
    }
    if (typeof value === 'string') {
        const dataUrlMatch = value.match(/^data:([^;,]+)?;base64,(.+)$/)
        const base64 = dataUrlMatch ? dataUrlMatch[2] : value
        if (dataUrlMatch || /^[A-Za-z0-9+/=\r\n]+$/.test(base64)) {
            return base64ToBlob(base64.replace(/\s/g, ''), dataUrlMatch && dataUrlMatch[1] || mimeType || 'application/octet-stream')
        }
    }
    if (value && typeof value === 'object') {
        const binary = value.base64 || value.content || value.bytes || value.fileData
        if (binary) return toMediaBlob(binary, name)
    }
    return null
}

const resolveAssetMediaType = (assetTypeLabel) => {
    return ASSET_MEDIA_TYPES[assetTypeLabel] || toKebabAssetType(assetTypeLabel)
}

const getAssetMediaWithFallback = async (assetTypeLabel, assetId) => {
    const candidates = [resolveAssetMediaType(assetTypeLabel)]
    let lastError = null
    for (const assetType of candidates) {
        try {
            const media = await AssetMediaAPI.getAssetMedia(assetType, assetId)
            return { assetType, media }
        } catch (error) {
            lastError = error
        }
    }
    console.warn('[asset-media] Cannot load media:', { assetTypeLabel, assetId, lastError })
    return { assetType: null, media: null }
}

const normalizeAssetMediaResponse = (media) => {
    const data = unwrapResponseData(media)
    if (!data) return []
    if (Array.isArray(data)) return data

    const result = []
    const nameplate = data.nameplate || data.namePlate || data.nameplateMedia || data.namePlateMedia || data.nameplateFile || data.namePlateFile
    const attachments = data.attachments || data.attachment || data.assetAttachments || data.attachmentFiles || data.files || data.media || data.medias || []

    if (nameplate) {
        result.push({ ...nameplate, role: 'nameplate' })
    }
    if (Array.isArray(attachments)) {
        result.push(...attachments)
    }
    return result
}

const unwrapResponseData = (response) => {
    let value = response
    let depth = 0

    while (value && !(value instanceof Blob) && typeof value === 'object'
        && Object.prototype.hasOwnProperty.call(value, 'data') && depth < 5) {
        const next = value.data
        if (next === value || next === undefined) break
        value = next
        depth += 1
    }

    return value
}

const resolveMediaRole = (item) => {
    const role = String(item.role || item.mediaType || item.type || item.category || '').toLowerCase()
    if (role.includes('nameplate') || role.includes('name_plate')) return 'nameplate'
    const name = item.fileName || item.filename || item.name || item.originalFileName || ''
    if (IMAGE_EXTENSIONS.includes(getExtension(name)) && item.isNameplate) return 'nameplate'
    return undefined
}

const localPathToFile = async (localPath) => {
    if (window.electronAPI && typeof window.electronAPI.readAbsoluteFileData === 'function') {
        const rs = await window.electronAPI.readAbsoluteFileData(localPath)
        if (!rs || !rs.success || !rs.base64) {
            console.warn('[asset-media] Cannot read local file:', localPath, rs && rs.message)
            return null
        }
        const blob = base64ToBlob(rs.base64, rs.mimeType || 'application/octet-stream')
        return new File([blob], rs.name || fileName(localPath), { type: rs.mimeType || blob.type })
    }

    const response = await fetch(toFileUrl(localPath))
    if (!response.ok) return null
    const blob = await response.blob()
    return new File([blob], fileName(localPath), { type: blob.type || 'application/octet-stream' })
}

const resolveDeletedAttachmentIds = (previousAttachmentData = [], attachmentData = []) => {
    const currentIds = new Set((attachmentData || [])
        .filter(item => item && item.role !== 'nameplate' && item.serverMediaId)
        .map(item => String(item.serverMediaId)))

    return (previousAttachmentData || [])
        .filter(item => item && item.role !== 'nameplate' && item.serverMediaId)
        .map(item => item.serverMediaId)
        .filter(id => !currentIds.has(String(id)))
}

const shouldRemoveNameplate = (previousAttachmentData = [], attachmentData = []) => {
    const hadNameplate = (previousAttachmentData || []).some(item => item && item.role === 'nameplate' && item.serverMediaId)
    const hasNameplate = (attachmentData || []).some(item => item && item.role === 'nameplate' && item.path)
    return hadNameplate && !hasNameplate
}

const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64)
    const byteArrays = []
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512)
        const byteNumbers = new Array(slice.length)
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i)
        }
        byteArrays.push(new Uint8Array(byteNumbers))
    }
    return new Blob(byteArrays, { type: mimeType })
}

const blobToBase64 = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
        const value = String(reader.result || '')
        resolve(value.includes(',') ? value.split(',').pop() : value)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
})

const buildLocalMediaName = (assetType, assetId, mediaId, name) => {
    return `server-media/${assetType}/${assetId}/${mediaId}-${fileName(name)}`
}

const isRemotePath = (value) => /^(https?:|blob:|data:|\/api\/)/i.test(String(value || ''))
const toFileUrl = (value) => `file:///${String(value || '').replace(/\\/g, '/')}`
const toKebabAssetType = (value) => String(value || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
const fileName = (value) => String(value || '').split(/[\\/]/).pop()
const getExtension = (value) => {
    const parts = fileName(value).split('.')
    return parts.length > 1 ? parts.pop().toLowerCase() : ''
}
const imageMimeType = (value) => ({
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    bmp: 'image/bmp',
    webp: 'image/webp',
}[getExtension(value)] || '')
