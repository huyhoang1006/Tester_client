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
    const walk = (node, parentMrid) => {
        if (!node) return
        const mrid = nodeMrid(node)
        if (mrid) {
            out.push({
                mrid,
                type: node.type,
                asset: node.asset || null,
                name: pickName(node),
                parentMrid: parentMrid || null,   // cha TRONG FILE (null = gốc nhánh ghép)
                _ref: node,            // giữ tham chiếu để gắn quyết định sau
            })
        }
        for (const c of (node.children || [])) walk(c, mrid || parentMrid)
    }
    for (const r of (roots || [])) walk(r, null)
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

    // 2) với mỗi mrid trùng → lấy path để hiển thị + xác định CHA hiện tại trong DB
    const targetMrid = opts.targetMrid || null   // node đích (cha của gốc nhánh ghép)
    const conflicts = []
    for (const it of items) {
        const ex = existingMap[it.mrid]
        if (!ex) continue
        let pathText = ex.name || ''
        let dbParentMrid = null   // cha TRỰC TIẾP của node cũ trong DB
        if (opts && opts.resolvePath) {
            try {
                const pr = await electronAPI.resolveMridPath(it.mrid, ex.mode)
                const pathArr = (pr && (pr.data || pr.path)) || []
                if (pr && pr.success && pathArr.length) {
                    pathText = pathArr.map(p => p.name || p.mode).join(' / ')
                    // path = [gốc, ..., cha, chính node] → cha = kế cuối
                    if (pathArr.length >= 2) dbParentMrid = pathArr[pathArr.length - 2].mrid || null
                }
            } catch (e) { /* path lỗi không chặn flow */ }
        }

        // Cha DỰ KIẾN sau import: cha trong file, hoặc targetMrid nếu là gốc nhánh ghép.
        const intendedParent = it.parentMrid || targetMrid

        // mode kỳ vọng từ type trong file (để phát hiện trùng mrid nhưng KHÁC LOẠI)
        const expectMode = (t) => {
            if (t === 'job') return 'job'
            if (['organisation', 'substation', 'voltageLevel', 'bay'].includes(t)) return t
            return 'asset'
        }

        // TRÙNG NHƯNG Ở NHÁNH KHÁC → auto "create new", không cần hỏi.
        // Chỉ auto khi biết CHẮC cả 2 cha và chúng KHÁC nhau; thiếu thông tin → hỏi (an toàn).
        let autoNew = !!(intendedParent && dbParentMrid && intendedParent !== dbParentMrid)

        // TRÙNG mrid nhưng KHÁC LOẠI (file: asset, DB: bay...) → overwrite sẽ phá record
        // khác loại. Coi là danh tính khác → auto new (app lớn: id trùng khác kind = new).
        if (ex.mode && ex.mode !== expectMode(it.type)) autoNew = true

        // JOB: import luôn regen id (importJobNode) — Overwrite/Use existing không được
        // hỗ trợ thật cho job → đưa vào dialog chỉ gây hiểu lầm. Auto new luôn.
        if (it.type === 'job') autoNew = true

        conflicts.push({
            mrid: it.mrid,
            type: it.type,
            asset: it.asset,
            nameInFile: it.name,
            existsAt: { mode: ex.mode, name: ex.name, pathText, parentMrid: dbParentMrid },
            intendedParent,
            autoNew,
            node: it._ref,        // node trong cây để gắn action
        })
    }

    // CASCADE: cha auto-new (mrid mới) ⇒ con trùng cũng chắc chắn khác nhánh
    // (cha mới chưa từng tồn tại) → auto-new theo. items đi theo thứ tự cây
    // (cha trước con) nên duyệt xuôi + set là đủ.
    const autoSet = new Set(conflicts.filter(c => c.autoNew).map(c => c.mrid))
    for (const c of conflicts) {
        if (!c.autoNew && c.intendedParent && autoSet.has(c.intendedParent)) {
            c.autoNew = true
            autoSet.add(c.mrid)
        }
    }

    // DEDUPE: cùng mrid xuất hiện nhiều lần trong file (file gộp/export lặp)
    // → chỉ giữ 1 entry cho dialog; quyết định áp chung theo mrid.
    // Nếu BẤT KỲ instance nào autoNew → coi cả mrid là autoNew (an toàn: new không phá gì).
    const byMrid = new Map()
    for (const c of conflicts) {
        const prev = byMrid.get(c.mrid)
        if (!prev) byMrid.set(c.mrid, c)
        else if (c.autoNew && !prev.autoNew) prev.autoNew = true
    }
    const dedupedConflicts = Array.from(byMrid.values())

    return { conflicts: dedupedConflicts, items }
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