/**
 * mridConflictScan.js  —  TẦNG function (renderer, logic quét trùng)
 * ----------------------------------------------------------------------------
 * Phần 1-2 phía renderer: từ cây JSON import → gom toàn bộ mrid → gọi
 * electronAPI.checkMridsExist → với mỗi mrid trùng, lấy path để hiện "đang ở đâu".
 *
 * ĐẶT FILE: <thư mục function của bạn>/entity/mrid/mridConflictScan.js
 *
 * Trả về danh sách xung đột để mở dialog cho user quyết định:
 *   conflicts = [{ mrid, type, nameInFile, existsAt: { mode, name, pathText } }]
 * ----------------------------------------------------------------------------
 */

/**
 * Duyệt cây JSON (roots[]) → mảng phẳng [{ mrid, type, name, asset? }]
 * Gom mrid của CHÍNH node (không gom id con bên trong dto như cell/equipment —
 * trùng ở mức node là đủ để hỏi; id con sẽ xử lý theo lựa chọn của node cha).
 */
/**
 * mrid của 1 node theo từng type (đồng bộ với branchMrid trong importJsonService).
 * Trước đây chỉ đọc data.mrid → bỏ sót org/sub/vl (mrid ở organisationId/subsId/...).
 */
const nodeMrid = (node) => {
    if (!node || !node.data) return null
    const d = node.data
    switch (node.type) {
        case 'job':          return d.properties && d.properties.mrid
        case 'organisation': return d.organisationId || (d.organisation && d.organisation.mrid) || d.mrid
        case 'substation':   return d.subsId || (d.substation && d.substation.mrid) || d.mrid
        case 'voltageLevel': return (d.voltageLevel && d.voltageLevel.mrid) || d.voltageLevelId || d.mrid
        case 'bay':          return (d.bay && d.bay.mrid) || d.bayId || d.mrid
        default:             return (d.properties && d.properties.mrid) || d.mrid   // asset
    }
}

export const collectTreeMrids = (roots) => {
    const out = []
    const walk = (node) => {
        if (!node) return
        const mrid = nodeMrid(node)
        if (mrid) {
            out.push({
                mrid,
                type: node.type,
                asset: node.asset || null,
                name: pickName(node),
                _ref: node,            // giữ tham chiếu để gắn quyết định sau
            })
        }
        for (const c of (node.children || [])) walk(c)
    }
    for (const r of (roots || [])) walk(r)
    return out
}

const pickName = (node) => {
    const d = node.data || {}
    if (node.type === 'job') return (d.properties && (d.properties.name || d.properties.mRID)) || d.name || ''
    // asset: tên ở properties.apparatus_id / serial_no
    if (d.properties) return d.properties.apparatus_id || d.properties.serial_no || d.properties.name || d.name || ''
    return d.name || d.serial_number || ''
}

/**
 * Quét trùng: trả danh sách conflict (kèm path "đang ở đâu").
 * deps = { electronAPI }
 */
export const scanTreeConflicts = async (roots, deps) => {
    const { electronAPI } = deps
    const opts = (deps && deps.opts) || {}   // { resolvePath?: bool }
    const items = collectTreeMrids(roots)
    if (items.length === 0) return { conflicts: [], items: [] }

    // 1) check tồn tại (1 lần cho cả mảng)
    const checkItems = items.map(i => ({ mrid: i.mrid, type: i.type }))
    console.log('[SCAN] gửi checkMridsExist:', JSON.stringify(checkItems))
    const res = await electronAPI.checkMridsExist(checkItems)
    console.log('[SCAN] checkMridsExist trả về RAW:', JSON.stringify(res))
    // API trả { success, message, data: [{ mrid, mode, name }] } — data = các mrid TỒN TẠI.
    const existingList = (res && (res.data || res.existing)) || []
    const existingMap = {}
    for (const e of existingList) existingMap[e.mrid] = e
    console.log('[SCAN] existingMap (số trùng):', Object.keys(existingMap).length, existingMap)

    // 2) với mỗi mrid trùng → lấy path để hiển thị
    const conflicts = []
    for (const it of items) {
        const ex = existingMap[it.mrid]
        if (!ex) continue
        let pathText = ex.name || ''
        // resolveMridPath là TÙY CHỌN — chỉ để hiện "đang ở đâu".
        // Tắt mặc định vì resolveMridPath (main process) có thể lỗi SQL với 1 số mode
        // và làm crash app (handler thiếu try-catch). Bật lại khi function đã ổn.
        if (opts && opts.resolvePath) {
            try {
                const pr = await electronAPI.resolveMridPath(it.mrid, ex.mode)
                const pathArr = (pr && (pr.data || pr.path)) || []
                if (pr && pr.success && pathArr.length) {
                    pathText = pathArr.map(p => p.name || p.mode).join(' / ')
                }
            } catch (e) { /* path lỗi không chặn flow */ }
        }

        conflicts.push({
            mrid: it.mrid,
            type: it.type,
            asset: it.asset,
            nameInFile: it.name,
            existsAt: { mode: ex.mode, name: ex.name, pathText },
            node: it._ref,        // node trong cây để gắn action
        })
    }

    return { conflicts, items }
}

/**
 * Ý nghĩa 3 lựa chọn cho mỗi node trùng (hằng số để dùng chung dialog ↔ import):
 *  - OVERWRITE : ghi đè giá trị, GIỮ mrid cũ. (con cháu KHÔNG hỏi — đi theo ghi đè)
 *  - NEW       : tạo mrid mới cho node này. (con cháu PHẢI hỏi tiếp)
 *  - USE_EXISTING : dùng luôn node đã có làm điểm ghép; không đụng dữ liệu node đó.
 *                   (cảnh báo rủi ro ref; con trong file ghép vào node DB sẵn)
 */
export const CONFLICT_ACTION = {
    OVERWRITE: 'overwrite',
    NEW: 'new',
    USE_EXISTING: 'use_existing',
}