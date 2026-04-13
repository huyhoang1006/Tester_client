/* eslint-disable */
import * as disconnectorAPI from '@/api/demo/Disconnector.js'
import * as DisconnectorServerMapper from '@/views/Mapping/ServerToDTO/Disconnector/index.js'
import * as DisconnectorMapper from '@/views/Mapping/Disconnector/index.js'
import { fetchWithRetry } from './core-utils.js'
import { detectConflicts, applyResolved, mergeWithoutSnapshot, DISCONNECTOR_FIELD_DEFS } from '@/utils/conflictUtils.js'

// ─── Step 1: fetch full info từ server ───────────────────────────────────────

export async function getDisconnectorChain(id, parentId) {
    try {
        const data = await fetchWithRetry(() => disconnectorAPI.getDisconnectorById(id))
        return {
            disconnector: {
                id:          id,
                mrid:        String(id),
                name:        data?.assetInfo?.apparatusId || '',
                parentId:    String(parentId),
                _type:       'asset',
                asset:       'Disconnector',
                _serverData: data || {},
            },
            _type:       'asset',
            asset:       'Disconnector',
            parentBayId: String(parentId),
        }
    } catch (error) {
        console.error(`Error fetching disconnector with id ${id}:`, error)
        throw new Error(`Error fetching disconnector with id ${id}: ${error.message}`)
    }
}

// ─── Step 2: save to DB ───────────────────────────────────────────────────────

export async function downloadDisconnectorChain(data, ctx) {
    const dc         = data.disconnector
    const serverData = { ...dc._serverData, mRID: dc.mrid }

    // 1. Map server → serverDto
    const serverDto       = DisconnectorServerMapper.mapServerToDto(serverData)
    serverDto.psrId       = data.parentBayId
    serverDto.properties.mrid = dc.mrid

    // 2. Lấy client data cũ nếu đã tồn tại
    const existingResult = await window.electronAPI.getDisconnectorEntityByMrid(
        dc.mrid, data.parentBayId
    )
    const clientEntity = existingResult.success ? existingResult.data : null
    const clientDto    = clientEntity
        ? DisconnectorMapper.disconnectorEntityToDto(clientEntity)
        : null

    // 3. Merge
    let mergedDto

    if (!clientDto) {
        mergedDto = serverDto
    } else {
        const snapshotResult = await window.electronAPI.getEntitySnapshotByMrid(dc.mrid, 'disconnector')
        const baseDto        = snapshotResult.success ? snapshotResult.data : null

        if (!baseDto) {
            mergedDto = mergeWithoutSnapshot(clientDto, serverDto, DISCONNECTOR_FIELD_DEFS)
        } else {
            const diffFields  = detectConflicts(baseDto, clientDto, serverDto, DISCONNECTOR_FIELD_DEFS)
            const hasConflict = diffFields.some(f => f.status === 'conflict')

            if (!hasConflict) {
                mergedDto = applyResolved(diffFields, clientDto)
            } else {
                mergedDto = await new Promise((resolve, reject) => {
                    ctx.$showConflictDialog({
                        title:     `Data Conflict — ${dc.name}`,
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
    mergedDto.mrid            = dc.mrid
    mergedDto.psrId           = data.parentBayId
    mergedDto.properties.mrid = dc.mrid

    // 5. Build entity từ mergedDto
    const entity = DisconnectorMapper.disconnectorDtoToEntity(mergedDto)

    // 6. Insert DB + snapshot trong cùng 1 transaction
    const insertResult = await fetchWithRetry(
        () => window.electronAPI.insertDisconnectorEntity(entity, serverDto)
    )
    if (!insertResult.success) throw new Error(`Database Insert Disconnector Error: ${insertResult.message}`)

    // 7. Update UI — chỉ sau khi DB thành công
    // const parentNode = ctx.findNodeById(data.parentBayId, ctx.organisationClientList)
    // if (parentNode) {
    //     const newNode = {
    //         mrid:     dc.mrid,
    //         name:     dc.name,
    //         parentId: data.parentBayId,
    //         _type:    'asset',
    //         asset:    'Disconnector',
    //         mode:     'asset',
    //     }

    //     if (!parentNode.children) {
    //         ctx.$set(parentNode, 'children', [newNode])
    //     } else {
    //         const idx = parentNode.children.findIndex(c => c.mrid === dc.mrid)
    //         if (idx >= 0) parentNode.children.splice(idx, 1, newNode)
    //         else parentNode.children.push(newNode)
    //     }

    //     if (!parentNode.expanded) ctx.$set(parentNode, 'expanded', true)
    // }
}