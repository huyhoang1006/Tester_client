/* eslint-disable */
import * as demoAPI from '@/api/demo'
import * as VoltageLevelServerMapper from '@/views/Mapping/ServerToDTO/VoltageLevel/index.js'
import * as VoltageLevelMapper from '@/views/Mapping/VoltageLevel/index.js'
import { fetchWithRetry } from './core-utils.js'
import { detectConflicts, applyResolved, mergeWithoutSnapshot, VOLTAGE_LEVEL_FIELD_DEFS } from '@/utils/conflictUtils.js'

// ─── Step 1: fetch full info từ server ───────────────────────────────────────
// Được gọi trong fetchFullInfoForChain

export async function getVoltageLevelChain(id, parentId) {
    try {
        const data = await fetchWithRetry(() => demoAPI.getVoltageLevelById(id))

        return {
            voltageLevel: {
                id:          id,
                mrid:        String(id),
                name:        data?.name      || '',
                aliasName:   data?.shortName || data?.aliasName || '',
                parentId:    String(parentId),
                _type:       'voltageLevel',
                _serverData: data,
            },
            _type:       'voltageLevel',
            parentSubId: String(parentId),
        }
    } catch (error) {
        console.error(`Error fetching voltageLevel with id ${id}:`, error)
        throw new Error(`Error fetching voltageLevel with id ${id}: ${error.message}`)
    }
}

// ─── Step 2: save to DB ───────────────────────────────────────────────────────
// Được gọi trong downloadChainInfo

export async function downloadVoltageLevelChain(data, ctx) {
    const voltageLevel = data.voltageLevel
    const serverData   = {
        ...voltageLevel._serverData,
        mRID:       voltageLevel.mrid,
        substation: { mRID: data.parentSubId },
    }

    // 1. Map server → serverDto
    const serverDto = VoltageLevelServerMapper.mapServerToDto(serverData)

    // 2. Lấy client data cũ nếu đã tồn tại
    const existingResult = await window.electronAPI.getVoltageLevelEntityByMrid(voltageLevel.mrid)
    const clientDto = existingResult.success
        ? VoltageLevelMapper.volEntityToVolDto(existingResult.data)
        : null

    // 3. Merge
    let mergedDto

    if (!clientDto) {
        mergedDto = serverDto

    } else {
        const snapshotResult = await window.electronAPI.getEntitySnapshotByMrid(voltageLevel.mrid, 'voltageLevel')
        const baseDto        = snapshotResult.success ? snapshotResult.data : null

        if (!baseDto) {
            mergedDto = mergeWithoutSnapshot(clientDto, serverDto, VOLTAGE_LEVEL_FIELD_DEFS)
        } else {
            const diffFields  = detectConflicts(baseDto, clientDto, serverDto, VOLTAGE_LEVEL_FIELD_DEFS)
            const hasConflict = diffFields.some(f => f.status === 'conflict')

            if (!hasConflict) {
                mergedDto = applyResolved(diffFields, clientDto)
            } else {
                mergedDto = await new Promise((resolve, reject) => {
                    ctx.$showConflictDialog({
                        title:     `Data Conflict — ${voltageLevel.name}`,
                        fields:    diffFields,
                        onResolve: (resolvedFields) => resolve(applyResolved(resolvedFields, clientDto)),
                        onCancel:  () => reject(new Error('CANCELED')),
                    })
                })
            }
        }

        // Giữ lại các mrid cũ để tránh orphan records
        mergedDto.voltageLevelId     = clientDto.voltageLevelId    || serverDto.voltageLevelId
        mergedDto.baseVoltageId      = clientDto.baseVoltageId     || serverDto.baseVoltageId
        mergedDto.nominalVoltageId   = clientDto.nominalVoltageId  || serverDto.nominalVoltageId
        mergedDto.highVoltageLimitId = mergedDto.high_voltage_limit_value
            ? (clientDto.highVoltageLimitId || serverDto.highVoltageLimitId)
            : null
        mergedDto.lowVoltageLimitId  = mergedDto.low_voltage_limit_value
            ? (clientDto.lowVoltageLimitId  || serverDto.lowVoltageLimitId)
            : null
        mergedDto.locationId         = clientDto.locationId || serverDto.locationId
    }

    // 4. Set context IDs
    mergedDto.voltageLevelId = voltageLevel.mrid
    mergedDto.substationId   = data.parentSubId

    // 5. Build entity từ mergedDto
    const entity = VoltageLevelMapper.volDtoToVolEntity(mergedDto)

    // 6. Insert DB + snapshot trong cùng 1 transaction
    const insertResult = await window.electronAPI.insertVoltageLevelEntity(entity, serverDto)
    
    if (!insertResult.success) throw new Error(`Database Insert VoltageLevel Error: ${insertResult.message}`)

    // 7. Update UI — chỉ sau khi DB thành công
    const parentNode = ctx.findNodeById(data.parentSubId, ctx.organisationClientList)
    if (parentNode) {
        const newNode = {
            mrid:      voltageLevel.mrid,
            name:      voltageLevel.name,
            aliasName: voltageLevel.aliasName,
            parentId:  data.parentSubId,
            mode:      'voltageLevel',
        }

        if (!parentNode.children) {
            ctx.$set(parentNode, 'children', [newNode])
        } else {
            const idx = parentNode.children.findIndex(c => c.mrid === voltageLevel.mrid)
            if (idx >= 0) parentNode.children.splice(idx, 1, newNode)
            else parentNode.children.push(newNode)
        }

        if (!parentNode.expanded) ctx.$set(parentNode, 'expanded', true)
    }
}