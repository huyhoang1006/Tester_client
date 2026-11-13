/* eslint-disable */
import * as demoAPI from '@/api/demo'
import * as SubstationServerMapper from '@/views/Mapping/ServerToDTO/Substation/index.js'
import * as SubstationMapper from '@/views/Mapping/Substation/index.js'
import { fetchWithRetry } from './core-utils.js'
import { detectConflicts, applyResolved, SUBSTATION_FIELD_DEFS } from '@/utils/conflictUtils.js'
import { showSubstationConflictDialog } from '@/views/TreeNode/dialogs/showSubstationConflictDialog'
import { replaceUserSuffix } from '@/utils/serverId'
import { scopeDtoIds, scopePositionPointIds } from './id-scope'
import { downloadAssetMediaToAttachmentData } from '@/utils/assetMedia'

const scopeSubstationDtoForUser = (dto, userId) => {
    scopeDtoIds(dto, {
        psrTypeId: 'psrtype',
        locationId: 'loc',
        streetAddressId: 'street-address',
        streetDetailId: 'street-detail',
        townDetailId: 'town-detail',
        electronicAddressId: 'ea',
        telephoneNumberId: 'tel',
        personId: 'person',
        personRoleId: 'person-role'
    }, userId)
    scopePositionPointIds(dto.positionPoints, userId)
    return dto
}

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
    const userId = ctx.$store.state.user.user_id
    const serverData = { ...substation._serverData, mRID: substation.mrid }

    // 1. Map server → serverDto
    const serverDto = SubstationServerMapper.mapServerToDto(serverData)
    const attachmentData = await downloadAssetMediaToAttachmentData('Substation', substation.mrid)
    if (attachmentData.length) {
        serverDto.attachment.path = JSON.stringify(attachmentData)
    }
    scopeSubstationDtoForUser(serverDto, userId)

    // 2. Lấy client data cũ nếu đã tồn tại
    const existingResult = await window.electronAPI.getSubstationEntityByMrid(
        substation.mrid,
        ctx.$store.state.user.user_id,
        data.parentOrgId
    )
    const clientDto = existingResult.success
        ? scopeSubstationDtoForUser(SubstationMapper.mapEntityToDto(existingResult.data), userId)
        : null

    // 3. Merge
    let mergedDto
    let localChangesAfterDownload = false

    if (!clientDto) {
        // Chưa có ở local → insert thẳng serverDto
        mergedDto = serverDto

    } else {
        const snapshotResult = await window.electronAPI.getEntitySnapshotByMrid(substation.mrid, 'substation')
        const baseDto        = snapshotResult.success ? snapshotResult.data : null

        if (!baseDto) {
            // Legacy download without a base: treat divergent non-empty values as conflicts.
            const diffFields = detectConflicts({}, clientDto, serverDto, SUBSTATION_FIELD_DEFS)
                .map(field => {
                    const clientEmpty = field.client === null || field.client === ''
                    const serverEmpty = field.server === null || field.server === ''
                    if (field.client === field.server) return { ...field, status: 'unchanged', resolved: field.client }
                    if (clientEmpty || serverEmpty) return {
                        ...field, status: 'auto', autoResolved: clientEmpty ? 'server' : 'client',
                        resolved: clientEmpty ? field.server : field.client
                    }
                    return { ...field, status: 'conflict', resolved: null }
                })
            mergedDto = diffFields.some(field => field.status === 'conflict')
                ? applyResolved(await showSubstationConflictDialog(diffFields, substation.name), clientDto)
                : applyResolved(diffFields, clientDto)

        } else {
            // Có snapshot → 3-way merge
            const diffFields  = detectConflicts(baseDto, clientDto, serverDto, SUBSTATION_FIELD_DEFS)
            const hasConflict = diffFields.some(f => f.status === 'conflict')

            if (!hasConflict) {
                mergedDto = applyResolved(diffFields, clientDto)
            } else {
                const resolvedFields = await showSubstationConflictDialog(diffFields, substation.name)
                mergedDto = applyResolved(resolvedFields, clientDto)
            }
        }

        localChangesAfterDownload = SUBSTATION_FIELD_DEFS.some(group => group.fields.some(
            field => mergedDto[field.key] !== serverDto[field.key]
        ))

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
    const userOwnedSubstationId = String(substation.mrid).indexOf('@') !== -1
        ? replaceUserSuffix(substation.mrid, userId)
        : `${substation.mrid}@u-${userId}`
    mergedDto.userIdentifiedObjectId = clientDto?.userIdentifiedObjectId || userOwnedSubstationId
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
            name:      mergedDto.name,
            aliasName: mergedDto.aliasName,
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
                newNode.children = parentNode.children[idx].children
                newNode.expanded = parentNode.children[idx].expanded
                // Dùng splice thay vì $set để Vue detect change mà không re-render toàn bộ
                parentNode.children.splice(idx, 1, newNode)
            } else {
                parentNode.children.push(newNode)
            }
        }
        // Không set expanded — giữ nguyên trạng thái cây
    }
    return { localChangesAfterDownload }
}
