// File: src/services/download-services/voltageLevel.js
import * as demoAPI from '@/api/demo'
import * as VoltageLevelServerMapper from '@/views/Mapping/ServerToDTO/VoltageLevel/index.js'
import * as VoltageLevelMapper from '@/views/Mapping/VoltageLevel/index.js'
import { processSubstationDownload } from './substation'

export async function processVoltageLevelDownload(node, ctx) {
    if (!node.mrid && !node.id) throw new Error('VoltageLevel ID not found')
    if (!node.parentId) throw new Error('Parent substation not found')
    ctx.$store.commit('loading/SET_CUSTOM_TEXT', 'Đang tải dữ liệu voltage level...');

    // 1. Kiểm tra xem Trạm cha đã có dưới Local chưa, chưa có thì nhờ tầng Sub tải
    const existingSub = ctx.findNodeById(node.parentId, ctx.organisationClientList)
    if (!existingSub) {
        // Tìm node Trạm trong cây Server để truyền cho hàm tải
        const parentSubNode = node.parentArr?.find(p => p.mode === 'substation') || { mrid: node.parentId, id: node.parentId, parentId: node.parentArr?.find(p=>p.mode==='organisation')?.mrid, parentArr: node.parentArr }
        await processSubstationDownload(parentSubNode, ctx)
    }

    // 2. Tải Cấp điện áp
    const { voltageLevel, parentSubId } = await prepareVoltageLevel(node)
    await saveVoltageLevelToDb(voltageLevel, parentSubId, ctx)
}

async function prepareVoltageLevel(node) {
    const vlId = node.mrid || node.id
    let data = null
    try {
        const res = await demoAPI.getVoltageLevelBySubstationId(node.parentId)
        if (Array.isArray(res)) data = res.find(vl => vl.mRID === vlId || vl.mrid === vlId)
        else if (res && (res.mRID === vlId || res.mrid === vlId)) data = res
    } catch (e) { throw new Error('Lỗi fetch API VoltageLevel') }

    if (!data) data = { mRID: vlId, name: node.name, shortName: node.name }

    return {
        voltageLevel: {
            id: vlId, mrid: String(vlId), name: data?.name || node.name || '',
            aliasName: data?.shortName || data?.aliasName || node.name || '',
            _type: 'voltageLevel', _serverData: data, parentId: node.parentId
        },
        parentSubId: node.parentId
    }
}

async function saveVoltageLevelToDb(voltageLevel, parentSubId, ctx) {
    const serverData = { ...voltageLevel._serverData, mRID: voltageLevel.mrid, substation: { mRID: parentSubId } }
    const dto = VoltageLevelServerMapper.mapServerToDto(serverData)
    dto.substationId = parentSubId
    dto.userIdentifiedObjectId = ctx.generateUuid()

    const entity = VoltageLevelMapper.volDtoToVolEntity(dto)
    const insertResult = await window.electronAPI.insertVoltageLevelEntity(entity)
    
    if (!insertResult.success) throw new Error('Lỗi DB Insert VoltageLevel')

    // Update UI
    const parentNode = ctx.findNodeById(parentSubId, ctx.organisationClientList)
    if (parentNode) {
        if (!parentNode.children) parentNode.children =[]
        const newNode = { mrid: voltageLevel.mrid, name: voltageLevel.name, aliasName: voltageLevel.aliasName, parentId: parentSubId, mode: 'voltageLevel' }
        const idx = parentNode.children.findIndex(c => c.mrid === voltageLevel.mrid)
        if (idx >= 0) parentNode.children[idx] = newNode
        else parentNode.children.push(newNode)
        ctx.$set(parentNode, 'expanded', true)
    }
}