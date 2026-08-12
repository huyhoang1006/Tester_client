/* eslint-disable */
// File: src/services/download-services/core-utils.js
import constant from '@/utils/constant'
import { toLocalMrid } from '@/utils/serverId'
import { getOrganisationChain, downloadOrganisationChain } from './organisation.js'
import { getSubstationChain, downloadSubstationChain } from './substation.js'
import { getVoltageLevelChain, downloadVoltageLevelChain } from './voltageLevel.js'
import { getBayChain, downloadBayChain } from './bay.js'
import { getVoltageTransformerChain, downloadVoltageTransformerChain } from './voltageTransformer.js'
import { getCurrentTransformerChain, downloadCurrentTransformerChain } from './currentTransformer.js'
import { getDisconnectorChain, downloadDisconnectorChain } from './disconnector.js'
import { getSurgeArresterChain, downloadSurgeArresterChain } from './surgeArrester.js'
import { getCircuitBreakerChain, downloadCircuitBreakerChain } from './circuitBreaker.js'
import { getTransformerChain, downloadTransformerChain } from './transformer.js'
import {
    getTransformerJobChain, getVoltageTransformerJobChain, getCurrentTransformerJobChain,
    getCircuitBreakerJobChain, getDisconnectorJobChain, getSurgeArresterJobChain,
    downloadTransformerJobChain, downloadVoltageTransformerJobChain, downloadCurrentTransformerJobChain,
    downloadCircuitBreakerJobChain, downloadDisconnectorJobChain, downloadSurgeArresterJobChain
} from './job.js'

// Job phân nhánh theo `job` (nhãn loại THIẾT BỊ), giống hệt cách asset phân nhánh
// theo `asset`. Tách ra hằng số vì cùng một bảng được dùng ở hai chỗ bên dưới.
const JOB_FETCH_STRATEGIES = {
    'Transformer':         getTransformerJobChain,
    'Voltage transformer': getVoltageTransformerJobChain,
    'Current transformer': getCurrentTransformerJobChain,
    'Circuit breaker':     getCircuitBreakerJobChain,
    'Disconnector':        getDisconnectorJobChain,
    'Surge arrester':      getSurgeArresterJobChain,
}

const JOB_DOWNLOAD_STRATEGIES = {
    'Transformer':         downloadTransformerJobChain,
    'Voltage transformer': downloadVoltageTransformerJobChain,
    'Current transformer': downloadCurrentTransformerJobChain,
    'Circuit breaker':     downloadCircuitBreakerJobChain,
    'Disconnector':        downloadDisconnectorJobChain,
    'Surge arrester':      downloadSurgeArresterJobChain,
}

// Cơ chế gọi API an toàn, chống rớt mạng
export async function fetchWithRetry(fn, maxRetries = 3, delayMs = 1000) {
    for (let i = 1; i <= maxRetries; i++) {
        try {
            return await fn()
        } catch (error) {
            if (i < maxRetries) await new Promise(resolve => setTimeout(resolve, delayMs * i))
        }
    }
    throw new Error(`Failed after ${maxRetries} retries`)
}

// Lọc và xây dựng chuỗi cha từ parentArr
//
// id/mrid trong chuỗi được đổi sang dạng LOCAL ("<id server>@<loại>") ngay tại đây,
// vì chỉ ở đây mới biết chắc loại của từng cấp. Các hàm getXxxChain vẫn gọi API bằng
// giá trị này được, do tầng api/demo tự cắt hậu tố.
export async function buildOrgAncestors(node) {
    const CLIENT_ROOT = constant.ROOT
    const chain =[]
    let prevParentId = CLIENT_ROOT

    // 1. Quét mảng parentArr
    if (node.parentArr && Array.isArray(node.parentArr)) {
        for (const ancestor of node.parentArr) {
            const ancestorId = toLocalMrid(ancestor.mrid || ancestor.id, ancestor)
            chain.push({
                id: ancestorId,
                mrid: ancestorId,
                name: ancestor.name || '',
                aliasName: ancestor.aliasName || '',
                parentId: String(prevParentId),
                _type: ancestor.mode,
                asset: ancestor.asset || null, // Thêm thông tin asset nếu có
                job: ancestor.job || null,     // node job: nhãn loại thiết bị, để chọn mapper
            })
            prevParentId = ancestorId
        }
    }

    // 2. Thêm node hiện tại vào cuối chuỗi
    const nodeId = toLocalMrid(node.mrid || node.id, node)
    chain.push({
        id: nodeId,
        mrid: nodeId,
        name: node.name || '',
        aliasName: node.aliasName || '',
        parentId: String(prevParentId),
        _type: node.mode,
        asset: node.asset || null, // Thêm thông tin asset nếu có
        job: node.job || null,     // node job: nhãn loại thiết bị, để chọn mapper
    })
    console.log('Built ancestor chain:', chain)
    return chain
}

