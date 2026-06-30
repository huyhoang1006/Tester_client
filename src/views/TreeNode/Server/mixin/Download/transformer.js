/* eslint-disable */
import * as transformerAPI from '@/api/demo/Transformer.js'
import * as TransformerServerMapper from '@/views/Mapping/ServerToDTO/Transformer/index.js'
import * as TransformerMapper from '@/views/Mapping/Transformer/index.js'
import TransformerEntity from '@/views/Flatten/Transformer'
import OldTransformerEndInfo from '@/views/Cim/OldTransformerEndInfo'
import constant from '@/utils/constant'
import {fetchWithRetry} from './core-utils.js'
import {detectConflicts, applyResolved, mergeWithoutSnapshot, TRANSFORMER_FIELD_DEFS} from '@/utils/conflictUtils.js'

// ─── Step 1: fetch full info từ server ───────────────────────────────────────

export async function getTransformerChain(id, parentId) {
    try {
        const data = await fetchWithRetry(() => transformerAPI.getTransformerById(id))
        return {
            transformer: {
                id: id,
                mrid: String(id),
                name: data?.assetInfo?.apparatusId || '',
                parentId: String(parentId),
                _type: 'asset',
                asset: 'Transformer',
                _serverData: data || {}
            },
            _type: 'asset',
            asset: 'Transformer',
            parentBayId: String(parentId)
        }
    } catch (error) {
        console.error(`Error fetching transformer with id ${id}:`, error)
        throw new Error(`Error fetching transformer with id ${id}: ${error.message}`)
    }
}

// ─── Step 2: save to DB ───────────────────────────────────────────────────────

