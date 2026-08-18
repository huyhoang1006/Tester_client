/* eslint-disable */
import * as bushingAPI from '@/api/demo/Bushing.js'
import * as BushingServerMapper from '@/views/Mapping/ServerToDTO/Bushing/index.js'
import * as BushingMapper from '@/views/Mapping/Bushing/index.js'
import BushingAssetEntity from '@/views/Flatten/Bushing'
import { fetchWithRetry } from './core-utils.js'
import { scopeAssetDtoForUser } from './id-scope'
import { traverseAndFillMrid, ensureTopLevelFK, FK_KEYS } from './fk-utils.js'
import { applyDownloadedAssetMedia } from './asset-media-utils.js'

/**
 * Tải BUSHING từ server về client.
 *
 * Cùng lý do với `powerCable.js`: bushing chưa từng có trong bảng chiến lược ở
 * `core-utils`, nên bấm tải là không có gì xảy ra và cũng không có thông báo nào.
 *
 * Cách gộp giống power cable — xem ghi chú dài ở `powerCable.js`. Tóm lại: dữ liệu theo
 * server, GIỮ FK id của bản local để không sinh bản ghi mồ côi, và không tự bịa quy tắc
 * gộp theo từng field khi chưa có `FIELD_DEFS`.
 *
 * MỘT KHÁC BIỆT PHẢI ĐỂ Ý: `insertBushingEntity` chỉ nhận MỘT tham số, không nhận
 * `old_entity` như 10 asset còn lại:
 *
 *     insertBushingEntity : (data) => ipcRenderer.invoke('insertBushingEntity', data)
 *     insertPowerCableEntity: (old_data, data) => ...
 *
 * Truyền hai tham số vào đây thì tham số thứ hai bị bỏ, và entity thật sự được ghi lại là
 * `oldEntity` — tức ghi đè bằng dữ liệu CŨ. Luồng import cũng đã phải xử lý riêng chỗ này
 * (`ins: (o, e) => api.insertBushingEntity(e)`).
 */

// ─── Step 1: fetch full info từ server ───────────────────────────────────────

export async function getBushingChain(id, parentId) {
    try {
        const data = await fetchWithRetry(() => bushingAPI.getBushingById(id))
        return {
            bushing: {
                id:          id,
                mrid:        String(id),
                name:        data?.assetInfo?.apparatusId || data?.assetInfo?.serialNo || '',
                parentId:    String(parentId),
                _type:       'asset',
                asset:       'Bushing',
                _serverData: data || {},
            },
            _type:       'asset',
            asset:       'Bushing',
            parentBayId: String(parentId),
        }
    } catch (error) {
        console.error(`Error fetching bushing with id ${id}:`, error)
        throw new Error(`Error fetching bushing with id ${id}: ${error.message}`)
    }
}

// ─── Step 2: save to DB ───────────────────────────────────────────────────────

export async function downloadBushingChain(data, ctx) {
    const bu         = data.bushing
    const serverData = { ...bu._serverData, mRID: bu.mrid }
    const currentUserId = ctx.$store.state.user.user_id

    // 1. Map server → serverDto
    const serverDto = BushingServerMapper.mapServerToDto(serverData)
    scopeAssetDtoForUser(serverDto, currentUserId)
    serverDto.psrId = data.parentBayId
    if (serverDto.properties) serverDto.properties.mrid = bu.mrid
    await applyDownloadedAssetMedia(serverDto, 'Bushing', bu.mrid)

    // 2. Lấy bản local cũ nếu đã tồn tại
    const existingResult = await window.electronAPI.getBushingEntityByMrid(
        bu.mrid, data.parentBayId
    )
    const clientEntity = existingResult.success ? existingResult.data : null
    const clientDto    = clientEntity
        ? BushingMapper.mapEntityToDto(clientEntity)
        : null
    scopeAssetDtoForUser(clientDto, currentUserId)

    // 3. Gộp
    let mergedDto
    if (!clientDto) {
        mergedDto = serverDto
    } else {
        mergedDto = { ...serverDto }
        for (const key of ['assetInfoId', 'productAssetModelId', 'lifecycleDateId',
                           'assetPsrId', 'locationId', 'attachmentId']) {
            if (clientDto[key]) mergedDto[key] = clientDto[key]
        }
    }

    // 4. Set context id
    if (mergedDto.properties) mergedDto.properties.mrid = bu.mrid
    mergedDto.psrId = data.parentBayId

    traverseAndFillMrid(mergedDto)
    ensureTopLevelFK(mergedDto, FK_KEYS.bushing)
    scopeAssetDtoForUser(mergedDto, currentUserId)

    // 5. Dựng entity
    const newEntity = BushingMapper.mapDtoToEntity(mergedDto)

    // 6. Ghi DB — MỘT tham số, xem ghi chú ở đầu file
    const insertResult = await fetchWithRetry(
        () => window.electronAPI.insertBushingEntity(newEntity)
    )
    if (!insertResult.success) {
        throw new Error(`Database Insert Bushing Error: ${insertResult.message}`)
    }
}