//lấy full thông tin từ chuỗi
export async function buildSingleNodeChain(node) {
    const parentArr = Array.isArray(node.parentArr) ? node.parentArr : []
    const lastParent = parentArr.length ? parentArr[parentArr.length - 1] : null
    const rawParentId = node.parentId || lastParent?.mrid || lastParent?.id || constant.ROOT
    // lastParent mang mode của cha → dựng được mrid local đúng loại cho cha
    const parentId = lastParent ? toLocalMrid(rawParentId, lastParent) : rawParentId
    const nodeId = toLocalMrid(node.mrid || node.id, node)

    const chain = [{
        id: nodeId,
        mrid: nodeId,
        name: node.name || '',
        aliasName: node.aliasName || '',
        parentId: String(parentId),
        _type: node.mode,
        asset: node.asset || null,
        job: node.job || null,
    }]

    console.log('Built single node chain:', chain)
    return chain
}

export async function fetchFullInfoForChain(chain) {
    const fullInfoChain =[]
    const strategies = {
        'organisation': getOrganisationChain, // Sử dụng hàm download Organisation đã có
        'substation': getSubstationChain, // Hàm này cần được định nghĩa tương tự như processOrganisationDownload
        'voltageLevel': getVoltageLevelChain, // Hàm này cần được định nghĩa tương tự như processOrganisationDownload
        'bay': getBayChain, // Hàm này cần được định nghĩa tương tự như processOrganisationDownload
        'asset': {
            'Voltage transformer': getVoltageTransformerChain, // Hàm này cần được định nghĩa tương tự như processOrganisationDownload
            'Current transformer': getCurrentTransformerChain, // Hàm này cần được định nghĩa tương tự như processOrganisationDownload
            'Disconnector':        getDisconnectorChain,
            'Surge arrester':      getSurgeArresterChain,
            'Circuit breaker':     getCircuitBreakerChain,
            'Transformer':         getTransformerChain,
        },
        'job': JOB_FETCH_STRATEGIES,
    }
    for (const node of chain) {
        var strategy;
        if (node._type === 'asset') {
            strategy = strategies[node._type][node.asset]
        } else if (node._type === 'job') {
            strategy = strategies[node._type][node.job]
        } else {
            strategy = strategies[node._type]
        }
        if (strategy) {
            const fullInfo = await strategy(node.id || node.mrid, node.parentId)
            fullInfoChain.push(fullInfo)
        }
    }
    console.log('Full info chain:', fullInfoChain)
    return fullInfoChain
}

function extractDownloadedSyncNode(node) {
    if (!node || typeof node !== 'object') return null

    const keyByType = {
        organisation: 'organisation',
        substation: 'substation',
        voltageLevel: 'voltageLevel',
        bay: 'bay',
        job: 'jobData',
    }
    const dataKey = node._type === 'asset'
        ? Object.keys(node).find(key => node[key] && typeof node[key] === 'object' && (node[key].mrid || node[key].id))
        : keyByType[node._type]
    const data = dataKey && node[dataKey] ? node[dataKey] : node
    const mrid = data && (data.mrid || data.id)

    if (!mrid) return null
    return {
        mrid: String(mrid),
        id: String(mrid),
        mode: node._type || data._type || data.mode,
        asset: node.asset || data.asset || null,
        job: node.job || data.job || null
    }
}

export async function downloadChainInfo(chainInfo, ctx) {
    const strategies = {
        'organisation': downloadOrganisationChain, // Sử dụng hàm download Organisation đã có
        'substation': downloadSubstationChain,
        'voltageLevel': downloadVoltageLevelChain,
        'bay': downloadBayChain,
        'asset': {
            'Voltage transformer': downloadVoltageTransformerChain,
            'Current transformer': downloadCurrentTransformerChain,
            'Disconnector':        downloadDisconnectorChain,
            'Surge arrester':      downloadSurgeArresterChain,
            'Circuit breaker':     downloadCircuitBreakerChain,
            'Transformer':         downloadTransformerChain,
        },
        'job': JOB_DOWNLOAD_STRATEGIES,
    }

    for (const node of chainInfo) {
        var strategy;
        if (node._type === 'asset') {
            strategy = strategies[node._type][node.asset];
        } else if (node._type === 'job') {
            strategy = strategies[node._type][node.job];
        } else {
            strategy = strategies[node._type];
        }
        if (strategy) {
            await strategy(node, ctx)
            if (ctx && ctx.markDownloadedNodeSynced) {
                const syncNode = extractDownloadedSyncNode(node)
                if (syncNode) await ctx.markDownloadedNodeSynced(syncNode)
            }
        }
    }
}
