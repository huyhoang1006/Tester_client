/* eslint-disable */
import * as voltageAPI from '@/api/demo/VoltageTransformer.js'
import * as VoltageTransformerServerMapper from '@/views/Mapping/ServerToDTO/VoltageTransformer/index.js'
import * as VoltageTransformerMapper from '@/views/Mapping/VoltageTransformer/index.js'
import { fetchWithRetry } from './core-utils.js'
import { detectConflicts, applyResolved, mergeWithoutSnapshot, VOLTAGE_TRANSFORMER_FIELD_DEFS } from '@/utils/conflictUtils.js'

// ─── Step 1: fetch full info từ server ───────────────────────────────────────

export async function getVoltageTransformerChain(id, parentId) {
    try {
        const data = await fetchWithRetry(() => voltageAPI.getVoltageTransformerById(id))
        return {
            voltageTransformer: {
                id:          id,
                mrid:        String(id),
                name:        data?.assetInfoResponseDTO?.apparatusId || '',
                parentId:    String(parentId),
                _type:       'asset',
                asset:       'Voltage transformer',
                _serverData: data || {},
            },
            _type:       'asset',
            asset:       'Voltage transformer',
            parentBayId: String(parentId),
        }
    } catch (error) {
        console.error(`Error fetching voltageTransformer with id ${id}:`, error)
        throw new Error(`Error fetching voltageTransformer with id ${id}: ${error.message}`)
    }
}

// ─── Step 2: save to DB ───────────────────────────────────────────────────────

export async function downloadVoltageTransformerChain(data, ctx) {
    const vt         = data.voltageTransformer
    const serverData = { ...vt._serverData, mRID: vt.mrid }

    // 1. Map server → serverDto
    const serverDto       = VoltageTransformerServerMapper.mapServerToDto(serverData)
    serverDto.psrId       = data.parentBayId
    serverDto.properties.mrid = vt.mrid

    // 2. Lấy client data cũ nếu đã tồn tại
    const existingResult = await window.electronAPI.getVoltageTransformerEntityByMrid(
        vt.mrid, data.parentBayId
    )
    const clientEntity = existingResult.success ? existingResult.data : null
    const clientDto    = clientEntity
        ? VoltageTransformerMapper.mapEntityToDto(clientEntity)
        : null

    // 3. Merge
    let mergedDto

    if (!clientDto) {
        mergedDto = serverDto
    } else {
        const snapshotResult = await window.electronAPI.getEntitySnapshotByMrid(vt.mrid, 'voltageTransformer')
        const baseDto        = snapshotResult.success ? snapshotResult.data : null

        if (!baseDto) {
            mergedDto = mergeWithoutSnapshot(clientDto, serverDto, VOLTAGE_TRANSFORMER_FIELD_DEFS)
        } else {
            const diffFields  = detectConflicts(baseDto, clientDto, serverDto, VOLTAGE_TRANSFORMER_FIELD_DEFS)
            const hasConflict = diffFields.some(f => f.status === 'conflict')

            if (!hasConflict) {
                mergedDto = applyResolved(diffFields, clientDto)
            } else {
                mergedDto = await new Promise((resolve, reject) => {
                    ctx.$showConflictDialog({
                        title:     `Data Conflict — ${vt.name}`,
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
    mergedDto.mrid            = vt.mrid
    mergedDto.psrId           = data.parentBayId
    mergedDto.properties.mrid = vt.mrid

    // 5. Build entity từ mergedDto
    const oldEntity = clientEntity || new (require('@/views/Flatten/VoltageTransformer').default)()
    const newEntity = VoltageTransformerMapper.mapDtoToEntity(mergedDto)

    // 6. Insert DB + snapshot trong cùng 1 transaction
    const insertResult = await window.electronAPI.insertVoltageTransformerEntity(oldEntity, newEntity, serverDto)
    if (!insertResult.success) throw new Error(`Database Insert VoltageTransformer Error: ${insertResult.message}`)

    // 7. Update UI — chỉ sau khi DB thành công
    // const parentNode = ctx.findNodeById(data.parentBayId, ctx.organisationClientList)
    // if (parentNode) {
    //     const newNode = {
    //         mrid:     vt.mrid,
    //         name:     vt.name,
    //         parentId: data.parentBayId,
    //         _type:    'asset',
    //         asset:    'Voltage transformer',
    //         mode:     'asset',
    //     }

    //     if (!parentNode.children) {
    //         ctx.$set(parentNode, 'children', [newNode])
    //     } else {
    //         const idx = parentNode.children.findIndex(c => c.mrid === vt.mrid)
    //         if (idx >= 0) parentNode.children.splice(idx, 1, newNode)
    //         else parentNode.children.push(newNode)
    //     }

    //     if (!parentNode.expanded) ctx.$set(parentNode, 'expanded', true)
    // }
}