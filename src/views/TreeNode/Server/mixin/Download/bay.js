// File: src/services/download-services/bay.js
import * as demoAPI from '@/api/demo'
import * as BayServerMapper from '@/views/Mapping/ServerToDTO/Bay/index.js'
import { processVoltageLevelDownload } from './voltageLevel'

export async function processBayDownload(node, ctx) {
    if (!node.mrid && !node.id) throw new Error('Bay ID not found')
    if (!node.parentId) throw new Error('Parent VoltageLevel not found')
    ctx.$store.commit('loading/SET_CUSTOM_TEXT', 'Downloading bay...');

    try { await ctx.$confirm(`Download Bay[${node.name}] + ancestors?`, 'Xác nhận', { type: 'info' }) }
    catch (e) { throw new Error('CANCELED') } // Báo lỗi để index.js bỏ qua

    ctx.$store.commit('loading/SET_CUSTOM_TEXT', 'Đang kiểm tra & tải tổ tiên...')

    // 1. Kiểm tra VoltageLevel cha, chưa có thì nhờ tầng VoltageLevel tải (Nó sẽ tự lo vụ Sub và Org)
    const existingVL = ctx.findNodeById(node.parentId, ctx.organisationClientList)
    if (!existingVL) {
        const parentVLNode = node.parentArr?.find(p => p.mode === 'voltageLevel') || { mrid: node.parentId, parentId: node.parentArr?.find(p => p.mode === 'substation')?.mrid, parentArr: node.parentArr }
        await processVoltageLevelDownload(parentVLNode, ctx)
    }

    // 2. Tải Bay
    ctx.$store.commit('loading/SET_CUSTOM_TEXT', 'Đang tải dữ liệu Bay...')
    let bayData = null
    for (let i = 0; i < 3; i++) {
        try {
            const res = await demoAPI.getBayById(node.mrid || node.id)
            if (res && (res.mRID || res.mrid)) { bayData = res; break; }
        } catch (e) { if (i === 2) throw new Error('Lỗi gọi API Bay') }
    }

    const dto = BayServerMapper.mapServerToDto({ ...bayData, mRID: node.mrid || node.id, voltageLevel: { mRID: node.parentId } })
    const entityData = {
        mrid: dto.bayId, name: dto.name,
        bay_energy_meas_flag: dto.bay_energy_meas_flag || '',
        bay_power_meas_flag: dto.bay_power_meas_flag || '',
        breaker_configuration: dto.breaker_configuration || '',
        bus_bar_configuration: dto.bus_bar_configuration || '',
        voltage_level: node.parentId, substation: null
    }

    const insertResult = await window.electronAPI.insertBayEntity(entityData)
    if (!insertResult.success) throw new Error(insertResult.message)

    // Update UI
    const parentNode = ctx.findNodeById(node.parentId, ctx.organisationClientList)
    if (parentNode) {
        if (!parentNode.children) parentNode.children = []
        const newNode = { id: dto.bayId, mrid: dto.bayId, name: dto.name, aliasName: dto.name, parentId: node.parentId, mode: 'bay' }
        const idx = parentNode.children.findIndex(c => c.mrid === dto.bayId)
        if (idx >= 0) parentNode.children[idx] = newNode
        else parentNode.children.push(newNode)
        ctx.$set(parentNode, 'expanded', true)
    }
}