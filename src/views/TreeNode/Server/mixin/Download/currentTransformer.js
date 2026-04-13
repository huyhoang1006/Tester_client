/* eslint-disable */
import * as currentAPI from '@/api/demo/CurrentTransformer.js'
import * as CurrentTransformerServerMapper from '@/views/Mapping/ServerToDTO/CurrentTransformer/index.js'
import * as CurrentTransformerMapper from '@/views/Mapping/CurrentTransformer/index.js'
import { fetchWithRetry } from './core-utils.js'
import { detectConflicts, applyResolved, mergeWithoutSnapshot, CURRENT_TRANSFORMER_FIELD_DEFS } from '@/utils/conflictUtils.js'

// ─── Step 1: fetch full info từ server ───────────────────────────────────────

export async function getCurrentTransformerChain(id, parentId) {
    try {
        const data = await fetchWithRetry(() => currentAPI.getCurrentTransformerById(id))
        return {
            currentTransformer: {
                id:          id,
                mrid:        String(id),
                name:        data?.assetInfo?.apparatusId || '',
                parentId:    String(parentId),
                _type:       'asset',
                asset:       'Current transformer',
                _serverData: data || {},
            },
            _type:       'asset',
            asset:       'Current transformer',
            parentBayId: String(parentId),
        }
    } catch (error) {
        console.error(`Error fetching currentTransformer with id ${id}:`, error)
        throw new Error(`Error fetching currentTransformer with id ${id}: ${error.message}`)
    }
}

// ─── Step 2: save to DB ───────────────────────────────────────────────────────

export async function downloadCurrentTransformerChain(data, ctx) {
    const ct         = data.currentTransformer
    const serverData = { ...ct._serverData, mRID: ct.mrid }

    // 1. Map server → serverDto
    const serverDto       = CurrentTransformerServerMapper.mapServerToDto(serverData)
    serverDto.psrId       = data.parentBayId
    serverDto.properties.mrid = ct.mrid

    // 2. Lấy client data cũ nếu đã tồn tại
    const existingResult = await window.electronAPI.getCurrentTransformerEntityByMrid(
        ct.mrid, data.parentBayId
    )
    const clientEntity = existingResult.success ? existingResult.data : null
    const clientDto    = clientEntity
        ? CurrentTransformerMapper.mapEntityToDto(clientEntity)
        : null

    // 3. Merge
    let mergedDto

    if (!clientDto) {
        mergedDto = serverDto
    } else {
        const snapshotResult = await window.electronAPI.getEntitySnapshotByMrid(ct.mrid, 'currentTransformer')
        const baseDto        = snapshotResult.success ? snapshotResult.data : null

        if (!baseDto) {
            mergedDto = mergeWithoutSnapshot(clientDto, serverDto, CURRENT_TRANSFORMER_FIELD_DEFS)
        } else {
            const diffFields  = detectConflicts(baseDto, clientDto, serverDto, CURRENT_TRANSFORMER_FIELD_DEFS)
            const hasConflict = diffFields.some(f => f.status === 'conflict')

            if (!hasConflict) {
                mergedDto = applyResolved(diffFields, clientDto)
            } else {
                mergedDto = await new Promise((resolve, reject) => {
                    ctx.$showConflictDialog({
                        title:     `Data Conflict — ${ct.name}`,
                        fields:    diffFields,
                        onResolve: (resolvedFields) => resolve(applyResolved(resolvedFields, clientDto)),
                        onCancel:  () => reject(new Error('CANCELED')),
                    })
                })
            }
        }

        // Giữ lại các mrid cũ để tránh orphan records
        mergedDto.assetInfoId         = clientDto.assetInfoId         || serverDto.assetInfoId
        mergedDto.productAssetModelId = clientDto.productAssetModelId || serverDto.productAssetModelId
        mergedDto.lifecycleDateId     = clientDto.lifecycleDateId     || serverDto.lifecycleDateId
        mergedDto.assetPsrId          = clientDto.assetPsrId          || serverDto.assetPsrId
        mergedDto.locationId          = clientDto.locationId          || serverDto.locationId
    }

    // 4. Set context IDs
    mergedDto.properties.mrid = ct.mrid
    mergedDto.psrId           = data.parentBayId

    // 5. Build entity từ mergedDto
    const oldEntity = clientEntity || new (require('@/views/Flatten/CurrentTransformer').default)()
    const newEntity = CurrentTransformerMapper.mapDtoToEntity(mergedDto)

    // 6. Insert DB + snapshot trong cùng 1 transaction
    console.log('Inserting CurrentTransformer entity with new data:', newEntity)
    const insertResult = await  window.electronAPI.insertCurrentTransformerEntity(oldEntity, newEntity, serverDto)
    if (!insertResult.success) throw new Error(`Database Insert CurrentTransformer Error: ${insertResult.message}`)

    // 7. Update UI — chỉ sau khi DB thành công
    // const parentNode = ctx.findNodeById(data.parentBayId, ctx.organisationClientList)
    // if (parentNode) {
    //     const newNode = {
    //         mrid:     ct.mrid,
    //         name:     ct.name,
    //         parentId: data.parentBayId,
    //         _type:    'asset',
    //         asset:    'Current transformer',
    //         mode:     'asset',
    //     }

    //     if (!parentNode.children) {
    //         ctx.$set(parentNode, 'children', [newNode])
    //     } else {
    //         const idx = parentNode.children.findIndex(c => c.mrid === ct.mrid)
    //         if (idx >= 0) parentNode.children.splice(idx, 1, newNode)
    //         else parentNode.children.push(newNode)
    //     }

    //     if (!parentNode.expanded) ctx.$set(parentNode, 'expanded', true)
    // }
}