export async function downloadTransformerChain(data, ctx) {
    const tr = data.transformer
    const serverData = {...tr._serverData, mRID: tr.mrid}

    // 1. Map server → serverDto
    const serverDto = TransformerServerMapper.mapServerToDto(serverData)
    serverDto.psrId = data.parentBayId
    serverDto.properties.mrid = tr.mrid

    console.log('Kiem tra serverDTO sau khi mapping tu server', serverDto)

    // 2. Lấy client data cũ nếu đã tồn tại
    const existingResult = await window.electronAPI.getTransformerEntityByMrid(tr.mrid, data.parentBayId)
    const clientEntity = existingResult.success ? existingResult.data : null
    const clientDto = clientEntity ? TransformerMapper.transformerEntityToDto(clientEntity) : null

    // 3. Merge
    let mergedDto

    if (!clientDto) {
        mergedDto = serverDto
    } else {
        const snapshotResult = await window.electronAPI.getEntitySnapshotByMrid(tr.mrid, 'transformer')
        const baseDto = snapshotResult.success ? snapshotResult.data : null

        if (!baseDto) {
            // Server wins cho basic properties nếu client rỗng
            mergedDto = mergeWithoutSnapshot(clientDto, serverDto, TRANSFORMER_FIELD_DEFS)

            // Giữ lại ratings/impedances từ client nếu đã có data
            // (vì server có thể không trả về đầy đủ)
            if (clientDto.ratings?.voltage_ratings?.length > 0) {
                mergedDto.ratings.voltage_ratings = clientDto.ratings.voltage_ratings
            } else {
                mergedDto.ratings.voltage_ratings = serverDto.ratings.voltage_ratings
            }
            if (clientDto.ratings?.power_ratings?.length > 0) {
                mergedDto.ratings.power_ratings = clientDto.ratings.power_ratings
                mergedDto.ratings.current_ratings = clientDto.ratings.current_ratings
            } else {
                mergedDto.ratings.power_ratings = serverDto.ratings.power_ratings
                mergedDto.ratings.current_ratings = serverDto.ratings.current_ratings
            }
            if (clientDto.impedances?.prim_sec?.length > 0) {
                mergedDto.impedances.prim_sec = clientDto.impedances.prim_sec
                mergedDto.impedances.prim_tert = clientDto.impedances.prim_tert
                mergedDto.impedances.sec_tert = clientDto.impedances.sec_tert
            } else {
                mergedDto.impedances.prim_sec = serverDto.impedances.prim_sec
                mergedDto.impedances.prim_tert = serverDto.impedances.prim_tert
                mergedDto.impedances.sec_tert = serverDto.impedances.sec_tert
            }
            if (clientDto.tap_changers?.mode) {
                mergedDto.tap_changers = clientDto.tap_changers
            } else {
                mergedDto.tap_changers = serverDto.tap_changers
            }
        } else {
            const diffFields = detectConflicts(baseDto, clientDto, serverDto, TRANSFORMER_FIELD_DEFS)
            const hasConflict = diffFields.some((f) => f.status === 'conflict')

            if (!hasConflict) {
                mergedDto = applyResolved(diffFields, clientDto)
            } else {
                mergedDto = await new Promise((resolve, reject) => {
                    ctx.$showConflictDialog({
                        title: `Data Conflict — ${tr.name}`,
                        fields: diffFields,
                        onResolve: (resolvedFields) => resolve(applyResolved(resolvedFields, clientDto)),
                        onCancel: () => reject(new Error('CANCELED'))
                    })
                })
            }
        }

        // Giữ lại các mrid cũ
        mergedDto.oldPowerTransformerInfoId = clientDto.oldPowerTransformerInfoId || serverDto.oldPowerTransformerInfoId
        mergedDto.productAssetModelId = clientDto.productAssetModelId || serverDto.productAssetModelId
        mergedDto.lifecycleDateId = clientDto.lifecycleDateId || serverDto.lifecycleDateId
        mergedDto.assetPsrId = clientDto.assetPsrId || serverDto.assetPsrId
        mergedDto.locationId = clientDto.locationId || serverDto.locationId
    }

    // 4. Set context IDs
    mergedDto.properties.mrid = tr.mrid
    mergedDto.psrId = data.parentBayId

    // 5. Build entity — fill mọi UUID/FK còn thiếu (tương đương checkTransformerDto trong mixin)
    ensureTransformerEndInfo(mergedDto)
    ensureShortCircuitTestEndInfo(mergedDto)
    traverseAndFillMrid(mergedDto)
    ensureTopLevelFK(mergedDto)

    const oldEntity = clientEntity || new TransformerEntity()
    const newEntity = TransformerMapper.transformerDtoToEntity(mergedDto)

    // 6. Insert DB + snapshot
    const insertResult = await fetchWithRetry(() => window.electronAPI.insertTransformerEntity(oldEntity, newEntity, mergedDto))
    if (!insertResult.success) throw new Error(`Database Insert Transformer Error: ${insertResult.message}`)

    // 7. Update UI
    // const parentNode = ctx.findNodeById(data.parentBayId, ctx.organisationClientList)
    // if (parentNode) {
    //     const newNode = {
    //         mrid:     tr.mrid,
    //         name:     tr.name,
    //         parentId: data.parentBayId,
    //         _type:    'asset',
    //         asset:    'Transformer',
    //         mode:     'asset',
    //     }

    //     if (!parentNode.children) {
    //         ctx.$set(parentNode, 'children', [newNode])
    //     } else {
    //         const idx = parentNode.children.findIndex(c => c.mrid === tr.mrid)
    //         if (idx >= 0) parentNode.children.splice(idx, 1, newNode)
    //         else parentNode.children.push(newNode)
    //     }

    //     if (!parentNode.expanded) ctx.$set(parentNode, 'expanded', true)
    // }
}

// ─── Helper ──────────────────────────────────────────────────────────────────

import uuid from '@/utils/uuid'

// Tạo oldTransformerEndInfo (1 entry / winding end) nếu DTO chưa có — tương đương
// checkOldTransformerEndInfo trong AssetView mixin.
// Đây là "xương sống" liên kết winding (Prim/Sec/Tert) với voltage ratings,
// current ratings, short-circuit test, bushing, surge arrester, tap changer và
// vector group. mapServerToDto KHÔNG tạo mảng này ⇒ nếu thiếu, transformerDtoToEntity
// không gán được transformer_end_id và khi mở lại toàn bộ dữ liệu biến mất.
const ensureTransformerEndInfo = (dto) => {
    if (Array.isArray(dto.oldTransformerEndInfo) && dto.oldTransformerEndInfo.length > 0) return
    const type = dto.properties.type
    const endCount = type === constant.THREE_WINDING || type === constant.WITH_TERT ? 3 : 2
    dto.oldTransformerEndInfo = []
    for (let i = 1; i <= endCount; i++) {
        const end = new OldTransformerEndInfo()
        end.mrid = uuid.newUuid()
        end.end_number = i
        dto.oldTransformerEndInfo.push(end)
    }
}

