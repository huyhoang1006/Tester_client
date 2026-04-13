/* eslint-disable */
import * as OrganisationServerMapper from '@/views/Mapping/ServerToDTO/Organisation/index.js'
import * as OrganisationMapper from '@/views/Mapping/Organisation/index.js'
import * as demoAPI from '@/api/demo'
import { fetchWithRetry } from './core-utils.js'
import { detectConflicts, applyResolved, ORG_FIELD_DEFS } from '@/utils/conflictUtils.js'

export async function getOrganisationChain(id, parentId) {
    try {
        const data = await fetchWithRetry(() => demoAPI.getOrganisationById(id))
        return {
            id:          data.mRID || data.id,
            mrid:        data.mRID || data.id,
            name:        data.name || '',
            aliasName:   data.shortName || data.aliasName || '',
            parentId:    parentId != null ? String(parentId) : null,
            _type:       'organisation',
            _serverData: data || { id, name: '' }
        }
    } catch (error) {
        console.error(`Error fetching organisation with id ${id}:`, error)
        throw new Error(`Error fetching organisation with id ${id}: ${error.message}`)
    }
}

export async function downloadOrganisationChain(org, ctx) {
    const rawPositionPoints    = org._serverData?.positionPoints || []
    const hasValidPositionData = rawPositionPoints.some(
        p => p.xposition !== null || p.yposition !== null || p.zposition !== null
    )
 
    // 1. Build serverData đúng cấu trúc mapper cần
    const serverData = {
        name:               org._serverData?.name        || org.name,
        aliasName:          org._serverData?.shortName   || org._serverData?.aliasName || org.name,
        description:        org._serverData?.description || '',
        mRID:               org.mrid,
        parentOrganisation: org.parentId,
        organisation: {
            mRID:               org.mrid,
            parentOrganisation: org.parentId,
            taxCode:            org._serverData?.organisation?.taxCode           || '',
            electronicAddress:  org._serverData?.organisation?.electronicAddress || {},
            phone:              org._serverData?.organisation?.phone             || {},
            streetAddress:      org._serverData?.organisation?.streetAddress     || null,
        },
        positionPoints: hasValidPositionData ? rawPositionPoints : [],
    } 
    // 2. Map server → serverDto
    const serverDto = OrganisationServerMapper.mapServerToDto(serverData)
 
    // 3. Lấy client data cũ nếu đã tồn tại
    const existingResult = await window.electronAPI.getOrganisationEntityByMrid(org.mrid)
    const clientDto = existingResult.success
        ? OrganisationMapper.OrgEntityToOrgDto(existingResult.data)
        : null
 
    // 4. Merge
    let mergedDto
 
    if (!clientDto) {
        // Chưa có ở local → insert thẳng serverDto
        mergedDto = serverDto
 
    } else {
        const snapshotResult = await window.electronAPI.getEntitySnapshotByMrid(org.mrid, 'organisation')
        const baseDto        = snapshotResult.success ? snapshotResult.data : null
 
        if (!baseDto) {
            // Chưa có snapshot → server wins nếu client rỗng, giữ client nếu đã có data
            mergedDto = { ...clientDto }
            for (const group of ORG_FIELD_DEFS) {
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
            const diffFields  = detectConflicts(baseDto, clientDto, serverDto, ORG_FIELD_DEFS)
            const hasConflict = diffFields.some(f => f.status === 'conflict')
 
            if (!hasConflict) {
                mergedDto = applyResolved(diffFields, clientDto)
            } else {
                mergedDto = await new Promise((resolve, reject) => {
                    ctx.$showConflictDialog({
                        title:     `Xung đột dữ liệu — ${org.name}`,
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
    }
 
    // 5. Set context IDs
    mergedDto.organisationId = org.mrid
    mergedDto.parentId       = org.parentId

    // 6. Build entity từ mergedDto
    const entity = OrganisationMapper.OrgDtoToOrgEntity(mergedDto)
 
    // 7. Insert DB + snapshot trong cùng 1 transaction
    const insertResult = await window.electronAPI.insertParentOrganizationEntityFromServer(entity, serverDto)

 
    if (!insertResult.success) {
        console.error(`[Org DB Error] ${org.name}:`, insertResult.message)
        throw new Error(`Database Insert Organisation Error: ${insertResult.message}`)
    }
 
    // 8. Update UI — chỉ sau khi DB thành công
    const parentNode = ctx.findNodeById(org.parentId, ctx.organisationClientList)
    if (parentNode) {
        if (!parentNode.children) ctx.$set(parentNode, 'children', [])
 
        const newNode = {
            mrid:      org.mrid,
            name:      org.name,
            aliasName: org.aliasName,
            parentId:  org.parentId,
            mode:      'organisation',
        }
 
        const idx = parentNode.children.findIndex(c => c.mrid === org.mrid)
        if (idx >= 0) parentNode.children.splice(idx, 1, newNode)
        else parentNode.children.push(newNode)
 
        if (parentNode.expanded) ctx.$set(parentNode, 'expanded', true)
    }
}