/**
 * CHUẨN HOÁ Ô ĐƠN VỊ TRƯỚC KHI GỬI LÊN MÁY CHỦ.
 *
 * ─── LỖI ĐÃ GẶP ─────────────────────────────────────────────────────────────
 *
 *   [VALIDATE_ERROR_0037] Value "null|Hz" is not a valid FrequencyUnitEnum
 *   [SURGE_ERROR_0017] Duration unit in item 1 is invalid
 *
 * Đơn vị của client lưu dạng `<bội>|<đơn vị>`, ví dụ `k|V`. Khi KHÔNG có bội thì phải là
 * `V` trơn. Nhưng trong CSDL đang có những ô ghi thẳng chữ `null` vào chỗ bội — `null|Hz`,
 * `null|s`. Đưa nguyên lên máy chủ thì nó từ chối, và cả cây thiết bị không đẩy lên được.
 *
 * Bên surge còn khó thấy hơn: hàm `joinUnit` bỏ dấu `|` rồi nối liền, nên
 *
 *      'm|s'    -> 'ms'      hợp lệ
 *      'null|s' -> 'nulls'   máy chủ báo "đơn vị không hợp lệ", không hé lộ chữ null
 *
 * ─── VÌ SAO SỬA Ở DTO CHỨ KHÔNG SỬA Ở PAYLOAD ───────────────────────────────
 *
 * Mỗi loại thiết bị đóng gói payload một kiểu và đặt tên trường đơn vị một kiểu
 * (`unit`, `voltageUnit`, `ratedDurationUnit`…), lại còn biến đổi giá trị trên đường đi
 * như `joinUnit`. Sửa ở payload là phải đuổi theo từng biến thể.
 *
 * DTO thì ngược lại: mọi ô đơn vị đều là thuộc tính tên `unit` với cùng một quy ước
 * `<bội>|<đơn vị>`. Sửa ở đây một lần, các mapper phía sau nhận đầu vào sạch và tự chạy
 * đúng.
 *
 * ─── ĐÂY LÀ BĂNG DÁN, KHÔNG PHẢI THUỐC ──────────────────────────────────────
 *
 * Nó chặn dữ liệu hỏng đi lên máy chủ, nhưng KHÔNG sửa dữ liệu đang nằm trong CSDL —
 * xuất JSON, tìm kiếm, hiển thị vẫn thấy chuỗi hỏng. Dọn CSDL bằng
 * `tools/fix-bad-units.sql`.
 *
 * Và nó CỐ Ý ghi log từng ô đã sửa: tôi rà hết mapper phía client mà không tìm ra chỗ nào
 * còn sinh ra `null|`, nên nguồn thật vẫn chưa rõ. Sửa im lặng là mất luôn manh mối cuối.
 */

/** Tiền tố coi như "không có bội" — đều là hậu quả của việc nối chuỗi với giá trị rỗng. */
const BAD_PREFIXES = ['null|', 'undefined|', 'NaN|', 'none|', '|']

/** Cả chuỗi chỉ là một từ vô nghĩa thì coi như không có đơn vị. */
const BAD_WHOLE = ['null', 'undefined', 'NaN']

/**
 * Trả về đơn vị đã sạch, hoặc chính nó nếu vốn đã sạch.
 * @returns {{ value, changed }}
 */
export const normaliseUnit = (raw) => {
    if (typeof raw !== 'string') return { value: raw, changed: false }
    const text = raw.trim()
    if (text === '') return { value: raw, changed: false }

    if (BAD_WHOLE.includes(text)) return { value: '', changed: true }

    for (const prefix of BAD_PREFIXES) {
        if (text.startsWith(prefix)) {
            // Cắt phần bội hỏng, giữ lại đơn vị thật: 'null|Hz' -> 'Hz'
            const rest = text.slice(prefix.length).trim()
            return { value: BAD_WHOLE.includes(rest) ? '' : rest, changed: true }
        }
    }
    // Đuôi treo: 'k|' — có bội mà không có đơn vị thì bản thân nó đã vô nghĩa,
    // trả rỗng còn hơn gửi lên một chuỗi máy chủ chắc chắn không hiểu.
    if (text.endsWith('|')) return { value: '', changed: true }

    return { value: raw, changed: false }
}

/**
 * Đi khắp DTO, sửa mọi thuộc tính tên `unit` (và `*Unit`).
 *
 * Sửa TẠI CHỖ vì DTO ở đây là bản đã dựng riêng cho lần upload, không phải bản màn hình
 * đang hiển thị. Nhân bản sâu một DTO thiết bị là chuyện tốn kém mà không đổi lấy được gì.
 *
 * @param {object} root  DTO cần chuẩn hoá
 * @param {string} label tên thiết bị, chỉ để ghi log cho dễ tra
 * @returns {Array} danh sách ô đã sửa: [{ path, from, to }]
 */
export const normaliseUnitsDeep = (root, label = '') => {
    const fixed = []
    const seen = new Set()

    const walk = (node, path) => {
        if (!node || typeof node !== 'object') return
        // Vòng tham chiếu: DTO có chỗ trỏ ngược lên cha. Không chặn thì đệ quy vô hạn.
        if (seen.has(node)) return
        seen.add(node)

        if (Array.isArray(node)) {
            node.forEach((item, i) => walk(item, `${path}[${i}]`))
            return
        }

        for (const key of Object.keys(node)) {
            const value = node[key]
            const isUnitKey = key === 'unit' || (key.length > 4 && key.endsWith('Unit'))
            if (isUnitKey && typeof value === 'string') {
                const rs = normaliseUnit(value)
                if (rs.changed) {
                    node[key] = rs.value
                    fixed.push({ path: `${path}.${key}`, from: value, to: rs.value })
                }
                continue
            }
            if (value && typeof value === 'object') walk(value, `${path}.${key}`)
        }
    }

    walk(root, label || 'dto')

    if (fixed.length > 0) {
        // Cảnh báo chứ không im: đây là dữ liệu HỎNG trong CSDL, chỉ được che lại lúc gửi.
        console.warn(
            `[unit] ${label || 'DTO'}: da sua ${fixed.length} o don vi hong truoc khi upload ` +
            `(du lieu trong CSDL VAN HONG — chay tools/fix-bad-units.sql de don):`,
            fixed
        )
    }
    return fixed
}

export default { normaliseUnit, normaliseUnitsDeep }
