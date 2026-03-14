// File: src/services/download-services/core-utils.js
import * as demoAPI from '@/api/demo'
import constant from '@/utils/constant'

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

// Lọc và xây dựng chuỗi Organisation cha từ parentArr
export async function buildOrgAncestors(node) {
    const CLIENT_ROOT = constant.ROOT
    const chain =[]
    let prevParentId = CLIENT_ROOT
    
    // 1. Quét mảng parentArr để nhặt các node là Organisation
    if (node.parentArr && Array.isArray(node.parentArr)) {
        for (const ancestor of node.parentArr) {
            if (ancestor.mode === 'organisation') {
                const ancestorId = ancestor.mrid || ancestor.id
                chain.push({
                    id: ancestorId, 
                    mrid: ancestorId, 
                    name: ancestor.parent || ancestor.name || '', 
                    parentId: prevParentId, 
                    _type: 'organisation',
                    _serverData: { id: ancestorId, name: ancestor.parent }
                })
                prevParentId = ancestorId
            }
        }
    }
    
    // 2. Nếu bản thân node đang click cũng là Org, ta gọi API lấy detail và thêm vào cuối
    if (node.mode === 'organisation') {
        const selectedId = node.mrid || node.id
        let selectedData = node._serverData || null
        
        try {
            const response = await fetchWithRetry(() => demoAPI.getOrganisationById(selectedId))
            if (response && typeof response === 'object' && response.aliasName) selectedData = response
            else if (response?.data?.data) selectedData = response.data.data
            else if (response?.data) selectedData = response.data
        } catch (e) {
            console.warn(`[buildOrgAncestors] Dùng data cơ bản cho Org ${selectedId}`)
        }
        
        chain.push({
            id: selectedId, mrid: selectedId, name: node.name || node.aliasName || '',
            parentId: prevParentId, _type: 'organisation',
            _serverData: selectedData || { id: selectedId, name: node.name }
        })
    }
    return chain
}