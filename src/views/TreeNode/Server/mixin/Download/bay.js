/* eslint-disable */
import * as demoAPI from '@/api/demo'
import * as BayServerMapper from '@/views/Mapping/ServerToDTO/Bay/index.js'
import { fetchWithRetry } from './core-utils.js'
import { scopeDtoIds } from './id-scope'
import { getTypeSuffix } from '@/utils/serverId'

// Bay chỉ có name — không cần conflict dialog
// Nhưng vẫn giữ snapshot để base cho lần sau nếu cần mở rộng

// ─── Step 1: fetch full info từ server ───────────────────────────────────────

export async function getBayChain(id, parentId) {
    try {
        const data = await fetchWithRetry(() => demoAPI.getBayById(id))
        return {
            bay: {
                id:          id,
                mrid:        String(id),
                name:        data?.name      || '',
                aliasName:   data?.aliasName || data?.shortName || '',
                parentId:    String(parentId),
                _type:       'bay',
                _serverData: data || { mRID: id },
            },
            _type:        'bay',
            parentVlId:   String(parentId),
        }
    } catch (error) {
        console.error(`Error fetching bay with id ${id}:`, error)
        throw new Error(`Error fetching bay with id ${id}: ${error.message}`)
    }
}

// ─── Step 2: save to DB ───────────────────────────────────────────────────────

export async function downloadBayChain(data, ctx) {
    const bay        = data.bay
    const userId     = ctx.$store.state.user.user_id

    // NGĂN CÓ HAI LOẠI CHA. Bảng `bay` khai hai khoá ngoại — `substation` và
    // `voltage_level` — vì ngăn treo trực tiếp dưới trạm cũng được, mà treo dưới cấp
    // điện áp cũng được.
    //
    // Trước đây chỗ này ép cứng `voltageLevel`, nên ngăn thuộc trạm bị ghi id trạm
    // vào cột `voltage_level`, trỏ sang bảng không có dòng đó và khoá ngoại chặn.
    // Triệu chứng đúng như quan sát: ngăn dưới cấp điện áp thì tải được, ngăn dưới
    // trạm thì không.
    //
    // Loại cha đọc từ chính hậu tố của id ('108050@sub@u-21' -> 'sub'), nên không cần
    // truyền thêm gì từ tầng dựng chuỗi.
    const parentId          = data.parentVlId
    const parentIsSubstation = getTypeSuffix(parentId) === 'sub'

    // Đặt bên KIA về null một cách tường minh: `bay._serverData` có thể mang sẵn cả
    // hai từ server, và để lẫn thì ngăn treo hai chỗ cùng lúc.
    const serverData = {
        ...bay._serverData,
        mRID: bay.mrid,
        ...(parentIsSubstation
            ? { substation: { mRID: parentId }, voltageLevel: null }
            : { voltageLevel: { mRID: parentId }, substation: null })
    }

    // 1. Map server → dto (bay dto cũng là entity luôn)
    const serverDto = BayServerMapper.mapServerToDto(serverData)
    scopeDtoIds(serverDto, { bayId: 'bay' }, userId)
    const localBayId = serverDto.bayId

    // 2. Lấy client data cũ
    const existingResult = await window.electronAPI.getBayEntityByMrid(localBayId)
    const clientDto      = existingResult.success
        ? scopeDtoIds(existingResult.data, { bayId: 'bay' }, userId)
        : null

    // 3. Merge — bay đơn giản, chỉ server wins nếu client rỗng
    let mergedDto
    if (!clientDto) {
        mergedDto = serverDto
    } else {
        // Giữ client, cập nhật những field server có mà client rỗng
        mergedDto = {
            ...clientDto,
            name:                 clientDto.name                 || serverDto.name,
            aliasName:            clientDto.aliasName            || serverDto.aliasName,
            bay_energy_meas_flag: clientDto.bay_energy_meas_flag || serverDto.bay_energy_meas_flag,
            bay_power_meas_flag:  clientDto.bay_power_meas_flag  || serverDto.bay_power_meas_flag,
            breaker_configuration: clientDto.breaker_configuration || serverDto.breaker_configuration,
            bus_bar_configuration: clientDto.bus_bar_configuration || serverDto.bus_bar_configuration,
        }
    }

    // 4. Set context IDs — ghi đúng MỘT trong hai khoá ngoại, khoá kia phải là null
    mergedDto.mrid = localBayId
    mergedDto.bayId = localBayId
    if (parentIsSubstation) {
        mergedDto.substation    = parentId
        mergedDto.voltage_level = null
    } else {
        mergedDto.voltage_level = parentId
        mergedDto.substation    = null
    }

    // 5. Insert DB + snapshot trong cùng 1 transaction
    const insertResult = await window.electronAPI.insertBayEntity(mergedDto, serverDto)
    if (!insertResult.success) throw new Error(`Database Insert Bay Error: ${insertResult.message}`)

    // 6. Update UI — chỉ sau khi DB thành công
    const parentNode = ctx.findNodeById(data.parentVlId, ctx.organisationClientList)
    if (parentNode) {
        const newNode = {
            mrid:      localBayId,
            name:      bay.name,
            aliasName: bay.aliasName,
            parentId:  data.parentVlId,
            mode:      'bay',
        }

        if (!parentNode.children) {
            ctx.$set(parentNode, 'children', [newNode])
        } else {
            const idx = parentNode.children.findIndex(c => c.mrid === localBayId)
            if (idx >= 0) parentNode.children.splice(idx, 1, newNode)
            else parentNode.children.push(newNode)
        }

        if (!parentNode.expanded) ctx.$set(parentNode, 'expanded', true)
    }
}