// Đảm bảo mỗi impedance (prim_sec/prim_tert/sec_tert) có 1 entry trong
// shortCircuitTestTransformerEndInfo khớp short_circuit_test_id — tương đương
// addShortCircuitTest trong mixin. transformerDtoToEntity chỉ tạo link
// "energised end ↔ other end" khi entry này tồn tại; thiếu nó thì impedance
// không phân loại được khi đọc ngược ⇒ biến mất khi mở lại.
const ensureShortCircuitTestEndInfo = (dto) => {
    if (!Array.isArray(dto.shortCircuitTestTransformerEndInfo)) dto.shortCircuitTestTransformerEndInfo = []
    const existing = new Set(dto.shortCircuitTestTransformerEndInfo.map((s) => s.short_circuit_test_id))
    ;['prim_sec', 'prim_tert', 'sec_tert'].forEach((key) => {
        ;(dto.impedances[key] || []).forEach((imp) => {
            if (imp.mrid && !existing.has(imp.mrid)) {
                dto.shortCircuitTestTransformerEndInfo.push({
                    mrid: uuid.newUuid(),
                    short_circuit_test_id: imp.mrid,
                    transformer_end_info_id: ''
                })
                existing.add(imp.mrid)
            }
        })
    })
}

// Fill mrid VÀ các FK id (assetInfoId, productAssetModelId, lifecycleDateId)
// để tránh lỗi foreign key khi insert DB — tương đương các hàm check* trong AssetView mixin
const FK_ID_KEYS = ['assetInfoId', 'productAssetModelId', 'lifecycleDateId']
const traverseAndFillMrid = (obj) => {
    if (Array.isArray(obj)) {
        obj.forEach((item) => traverseAndFillMrid(item))
    } else if (obj !== null && typeof obj === 'object') {
        if ('mrid' in obj && (!obj.mrid || obj.mrid === '')) {
            obj.mrid = uuid.newUuid()
        }
        // Fill các FK id rỗng (bushing/surge items, dataTable...) — checkBushing/checkSurgeArrester
        for (const key of FK_ID_KEYS) {
            if (key in obj && (!obj[key] || obj[key] === '')) {
                obj[key] = uuid.newUuid()
            }
        }
        Object.values(obj).forEach((val) => traverseAndFillMrid(val))
    }
}

// Fill các FK top-level + tap changer (tương đương checkAssetInfo, checkProductAssetModel,
// checkLifecycleDate, checkAssetPrs, checkTapChangerId, checkBushing, checkSurgeArrester)
const ensureTopLevelFK = (dto) => {
    if (!dto.oldPowerTransformerInfoId) dto.oldPowerTransformerInfoId = uuid.newUuid()
    if (!dto.productAssetModelId) dto.productAssetModelId = uuid.newUuid()
    if (!dto.lifecycleDateId) dto.lifecycleDateId = uuid.newUuid()
    if (!dto.assetPsrId) dto.assetPsrId = uuid.newUuid()
    if (!dto.properties.mrid) dto.properties.mrid = uuid.newUuid()

    // Tap changer FK (chỉ khi có mode)
    if (dto.tap_changers && dto.tap_changers.mode) {
        if (!dto.tap_changers.mrid) dto.tap_changers.mrid = uuid.newUuid()
        if (!dto.tap_changers.assetInfoId) dto.tap_changers.assetInfoId = uuid.newUuid()
        if (!dto.tap_changers.productAssetModelId) dto.tap_changers.productAssetModelId = uuid.newUuid()
    }

    // Bushing FK (assetInfoId/productAssetModelId/lifecycleDateId đã được traverseAndFillMrid lo,
    // nhưng đảm bảo lại cho chắc)
    ;['prim', 'sec', 'tert'].forEach((w) => {
        ;(dto.bushing_data?.[w] || []).forEach((b) => {
            if (!b.assetInfoId) b.assetInfoId = uuid.newUuid()
            if (!b.productAssetModelId) b.productAssetModelId = uuid.newUuid()
            if (!b.lifecycleDateId) b.lifecycleDateId = uuid.newUuid()
        })
        ;(dto.surge_arrester?.[w] || []).forEach((sa) => {
            if (sa.properties) {
                if (!sa.properties.assetInfoId) sa.properties.assetInfoId = uuid.newUuid()
                if (!sa.properties.productAssetModelId) sa.properties.productAssetModelId = uuid.newUuid()
                if (!sa.properties.lifecycleDateId) sa.properties.lifecycleDateId = uuid.newUuid()
            }
            ;(sa.ratings?.table || []).forEach((row) => {
                if (!row.assetInfoId) row.assetInfoId = uuid.newUuid()
            })
        })
    })
}
