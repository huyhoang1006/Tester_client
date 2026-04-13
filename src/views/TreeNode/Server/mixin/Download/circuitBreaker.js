/* eslint-disable */
import * as circuitBreakerAPI from '@/api/demo/CircuitBreaker.js'
import * as CircuitBreakerServerMapper from '@/views/Mapping/ServerToDTO/CircuitBreaker/index.js'
import * as CircuitBreakerMapper from '@/views/Mapping/Breaker/index.js'
import CircuitBreakerEntity from '@/views/Flatten/CircuitBreaker'
import { fetchWithRetry } from './core-utils.js'
import { detectConflicts, applyResolved, mergeWithoutSnapshot, CIRCUIT_BREAKER_FIELD_DEFS } from '@/utils/conflictUtils.js'

// ─── Step 1: fetch full info từ server ───────────────────────────────────────

export async function getCircuitBreakerChain(id, parentId) {
    try {
        const data = await fetchWithRetry(() => circuitBreakerAPI.getCircuitBreakerById(id))
        return {
            circuitBreaker: {
                id:          id,
                mrid:        String(id),
                name:        data?.serialNumber || data?.lotNumber || '',
                parentId:    String(parentId),
                _type:       'asset',
                asset:       'Circuit breaker',
                _serverData: data || {},
            },
            _type:       'asset',
            asset:       'Circuit breaker',
            parentBayId: String(parentId),
        }
    } catch (error) {
        console.error(`Error fetching circuitBreaker with id ${id}:`, error)
        throw new Error(`Error fetching circuitBreaker with id ${id}: ${error.message}`)
    }
}

// ─── Step 2: save to DB ───────────────────────────────────────────────────────

export async function downloadCircuitBreakerChain(data, ctx) {
    const cb         = data.circuitBreaker
    const serverData = { ...cb._serverData, mRID: cb.mrid }

    // 1. Map server → serverDto
    const serverDto       = CircuitBreakerServerMapper.mapServerToDto(serverData)
    serverDto.psrId       = data.parentBayId
    serverDto.properties.mrid = cb.mrid

    // 2. Lấy client data cũ nếu đã tồn tại
    const existingResult = await window.electronAPI.getBreakerEntityByMrid(
        cb.mrid, data.parentBayId
    )
    const clientEntity = existingResult.success ? existingResult.data : null
    const clientDto    = clientEntity
        ? CircuitBreakerMapper.mapEntityToDto(clientEntity)
        : null

    // 3. Merge
    let mergedDto

    if (!clientDto) {
        mergedDto = serverDto
    } else {
        const snapshotResult = await window.electronAPI.getEntitySnapshotByMrid(cb.mrid, 'circuitBreaker')
        const baseDto        = snapshotResult.success ? snapshotResult.data : null

        if (!baseDto) {
            // Chưa có snapshot → server wins nếu client rỗng
            mergedDto = mergeWithoutSnapshot(clientDto, serverDto, CIRCUIT_BREAKER_FIELD_DEFS)
        } else {
            const diffFields  = detectConflicts(baseDto, clientDto, serverDto, CIRCUIT_BREAKER_FIELD_DEFS)
            const hasConflict = diffFields.some(f => f.status === 'conflict')

            if (!hasConflict) {
                mergedDto = applyResolved(diffFields, clientDto)
            } else {
                mergedDto = await new Promise((resolve, reject) => {
                    ctx.$showConflictDialog({
                        title:     `Data Conflict — ${cb.name}`,
                        fields:    diffFields,
                        onResolve: (resolvedFields) => resolve(applyResolved(resolvedFields, clientDto)),
                        onCancel:  () => reject(new Error('CANCELED')),
                    })
                })
            }
        }

        // Giữ lại các mrid cũ để tránh orphan records
        mergedDto.assetInfoId                         = clientDto.assetInfoId                         || serverDto.assetInfoId
        mergedDto.productAssetModelId                 = clientDto.productAssetModelId                 || serverDto.productAssetModelId
        mergedDto.lifecycleDateId                     = clientDto.lifecycleDateId                     || serverDto.lifecycleDateId
        mergedDto.assetPsrId                          = clientDto.assetPsrId                          || serverDto.assetPsrId
        mergedDto.breakerRatingInfoId                 = clientDto.breakerRatingInfoId                 || serverDto.breakerRatingInfoId
        mergedDto.breakerContactSystemInfoId          = clientDto.breakerContactSystemInfoId          || serverDto.breakerContactSystemInfoId
        mergedDto.breakerOtherInfoId                  = clientDto.breakerOtherInfoId                  || serverDto.breakerOtherInfoId
        mergedDto.operatingMechanismId                = clientDto.operatingMechanismId                || serverDto.operatingMechanismId
        mergedDto.operatingMechanismInfoId            = clientDto.operatingMechanismInfoId            || serverDto.operatingMechanismInfoId
        mergedDto.operatingMechanismLifecycleDateId   = clientDto.operatingMechanismLifecycleDateId   || serverDto.operatingMechanismLifecycleDateId
        mergedDto.operatingMechanismProductAssetModelId = clientDto.operatingMechanismProductAssetModelId || serverDto.operatingMechanismProductAssetModelId
        mergedDto.assessmentLimitBreakerInfoId        = clientDto.assessmentLimitBreakerInfoId        || serverDto.assessmentLimitBreakerInfoId
        mergedDto.locationId                          = clientDto.locationId                          || serverDto.locationId
    }

    // 4. Set context IDs
    mergedDto.properties.mrid = cb.mrid
    mergedDto.psrId           = data.parentBayId

    // 5. Build entity từ mergedDto — phải qua checkBreakerData để sinh UUID cho nested fields
    // Dùng traverseAndFillMrid tương tự mixin
    traverseAndFillMrid(mergedDto)

    const oldEntity = clientEntity || new CircuitBreakerEntity()
    const newEntity = CircuitBreakerMapper.mapDtoToEntity(mergedDto)

    // 6. Insert DB + snapshot trong cùng 1 transaction
    const insertResult = await fetchWithRetry(
        () => window.electronAPI.insertBreakerEntity(oldEntity, newEntity, serverDto)
    )
    if (!insertResult.success) throw new Error(`Database Insert CircuitBreaker Error: ${insertResult.message}`)

    // 7. Update UI — chỉ sau khi DB thành công
    // const parentNode = ctx.findNodeById(data.parentBayId, ctx.organisationClientList)
    // if (parentNode) {
    //     const newNode = {
    //         mrid:     cb.mrid,
    //         name:     cb.name,
            
    //         parentId: data.parentBayId,
    //         _type:    'asset',
    //         asset:    'Circuit breaker',
    //         mode:     'asset',
    //     }

    //     if (!parentNode.children) {
    //         ctx.$set(parentNode, 'children', [newNode])
    //     } else {
    //         const idx = parentNode.children.findIndex(c => c.mrid === cb.mrid)
    //         if (idx >= 0) parentNode.children.splice(idx, 1, newNode)
    //         else parentNode.children.push(newNode)
    //     }

    //     if (!parentNode.expanded) ctx.$set(parentNode, 'expanded', true)
    // }
}

// ─── Helper — sinh UUID cho tất cả mrid rỗng trong nested object ─────────────

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