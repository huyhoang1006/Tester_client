/* eslint-disable */
import * as demoAPI from '@/api/demo'
import * as BayServerMapper from '@/views/Mapping/ServerToDTO/Bay/index.js'
import { fetchWithRetry } from './core-utils.js'

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
    const serverData = { ...bay._serverData, mRID: bay.mrid, voltageLevel: { mRID: data.parentVlId } }

    // 1. Map server → dto (bay dto cũng là entity luôn)
    const serverDto = BayServerMapper.mapServerToDto(serverData)

    // 2. Lấy client data cũ
    const existingResult = await window.electronAPI.getBayEntityByMrid(bay.mrid)
    const clientDto      = existingResult.success ? existingResult.data : null

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

    // 4. Set context IDs
    mergedDto.mrid         = bay.mrid
    mergedDto.voltage_level = data.parentVlId

    // 5. Insert DB + snapshot trong cùng 1 transaction
    const insertResult = await window.electronAPI.insertBayEntity(mergedDto, serverDto)
    if (!insertResult.success) throw new Error(`Database Insert Bay Error: ${insertResult.message}`)

    // 6. Update UI — chỉ sau khi DB thành công
    const parentNode = ctx.findNodeById(data.parentVlId, ctx.organisationClientList)
    if (parentNode) {
        const newNode = {
            mrid:      bay.mrid,
            name:      bay.name,
            aliasName: bay.aliasName,
            parentId:  data.parentVlId,
            mode:      'bay',
        }

        if (!parentNode.children) {
            ctx.$set(parentNode, 'children', [newNode])
        } else {
            const idx = parentNode.children.findIndex(c => c.mrid === bay.mrid)
            if (idx >= 0) parentNode.children.splice(idx, 1, newNode)
            else parentNode.children.push(newNode)
        }

        if (!parentNode.expanded) ctx.$set(parentNode, 'expanded', true)
    }
}