/* eslint-disable */
import * as demoAPI from '@/api/demo'
import * as SubstationServerMapper from '@/views/Mapping/ServerToDTO/Substation/index.js'
import * as SubstationMapper from '@/views/Mapping/Substation/index.js'
import { fetchWithRetry } from './core-utils.js'
import { detectConflicts, applyResolved, SUBSTATION_FIELD_DEFS } from '@/utils/conflictUtils.js'

export async function getSubstationChain(id, parentId) {
    try {
        const data = await fetchWithRetry(() => demoAPI.getSubstationById(id))
        return {
            substation: {
                id:          id,
                mrid:        String(id),
                name:        data?.name      || '',
                aliasName:   data?.aliasName || '',
                parentId:    String(parentId),
                _type:       'substation',
                _serverData: data || { id, name: data?.name || '', mRID: id, organisation_id: parentId }
            },
            _type:      'substation',
            parentOrgId: String(parentId)
        }
    } catch (error) {
        console.error(`Error fetching substation with id ${id}:`, error)
        throw new Error(`Error fetching substation with id ${id}: ${error.message}`)
    }
}

export async function downloadSubstationChain(data, ctx) {
    const substation = data.substation
    const serverData = { ...substation._serverData, mRID: substation.mrid }

    // 1. Map server → serverDto
    const serverDto = SubstationServerMapper.mapServerToDto(serverData)

    // 2. Lấy client data cũ nếu đã tồn tại
    const existingResult = await window.electronAPI.getSubstationEntityByMrid(
        substation.mrid,
        ctx.$store.state.user.user_id,
        data.parentOrgId
    )
    const clientDto = existingResult.success
        ? SubstationMapper.mapEntityToDto(existingResult.data)
        : null

    // 3. Merge
    let mergedDto

    if (!clientDto) {
        // Chưa có ở local → insert thẳng serverDto
        mergedDto = serverDto

    } else {
        const snapshotResult = await window.electronAPI.getEntitySnapshotByMrid(substation.mrid, 'substation')
        const baseDto        = snapshotResult.success ? snapshotResult.data : null

        if (!baseDto) {
            // Chưa có snapshot → server wins nếu client rỗng, giữ client nếu đã có data
            mergedDto = { ...clientDto }
            for (const group of SUBSTATION_FIELD_DEFS) {
                for (const field of group.fields) {
                    const clientVal   = clientDto[field.key]
                    const serverVal   = serverDto[field.key]
                    const clientEmpty = clientVal === null || clientVal === undefined || clientVal === ''
                    if (clientEmpty && serverVal) {
                        mergedDto[field.key] = serverVal
                    }
                }
            }

        } else {
            // Có snapshot → 3-way merge
            const diffFields  = detectConflicts(baseDto, clientDto, serverDto, SUBSTATION_FIELD_DEFS)
            const hasConflict = diffFields.some(f => f.status === 'conflict')

            if (!hasConflict) {
                mergedDto = applyResolved(diffFields, clientDto)
            } else {
                mergedDto = await new Promise((resolve, reject) => {
                    ctx.$showConflictDialog({
                        title:     `Xung đột dữ liệu — ${substation.name}`,
                        fields:    diffFields,
                        onResolve: (resolvedFields) => resolve(applyResolved(resolvedFields, clientDto)),
                        onCancel:  () => reject(new Error('CANCELED')),
                    })
                })
            }
        }

        // Giữ lại các mrid cũ để tránh orphan records
        mergedDto.streetDetailId      = mergedDto.street
            ? (clientDto.streetDetailId      || serverDto.streetDetailId      || mergedDto.streetDetailId)
            : null
        mergedDto.townDetailId        = (mergedDto.city || mergedDto.district_or_town)
            ? (clientDto.townDetailId        || serverDto.townDetailId        || mergedDto.townDetailId)
            : null
        mergedDto.streetAddressId     = (mergedDto.streetDetailId || mergedDto.townDetailId)
            ? (clientDto.streetAddressId     || serverDto.streetAddressId     || mergedDto.streetAddressId)
            : null
        mergedDto.electronicAddressId = (mergedDto.email || mergedDto.fax)
            ? (clientDto.electronicAddressId || serverDto.electronicAddressId || mergedDto.electronicAddressId)
            : null
        mergedDto.telephoneNumberId   = mergedDto.phoneNumber
            ? (clientDto.telephoneNumberId   || serverDto.telephoneNumberId   || mergedDto.telephoneNumberId)
            : null
        mergedDto.locationId          = clientDto.locationId  || serverDto.locationId
        mergedDto.personId            = clientDto.personId    || serverDto.personId
        mergedDto.personRoleId        = clientDto.personRoleId || serverDto.personRoleId
        mergedDto.psrTypeId           = mergedDto.type
            ? (clientDto.psrTypeId || serverDto.psrTypeId)
            : null
    }

    // 4. Set context IDs
    mergedDto.subsId               = substation.mrid
    mergedDto.organisationId       = data.parentOrgId
    mergedDto.userId               = ctx.$store.state.user.user_id
    mergedDto.userName             = ctx.$store.state.user.username
    mergedDto.userIdentifiedObjectId = clientDto?.userIdentifiedObjectId || ctx.generateUuid()
    mergedDto.organisationPsrId      = clientDto?.organisationPsrId      || ctx.generateUuid()
    mergedDto.organisationLocationId = clientDto?.organisationLocationId  || ctx.generateUuid()
    mergedDto.organisationPersonId   = clientDto?.organisationPersonId    || ctx.generateUuid()
    mergedDto.personSubstationId     = clientDto?.personSubstationId      || ctx.generateUuid()

    // 5. Build entity từ mergedDto
    const entity = SubstationMapper.mapDtoToEntity(mergedDto)

    // 6. Insert DB + snapshot trong cùng 1 transaction
    const insertResult = await window.electronAPI.insertSubstationEntity(entity, serverDto)
    if (!insertResult.success) throw new Error(`Database Insert Substation Error: ${insertResult.message}`)

    // 7. Update UI
    const parentNode = ctx.findNodeById(data.parentOrgId, ctx.organisationClientList)
    if (parentNode) {
        const newNode = {
            mrid:      substation.mrid,
            name:      substation.name,
            aliasName: substation.aliasName,
            parentId:  data.parentOrgId,
            mode:      'substation',
        }

        if (!parentNode.children) {
            // Chưa có children → khởi tạo với node mới luôn, không $set rỗng trước
            ctx.$set(parentNode, 'children', [newNode])
        } else {
            // Đã có children → chỉ update/thêm node, không đụng vào mảng
            const idx = parentNode.children.findIndex(c => c.mrid === substation.mrid)
            if (idx >= 0) {
                // Dùng splice thay vì $set để Vue detect change mà không re-render toàn bộ
                parentNode.children.splice(idx, 1, newNode)
            } else {
                parentNode.children.push(newNode)
            }
        }
        // Không set expanded — giữ nguyên trạng thái cây
    }
}