/* eslint-disable */
import { downloadAssetMediaToAttachmentData, materializeServerMediaItem } from '@/utils/assetMedia.js'
import uuid from '@/utils/uuid'

export async function applyDownloadedAssetMedia(dto, assetType, serverAssetId) {
    try {
        const remoteAttachmentData = await downloadAssetMediaToAttachmentData(assetType, serverAssetId)
        if (!remoteAttachmentData.length) return

        const attachmentData = await Promise.all(remoteAttachmentData.map(async item => {
            const localItem = await materializeServerMediaItem(item)
            if (!localItem?.path || /^(https?:|blob:|data:|\/api\/)/i.test(String(localItem.path))) {
                throw new Error(`Cannot save media file locally: ${item?.name || item?.serverMediaId || 'unknown'}`)
            }
            return { ...localItem, remote: false }
        }))

        dto.attachmentId = dto.attachmentId || uuid.newUuid()
        dto.attachment = dto.attachment || {}
        dto.attachment.id = dto.attachmentId
        dto.attachment.name = null
        dto.attachment.type = 'asset'
        dto.attachment.id_foreign = dto.properties?.mrid || dto.mrid || String(serverAssetId)
        dto.attachment.path = JSON.stringify(attachmentData)
    } catch (error) {
        console.warn(`[Download ${assetType} Media] Error:`, error)
        throw error
    }
}
