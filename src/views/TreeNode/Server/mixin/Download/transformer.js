/* eslint-disable */
import * as transformerAPI from '@/api/demo/Transformer.js'
import * as TransformerServerMapper from '@/views/Mapping/ServerToDTO/Transformer/index.js'
import * as TransformerMapper from '@/views/Mapping/Transformer/index.js'
import TransformerEntity from '@/views/Flatten/Transformer'
import { fetchWithRetry } from './core-utils.js'
import { detectConflicts, applyResolved, mergeWithoutSnapshot, TRANSFORMER_FIELD_DEFS } from '@/utils/conflictUtils.js'

// ─── Step 1: fetch full info từ server ───────────────────────────────────────

export async function getTransformerChain(id, parentId) {
    try {
        const data = await fetchWithRetry(() => transformerAPI.getTransformerById(id))
        return {
            transformer: {
                id:          id,
                mrid:        String(id),
                name:        data?.assetInfo?.apparatusId || '',
                parentId:    String(parentId),
                _type:       'asset',
                asset:       'Transformer',
                _serverData: data || {},
            },
            _type:       'asset',
            asset:       'Transformer',
            parentBayId: String(parentId),
        }
    } catch (error) {
        console.error(`Error fetching transformer with id ${id}:`, error)
        throw new Error(`Error fetching transformer with id ${id}: ${error.message}`)
    }
}

// ─── Step 2: save to DB ───────────────────────────────────────────────────────

export async function downloadTransformerChain(data, ctx) {
    const tr         = data.transformer
    const serverData = { ...tr._serverData, mRID: tr.mrid }

    // 1. Map server → serverDto
    const serverDto       = TransformerServerMapper.mapServerToDto(serverData)
    serverDto.psrId       = data.parentBayId
    serverDto.properties.mrid = tr.mrid

    // 2. Lấy client data cũ nếu đã tồn tại
    const existingResult = await window.electronAPI.getTransformerEntityByMrid(
        tr.mrid, data.parentBayId
    )
    const clientEntity = existingResult.success ? existingResult.data : null
    const clientDto    = clientEntity
        ? TransformerMapper.transformerEntityToDto(clientEntity)
        : null

    // 3. Merge
    let mergedDto

    if (!clientDto) {
        mergedDto = serverDto
    } else {
        const snapshotResult = await window.electronAPI.getEntitySnapshotByMrid(tr.mrid, 'transformer')
        const baseDto        = snapshotResult.success ? snapshotResult.data : null

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
                mergedDto.ratings.power_ratings   = clientDto.ratings.power_ratings
                mergedDto.ratings.current_ratings = clientDto.ratings.current_ratings
            } else {
                mergedDto.ratings.power_ratings   = serverDto.ratings.power_ratings
                mergedDto.ratings.current_ratings = serverDto.ratings.current_ratings
            }
            if (clientDto.impedances?.prim_sec?.length > 0) {
                mergedDto.impedances.prim_sec  = clientDto.impedances.prim_sec
                mergedDto.impedances.prim_tert = clientDto.impedances.prim_tert
                mergedDto.impedances.sec_tert  = clientDto.impedances.sec_tert
            } else {
                mergedDto.impedances.prim_sec  = serverDto.impedances.prim_sec
                mergedDto.impedances.prim_tert = serverDto.impedances.prim_tert
                mergedDto.impedances.sec_tert  = serverDto.impedances.sec_tert
            }
            if (clientDto.tap_changers?.mode) {
                mergedDto.tap_changers = clientDto.tap_changers
            } else {
                mergedDto.tap_changers = serverDto.tap_changers
            }

        } else {
            const diffFields  = detectConflicts(baseDto, clientDto, serverDto, TRANSFORMER_FIELD_DEFS)
            const hasConflict = diffFields.some(f => f.status === 'conflict')

            if (!hasConflict) {
                mergedDto = applyResolved(diffFields, clientDto)
            } else {
                mergedDto = await new Promise((resolve, reject) => {
                    ctx.$showConflictDialog({
                        title:     `Data Conflict — ${tr.name}`,
                        fields:    diffFields,
                        onResolve: (resolvedFields) => resolve(applyResolved(resolvedFields, clientDto)),
                        onCancel:  () => reject(new Error('CANCELED')),
                    })
                })
            }
        }

        // Giữ lại các mrid cũ
        mergedDto.oldPowerTransformerInfoId          = clientDto.oldPowerTransformerInfoId || serverDto.oldPowerTransformerInfoId
        mergedDto.productAssetModelId                = clientDto.productAssetModelId       || serverDto.productAssetModelId
        mergedDto.lifecycleDateId                    = clientDto.lifecycleDateId           || serverDto.lifecycleDateId
        mergedDto.assetPsrId                         = clientDto.assetPsrId                || serverDto.assetPsrId
        mergedDto.locationId                         = clientDto.locationId                || serverDto.locationId
    }

    // 4. Set context IDs
    mergedDto.properties.mrid = tr.mrid
    mergedDto.psrId           = data.parentBayId

    // 5. Build entity — phải qua checkTransformerDto để sinh UUID cho nested fields
    traverseAndFillMrid(mergedDto)

    const oldEntity = clientEntity || new TransformerEntity()
    const newEntity = TransformerMapper.transformerDtoToEntity(mergedDto)

    // 6. Insert DB + snapshot
    const insertResult = await fetchWithRetry(
        () => window.electronAPI.insertTransformerEntity(oldEntity, newEntity, mergedDto)
    )
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

const traverseAndFillMrid = (obj) => {
    if (Array.isArray(obj)) {
        obj.forEach(item => traverseAndFillMrid(item))
    } else if (obj !== null && typeof obj === 'object') {
        if ('mrid' in obj && (!obj.mrid || obj.mrid === '')) {
            obj.mrid = uuid.newUuid()
        }
        Object.values(obj).forEach(val => traverseAndFillMrid(val))
    }
}