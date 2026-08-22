/**
 * DANH SÁCH ĐẦU CỰC CỦA TỪNG LOẠI THIẾT BỊ.
 *
 * Tách khỏi `terminalSelect.js` vì hai việc khác hẳn nhau: bên kia là mã hoá chuỗi (không
 * biết gì về thiết bị), bên này là đọc hồ sơ thiết bị để biết có những đầu cực nào.
 *
 * ─── VÌ SAO PHẢI ĐỌC ĐƯỢC CẢ HAI DẠNG DỮ LIỆU ───────────────────────────────
 *
 * Cùng một thiết bị được truyền vào dưới hai hình khác nhau tuỳ chỗ gọi:
 *
 *   mở tab job     -> DTO   (asset.ctConfiguration.dataCT, asset.vt_Configuration.dataVT)
 *   hộp thoại thêm -> entity thô từ CSDL (asset.CtTapInfo, asset.OldPotentialTransformerInfo)
 *
 * Chỉ đọc một dạng thì danh sách sẽ rỗng ở nửa số chỗ gọi, mà biểu hiện là dropdown trống
 * trơn chứ không phải lỗi — rất khó lần ra.
 */

const str = (v) => (v === null || v === undefined) ? '' : String(v)

/** Vài chỗ lưu cấu hình dưới dạng chuỗi JSON. */
const parseMaybeJson = (value) => {
    if (!value) return null
    if (typeof value === 'object') return value
    try { return JSON.parse(value) } catch (e) { return null }
}

const dedupe = (list) => {
    const seen = new Set()
    const out = []
    for (const item of list) {
        const key = str(item).trim()
        if (!key || seen.has(key.toUpperCase())) continue
        seen.add(key.toUpperCase())
        out.push(key)
    }
    return out
}

// ─── MÁY BIẾN DÒNG ──────────────────────────────────────────────────────────

/**
 * Prim, Sec, GND, rồi 'Core 1 Sec'… theo SỐ LÕI của thiết bị.
 *
 * Số lõi đọc theo thứ tự ưu tiên: số phần tử thật trong dataCT > trường `cores` > số lõi
 * suy từ CtTapInfo. Lấy số phần tử thật trước vì `cores` chỉ là con số người dùng chọn
 * trên màn hình, có thể lệch với bảng đã dựng.
 */
export const buildCurrentTransformerTerminals = (asset) => {
    const base = ['Prim', 'Sec', 'GND']
    if (!asset) return base

    const config = parseMaybeJson(asset.ctConfiguration)
    let coreCount = 0

    if (config && Array.isArray(config.dataCT) && config.dataCT.length > 0) {
        coreCount = config.dataCT.length
    } else if (config && config.cores) {
        coreCount = parseInt(config.cores, 10) || 0
    } else if (Array.isArray(asset.CtCoreInfo)) {
        coreCount = asset.CtCoreInfo.length
    } else if (Array.isArray(asset.CtTapInfo)) {
        // Entity thô không có bảng lõi riêng; suy từ chỉ số lõi lớn nhất của các tap.
        coreCount = asset.CtTapInfo.reduce((max, tap) => {
            const n = parseInt(tap && tap.core_index, 10)
            return Number.isFinite(n) && n > max ? n : max
        }, 0)
    }

    if (!Number.isFinite(coreCount) || coreCount < 1) return base
    // Chặn trên: màn hình cấu hình chỉ cho tới 9 lõi. Dữ liệu hỏng mà cho chạy tự do thì
    // dropdown dựng ra hàng nghìn mục và màn hình đứng.
    const safeCount = Math.min(coreCount, 9)

    const cores = []
    for (let i = 1; i <= safeCount; i++) cores.push(`Core ${i} Sec`)
    return dedupe([...base, ...cores])
}

// ─── MÁY BIẾN ĐIỆN ÁP ───────────────────────────────────────────────────────

