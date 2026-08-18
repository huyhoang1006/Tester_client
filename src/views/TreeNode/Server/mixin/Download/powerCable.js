/* eslint-disable */
import * as powerCableAPI from '@/api/demo/PowerCable.js'
import * as PowerCableServerMapper from '@/views/Mapping/ServerToDTO/PowerCable/index.js'
import * as PowerCableMapper from '@/views/Mapping/PowerCable/index.js'
import PowerCableEntity from '@/views/Flatten/PowerCable'
import { fetchWithRetry } from './core-utils.js'
import { scopeAssetDtoForUser } from './id-scope'
import { traverseAndFillMrid, ensureTopLevelFK, FK_KEYS } from './fk-utils.js'
import { applyDownloadedAssetMedia } from './asset-media-utils.js'

/**
 * Tải POWER CABLE từ server về client.
 *
 * Trước đây thư mục này có 6 file asset và power cable không nằm trong số đó, nên bảng
 * chiến lược ở `core-utils` không có khoá `'Power cable'`. Kết quả: chọn power cable rồi
 * bấm tải thì `if (strategy)` không khớp, vòng lặp đi qua, không làm gì và cũng không báo
 * gì — trông y như "đang không chạy".
 *
 * ─── VỀ CÁCH GỘP ─────────────────────────────────────────────────────────────
 *
 * Không có `POWER_CABLE_FIELD_DEFS` trong `conflictUtils`, nên không dùng được bộ gộp
 * ba chiều + hộp thoại xung đột như current transformer. Đi theo tiền lệ của surge
 * arrester (cũng không có FIELD_DEFS): gộp đơn giản, không hộp thoại.
 *
 * Nguyên tắc đặt ra ở đây, cố ý hẹp:
 *
 *   - Chưa có bản local  -> lấy nguyên serverDto.
 *   - Đã có bản local    -> DỮ LIỆU lấy theo server (tải về nghĩa là kéo trạng thái
 *                           server), nhưng GIỮ LẠI mọi FK id của bản local.
 *
 * Giữ FK id là bắt buộc chứ không phải tuỳ chọn: `assetPsrId`, `assetInfoId`,
 * `oldCableInfoId`… đang được các bảng khác trỏ tới. Sinh id mới sẽ để lại một loạt bản
 * ghi mồ côi mà không có gì báo.
 *
 * KHÔNG tự bịa quy tắc gộp theo từng field cho 17 khối con (conductor, insulation,
 * armour, sheath…). Muốn hoà trộn ở mức field thì phải khai `FIELD_DEFS` cho power cable
 * trước, và đó là quyết định nghiệp vụ chứ không phải việc suy ra từ code.
 */

// ─── Step 1: fetch full info từ server ───────────────────────────────────────

export async function getPowerCableChain(id, parentId) {
    try {
        const data = await fetchWithRetry(() => powerCableAPI.getPowerCableById(id))
        return {
            powerCable: {
                id:          id,
                mrid:        String(id),
                name:        data?.assetInfo?.apparatusId || data?.assetInfo?.serialNo || '',
                parentId:    String(parentId),
                _type:       'asset',
                asset:       'Power cable',
                _serverData: data || {},
            },
            _type:       'asset',
            asset:       'Power cable',
            parentBayId: String(parentId),
        }
    } catch (error) {
        console.error(`Error fetching powerCable with id ${id}:`, error)
        throw new Error(`Error fetching powerCable with id ${id}: ${error.message}`)
    }
}

// ─── Step 2: save to DB ───────────────────────────────────────────────────────

export async function downloadPowerCableChain(data, ctx) {
    const pc         = data.powerCable
    const serverData = { ...pc._serverData, mRID: pc.mrid }
    const currentUserId = ctx.$store.state.user.user_id

    // 1. Map server → serverDto
    const serverDto = PowerCableServerMapper.mapServerToDto(serverData)
    scopeAssetDtoForUser(serverDto, currentUserId)
    serverDto.psrId = data.parentBayId
    if (serverDto.properties) serverDto.properties.mrid = pc.mrid
    serverDto.mrid = pc.mrid
    await applyDownloadedAssetMedia(serverDto, 'Power cable', pc.mrid)

    // 2. Lấy bản local cũ nếu đã tồn tại
    const existingResult = await window.electronAPI.getPowerCableEntityByMrid(
        pc.mrid, data.parentBayId
    )
    const clientEntity = existingResult.success ? existingResult.data : null
    const clientDto    = clientEntity
        ? PowerCableMapper.mapEntityToDto(clientEntity)
        : null
    scopeAssetDtoForUser(clientDto, currentUserId)

    // 3. Gộp
    let mergedDto
    if (!clientDto) {
        mergedDto = serverDto
    } else {
        mergedDto = { ...serverDto }
        // Giữ FK id của bản local để không sinh bản ghi mồ côi.
        for (const key of ['assetInfoId', 'productAssetModelId', 'lifecycleDateId',
                           'assetPsrId', 'locationId', 'oldCableInfoId', 'attachmentId']) {
            if (clientDto[key]) mergedDto[key] = clientDto[key]
        }
    }

    // 4. Set context id
    mergedDto.mrid = pc.mrid
    if (mergedDto.properties) mergedDto.properties.mrid = pc.mrid
    mergedDto.psrId = data.parentBayId

    // Điền mọi mrid + FK còn rỗng TRƯỚC khi map sang entity, tránh vi phạm khoá ngoại.
    traverseAndFillMrid(mergedDto)
    ensureTopLevelFK(mergedDto, FK_KEYS.powerCable)
    scopeAssetDtoForUser(mergedDto, currentUserId)

    // 5. Dựng entity
    const oldEntity = clientEntity || new PowerCableEntity()
    const newEntity = PowerCableMapper.mapDtoToEntity(mergedDto)

    // 6. Ghi DB
    const insertResult = await fetchWithRetry(
        () => window.electronAPI.insertPowerCableEntity(oldEntity, newEntity)
    )
    if (!insertResult.success) {
        throw new Error(`Database Insert PowerCable Error: ${insertResult.message}`)
    }
}
