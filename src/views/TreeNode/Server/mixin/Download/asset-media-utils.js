/* eslint-disable */
import { downloadAssetMediaToAttachmentData } from '@/utils/assetMedia.js'
import uuid from '@/utils/uuid'

export async function applyDownloadedAssetMedia(dto, assetType, serverAssetId) {
    try {
        const attachmentData = await downloadAssetMediaToAttachmentData(assetType, serverAssetId)
        if (!attachmentData.length) return

        dto.attachmentId = dto.attachmentId || uuid.newUuid()
        dto.attachment = dto.attachment || {}
        dto.attachment.id = dto.attachmentId
        dto.attachment.name = null
        dto.attachment.type = 'asset'
        dto.attachment.id_foreign = dto.properties?.mrid || dto.mrid || String(serverAssetId)
        dto.attachment.path = JSON.stringify(attachmentData)
    } catch (error) {
        console.warn(`[Download ${assetType} Media] Error:`, error)
    }
}
