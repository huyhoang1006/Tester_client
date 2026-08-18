/* eslint-disable */
import * as OrganisationServerMapper from '@/views/Mapping/ServerToDTO/Organisation/index.js'
import * as OrganisationMapper from '@/views/Mapping/Organisation/index.js'
import * as demoAPI from '@/api/demo'
import { fetchWithRetry } from './core-utils.js'
import { detectConflicts, applyResolved, ORG_FIELD_DEFS } from '@/utils/conflictUtils.js'
import constant from '@/utils/constant'
import { scopeDtoIds, scopePositionPointIds } from './id-scope'

const scopeOrganisationDtoForUser = (dto, userId) => {
    scopeDtoIds(dto, {
        electronicAddressId: 'ea',
        telephoneNumberId: 'tel',
        streetAddressId: 'street-address',
        streetDetailId: 'street-detail',
        townDetailId: 'town-detail'
    }, userId)
    scopePositionPointIds(dto.positionPoints, userId)
    return dto
}

export async function getOrganisationChain(id, parentId) {
    try {
        const data = await fetchWithRetry(() => demoAPI.getOrganisationById(id))
        return {
            // GIỮ NGUYÊN `id` ĐÃ TRUYỀN VÀO, không lấy lại từ phản hồi server.
            //
            // `id` tới đây đã ở dạng local ('20@org'); tầng api tự cắt hậu tố trước khi
            // gọi. Phản hồi server trả `mRID: 20` trần, nên lấy từ đó là MẤT hậu tố —
            // và đây là file DUY NHẤT trong tám file cùng thư mục làm vậy, bảy file kia
            // đều dùng `String(id)`.
            //
            // Hậu quả không lộ ra ngay, vì `parentId` đi thẳng từ chuỗi nên VẪN còn hậu
            // tố. Tổ chức được ghi xuống với mrid '20' trong khi con của nó trỏ tới
            // '1000@org' -> SQLITE_CONSTRAINT FOREIGN KEY, ở một node khác, sau đó vài
            // giây. Lỗi chỉ nổ khi tổ chức CÓ tổ chức cha, nên tài khoản chỉ nhìn thấy
            // một cấp thì không bao giờ gặp.
            id:          String(id),
            mrid:        String(id),
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

/**
 * Cha nào được ghi xuống DB: cha server vừa báo, hay cha đang có ở máy.
 *
 * ─── VẤN ĐỀ ──────────────────────────────────────────────────────────────────
 *
 * `buildOrgAncestors` dựng chuỗi cha từ `parentArr`, mà `parentArr` chỉ chứa những
 * cấp TÀI KHOẢN ĐANG ĐĂNG NHẬP nhìn thấy được. Hết cấp thì nó gán `constant.ROOT`.
 *
 * Nên cùng một tổ chức, hai tài khoản tải về hai giá trị cha khác nhau:
 *
 *     admin    thay EVN > EVNHCMC   ->  cha cua EVNHCMC = '1000@org'
 *     evn_hcm  chi thay EVNHCMC     ->  cha cua EVNHCMC = ROOT
 *
 * DB local chỉ có một cột để ghi. Tải bằng `admin` xong rồi tải lại bằng `evn_hcm`
 * là cấu trúc đúng bị SAN PHẲNG — EVNHCMC nhảy từ dưới EVN lên ngang hàng gốc,
 * lặng lẽ, không một thông báo.
 *
 * ─── CÁCH XỬ ─────────────────────────────────────────────────────────────────
 *
 * `ROOT` không phải một tổ chức. Nó là chỗ neo của cây cục bộ, và ở đây nó chỉ
 * mang nghĩa "hết phần tôi được xem" — tức là THIẾU THÔNG TIN, không phải thông
 * tin mới. Còn một mrid cụ thể là thông tin thật.
 *
 * Vì vậy: cha cụ thể luôn thắng ROOT, bất kể bên nào đang giữ nó.
 *
 *     server bao cha cu the                    -> lay server (ke ca de len ROOT cu)
 *     server bao ROOT, may dang co cha cu the  -> GIU cha o may
 *     server bao ROOT, may cung ROOT           -> ROOT
 *     ca hai deu cu the nhung khac nhau        -> lay server, to chuc that su da chuyen
 *
 * Cố ý KHÔNG đưa `parentId` vào `ORG_FIELD_DEFS` để bước gộp ba chiều lo. Gộp ba
 * chiều so client với server một cách cân bằng, mà ở đây hai bên KHÔNG cân bằng:
 * ROOT là "tôi không biết", không phải "cha là ROOT".
 *
 * @param {string} incomingParentId cha theo chuỗi tải xuống lần này
 * @param {object|null} clientDto   bản đang có ở máy, null nếu chưa có
 * @returns {string} mrid cha sẽ được ghi xuống
 */
function resolveParentId(incomingParentId, clientDto) {
    const isRoot = (id) => !id || String(id) === String(constant.ROOT)

    if (!isRoot(incomingParentId)) return incomingParentId

    const localParentId = clientDto && clientDto.parentId
    if (!isRoot(localParentId)) {
        console.log('[Download org] server bao ROOT, giu cha dang co o may:', localParentId)
        return localParentId
    }
    return incomingParentId
}

/**
 * Gỡ mọi node mang mrid này ra khỏi cây, TRỪ nhánh con của cha mới.
 *
 * Chỉ đụng tới cây đang hiển thị, không đụng DB — DB vốn chỉ có một dòng nên không
 * bao giờ nhân đôi. Đây thuần tuý là dọn tàn dư trên màn hình.
 *
 * @param {object} ctx        component đang giữ cây
 * @param {string} mrid       id node cần gỡ
 * @param {string} keepUnder  mrid cha mới; nhánh con của nó được bỏ qua
 */
function removeNodeFromTree(ctx, mrid, keepUnder) {
    const walk = (nodes, parentMrid) => {
        if (!Array.isArray(nodes)) return
        for (let i = nodes.length - 1; i >= 0; i--) {
            const node = nodes[i]
            if (node.mrid === mrid && parentMrid !== keepUnder) {
                nodes.splice(i, 1)
                continue
            }
            walk(node.children, node.mrid)
        }
    }
    walk(ctx.organisationClientList, null)
}

export async function downloadOrganisationChain(org, ctx) {
    const userId = ctx.$store.state.user.user_id
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
    scopeOrganisationDtoForUser(serverDto, userId)
 
    // 3. Lấy client data cũ nếu đã tồn tại
    const existingResult = await window.electronAPI.getOrganisationEntityByMrid(org.mrid)
    const clientDto = existingResult.success
        ? scopeOrganisationDtoForUser(OrganisationMapper.OrgEntityToOrgDto(existingResult.data), userId)
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
    mergedDto.parentId       = resolveParentId(org.parentId, clientDto)

    // 6. Build entity từ mergedDto
    const entity = OrganisationMapper.OrgDtoToOrgEntity(mergedDto)
 
    // 7. Insert DB + snapshot trong cùng 1 transaction
    const insertResult = await window.electronAPI.insertParentOrganizationEntityFromServer(entity, serverDto)

 
    if (!insertResult.success) {
        console.error(`[Org DB Error] ${org.name}:`, insertResult.message)
        throw new Error(`Database Insert Organisation Error: ${insertResult.message}`)
    }
 
    // 8. Update UI — chỉ sau khi DB thành công
    //
    // Dùng cha ĐÃ QUYẾT, không dùng `org.parentId`. Hai giá trị này có thể lệch nhau
    // khi server báo ROOT mà máy đang giữ cha cụ thể; lấy `org.parentId` thì cây trên
    // màn hình cắm node vào gốc trong khi DB ghi cha thật, và sai lệch đó chỉ biến mất
    // sau khi nạp lại cây — đủ lâu để tưởng là lỗi ghi DB.
    // Gỡ node khỏi chỗ CŨ trước đã. Đoạn dưới chỉ thay/thêm trong danh sách con của
    // cha MỚI, nên khi một tổ chức đổi cha thì bản cũ vẫn nằm nguyên dưới cha cũ và
    // cây hiện RA HAI node trùng tên. Nó chỉ biến mất sau khi nạp lại cây, nên rất dễ
    // tưởng là DB đã sinh ra hai bản ghi.
    removeNodeFromTree(ctx, org.mrid, mergedDto.parentId)

    const parentNode = ctx.findNodeById(mergedDto.parentId, ctx.organisationClientList)
    if (parentNode) {
        if (!parentNode.children) ctx.$set(parentNode, 'children', [])

        const newNode = {
            mrid:      org.mrid,
            name:      org.name,
            aliasName: org.aliasName,
            parentId:  mergedDto.parentId,
            mode:      'organisation',
        }
 
        const idx = parentNode.children.findIndex(c => c.mrid === org.mrid)
        if (idx >= 0) parentNode.children.splice(idx, 1, newNode)
        else parentNode.children.push(newNode)
 
        if (parentNode.expanded) ctx.$set(parentNode, 'expanded', true)
    }
}
