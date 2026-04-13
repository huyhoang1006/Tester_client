/* eslint-disable */
// File: src/services/download-services/core-utils.js
import constant from '@/utils/constant'
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
export async function buildOrgAncestors(node) {
    const CLIENT_ROOT = constant.ROOT
    const chain =[]
    let prevParentId = CLIENT_ROOT
    
    // 1. Quét mảng parentArr
    if (node.parentArr && Array.isArray(node.parentArr)) {
        for (const ancestor of node.parentArr) {
            const ancestorId = ancestor.mrid || ancestor.id
            chain.push({
                id: ancestorId, 
                mrid: ancestorId, 
                name: ancestor.name || '',
                aliasName: ancestor.aliasName || '',
                parentId: String(prevParentId), 
                _type: ancestor.mode,
                asset: ancestor.asset || null, // Thêm thông tin asset nếu có
            })
            prevParentId = ancestorId
        }
    }

    // 2. Thêm node hiện tại vào cuối chuỗi
    chain.push({
        id: node.mrid || node.id, 
        mrid: node.mrid || node.id, 
        name: node.name || '',
        aliasName: node.aliasName || '',
        parentId: String(prevParentId), 
        _type: node.mode,
        asset: node.asset || null, // Thêm thông tin asset nếu có
    })
    console.log('Built ancestor chain:', chain)
    return chain
}

//lấy full thông tin từ chuỗi
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
        }
    }
    for (const node of chain) {
        var strategy;
        if (node._type === 'asset') {
            strategy = strategies[node._type][node.asset]
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
        }
    }

    for (const node of chainInfo) {
        var strategy;
        if (node._type === 'asset') {
            strategy = strategies[node._type][node.asset];
        } else {
            strategy = strategies[node._type];
        }
        if (strategy) {
            await strategy(node, ctx)
        }
    }
}