/** Tên mặc định của cuộn dây thứ `index` (đếm từ 0) — giống hệt màn hình cấu hình VT. */
export const defaultVtWindingName = (index) => `${index + 1}a${index + 1}n`

/**
 * Prim, Sec, GND, rồi TÊN CUỘN DÂY do người dùng đặt.
 *
 * Tên lấy từ `dataVT[].name`; chưa đặt thì dùng tên mặc định, đúng như màn hình cấu hình
 * VT đang làm (`item.name || defaultWindingName(index)`). Hai nơi phải cho ra cùng một
 * chuỗi, nếu không thì tên trong test và tên trong hồ sơ thiết bị nhìn khác nhau dù chưa
 * ai sửa gì.
 */
export const buildVoltageTransformerTerminals = (asset) => {
    const base = ['Prim', 'Sec', 'GND']
    if (!asset) return base

    const config = parseMaybeJson(asset.vt_Configuration) || parseMaybeJson(asset.vtConfiguration)
    const info = parseMaybeJson(asset.OldPotentialTransformerInfo)

    if (config && Array.isArray(config.dataVT) && config.dataVT.length > 0) {
        const names = config.dataVT.map((w, i) => str(w && w.name).trim() || defaultVtWindingName(i))
        return dedupe([...base, ...names])
    }

    // Không có bảng cuộn dây thì chỉ biết SỐ LƯỢNG — dựng tên mặc định.
    const rawCount = (config && config.windings) || (info && info.windings)
    const count = parseInt(rawCount, 10) || 2
    const names = []
    for (let i = 0; i < Math.min(count, 9); i++) names.push(defaultVtWindingName(i))
    return dedupe([...base, ...names])
}

/**
 * Đổi tên một cuộn dây, ghi thẳng vào DTO thiết bị đang mở.
 *
 * Sửa TRONG BỘ NHỚ, không tự gọi API. Tên mới xuống CSDL khi người dùng bấm Save job —
 * cùng một lần bấm ghi cả job lẫn thiết bị. Ghi ngay lúc gõ thì người dùng huỷ job xong
 * mà tên thiết bị đã đổi, hai bên lệch nhau mà không ai chủ ý.
 *
 * @returns {boolean} true nếu thật sự có đổi
 */
export const renameVtWinding = (asset, oldName, newName) => {
    const wanted = str(newName).trim()
    const current = str(oldName).trim()
    if (!asset || !wanted || wanted === current) return false

    const config = parseMaybeJson(asset.vt_Configuration) || parseMaybeJson(asset.vtConfiguration)
    if (!config || !Array.isArray(config.dataVT)) return false

    for (let i = 0; i < config.dataVT.length; i++) {
        const winding = config.dataVT[i]
        const name = str(winding && winding.name).trim() || defaultVtWindingName(i)
        if (name.toUpperCase() !== current.toUpperCase()) continue
        winding.name = wanted
        return true
    }
    return false
}

// ─── CHỐNG SÉT VAN / CÁP LỰC ────────────────────────────────────────────────

export const PHASE_TERMINALS = ['A', 'B', 'C', 'GND', 'Base']

/**
 * Màu theo quy ước pha: A đỏ, B vàng, C xanh. GND và Base không màu.
 *
 * Trả về mã màu chứ không phải tên lớp CSS, để chỗ dùng tự quyết định tô vào đâu.
 * `null` nghĩa là KHÔNG tô — khác với "tô màu mặc định".
 */
export const PHASE_COLORS = {
    A: '#e53935',
    B: '#f9a825',
    C: '#2e7d32',
    GND: null,
    Base: null,
}

export const buildPhaseTerminals = () => [...PHASE_TERMINALS]

export default {
    buildCurrentTransformerTerminals,
    buildVoltageTransformerTerminals,
    defaultVtWindingName,
    renameVtWinding,
    buildPhaseTerminals,
    PHASE_TERMINALS,
    PHASE_COLORS,
}
